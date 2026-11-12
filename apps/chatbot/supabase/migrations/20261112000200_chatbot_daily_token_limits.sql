ALTER TABLE public.chatbot_user_settings
  ADD COLUMN IF NOT EXISTS daily_token_limit bigint;

ALTER TABLE public.chatbot_user_settings
  DROP CONSTRAINT IF EXISTS chatbot_daily_token_limit_range;
ALTER TABLE public.chatbot_user_settings
  ADD CONSTRAINT chatbot_daily_token_limit_range
  CHECK (daily_token_limit IS NULL OR daily_token_limit BETWEEN 0 AND 10000000);

CREATE TABLE IF NOT EXISTS public.chatbot_daily_token_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  used_tokens bigint NOT NULL DEFAULT 0 CHECK (used_tokens >= 0),
  reserved_tokens bigint NOT NULL DEFAULT 0 CHECK (reserved_tokens >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date)
);

ALTER TABLE public.chatbot_daily_token_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chatbot_daily_token_usage FROM anon, authenticated;
GRANT ALL ON public.chatbot_daily_token_usage TO service_role;

CREATE OR REPLACE FUNCTION public.chatbot_reserve_daily_tokens(
  p_user_id uuid,
  p_usage_date date,
  p_estimated_prompt_tokens bigint,
  p_requested_completion_tokens integer
)
RETURNS TABLE (
  allowed boolean,
  max_completion_tokens integer,
  used_tokens bigint,
  daily_token_limit bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_used bigint;
  v_reserved bigint;
  v_limit bigint;
  v_completion integer;
BEGIN
  IF p_estimated_prompt_tokens < 0 OR p_requested_completion_tokens < 1 OR p_requested_completion_tokens > 8000 THEN
    RAISE EXCEPTION 'invalid token reservation';
  END IF;

  INSERT INTO public.chatbot_daily_token_usage (user_id, usage_date)
  VALUES (p_user_id, p_usage_date)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  SELECT daily_usage.used_tokens, daily_usage.reserved_tokens
  INTO v_used, v_reserved
  FROM public.chatbot_daily_token_usage AS daily_usage
  WHERE daily_usage.user_id = p_user_id AND daily_usage.usage_date = p_usage_date
  FOR UPDATE;

  SELECT settings.daily_token_limit
  INTO v_limit
  FROM public.chatbot_user_settings AS settings
  WHERE settings.user_id = p_user_id;

  IF v_limit IS NULL THEN
    v_completion := p_requested_completion_tokens;
  ELSE
    v_completion := LEAST(
      p_requested_completion_tokens,
      GREATEST(0, v_limit - v_used - v_reserved - p_estimated_prompt_tokens)::integer
    );
  END IF;

  IF v_completion < 1 THEN
    RETURN QUERY SELECT false, 0, v_used, v_limit;
    RETURN;
  END IF;

  UPDATE public.chatbot_daily_token_usage AS daily_usage
  SET reserved_tokens = daily_usage.reserved_tokens + p_estimated_prompt_tokens + v_completion,
      updated_at = now()
  WHERE daily_usage.user_id = p_user_id AND daily_usage.usage_date = p_usage_date;

  RETURN QUERY SELECT true, v_completion, v_used, v_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.chatbot_settle_daily_tokens(
  p_user_id uuid,
  p_usage_date date,
  p_reserved_tokens bigint,
  p_actual_tokens bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_reserved_tokens < 0 OR p_actual_tokens < 0 THEN
    RAISE EXCEPTION 'invalid token settlement';
  END IF;

  UPDATE public.chatbot_daily_token_usage AS daily_usage
  SET reserved_tokens = GREATEST(0, daily_usage.reserved_tokens - p_reserved_tokens),
      used_tokens = daily_usage.used_tokens + p_actual_tokens,
      updated_at = now()
  WHERE daily_usage.user_id = p_user_id AND daily_usage.usage_date = p_usage_date;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'token reservation not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.chatbot_reserve_daily_tokens(uuid, date, bigint, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.chatbot_settle_daily_tokens(uuid, date, bigint, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chatbot_reserve_daily_tokens(uuid, date, bigint, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.chatbot_settle_daily_tokens(uuid, date, bigint, bigint) TO service_role;
