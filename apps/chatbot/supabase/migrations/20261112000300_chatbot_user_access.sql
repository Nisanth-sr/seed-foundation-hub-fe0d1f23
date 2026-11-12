ALTER TABLE public.chatbot_user_settings
  ADD COLUMN IF NOT EXISTS chatbot_access_enabled boolean NOT NULL DEFAULT false;
