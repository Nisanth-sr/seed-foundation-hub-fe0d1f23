CREATE TABLE IF NOT EXISTS public.chatbot_user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  instruction text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chatbot_user_instruction_size CHECK (octet_length(instruction) <= 20000)
);

CREATE TABLE IF NOT EXISTS public.chatbot_source_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  content text NOT NULL,
  byte_size integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chatbot_source_name_size CHECK (char_length(file_name) BETWEEN 1 AND 255),
  CONSTRAINT chatbot_source_size CHECK (byte_size BETWEEN 1 AND 131072),
  CONSTRAINT chatbot_source_type CHECK (
    mime_type IN ('text/plain', 'text/markdown', 'text/csv', 'application/json')
  )
);

CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chatbot_conversation_owner_key UNIQUE (id, user_id),
  CONSTRAINT chatbot_conversation_title_size CHECK (char_length(title) <= 120)
);

CREATE TABLE IF NOT EXISTS public.chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chatbot_message_owner_fk
    FOREIGN KEY (conversation_id, user_id)
    REFERENCES public.chatbot_conversations (id, user_id)
    ON DELETE CASCADE,
  CONSTRAINT chatbot_message_size CHECK (char_length(content) <= 30000)
);

CREATE TABLE IF NOT EXISTS public.chatbot_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.chatbot_conversations(id) ON DELETE SET NULL,
  event text NOT NULL CHECK (char_length(event) <= 80),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chatbot_conversations_user_updated_idx
  ON public.chatbot_conversations (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS chatbot_messages_owner_created_idx
  ON public.chatbot_messages (user_id, conversation_id, created_at);
CREATE INDEX IF NOT EXISTS chatbot_source_files_user_created_idx
  ON public.chatbot_source_files (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS chatbot_activity_logs_user_created_idx
  ON public.chatbot_activity_logs (user_id, created_at DESC);

ALTER TABLE public.chatbot_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_source_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chatbot_conversations_owner_all ON public.chatbot_conversations;
CREATE POLICY chatbot_conversations_owner_all ON public.chatbot_conversations
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS chatbot_messages_owner_all ON public.chatbot_messages;
CREATE POLICY chatbot_messages_owner_all ON public.chatbot_messages
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.chatbot_conversations conversation
      WHERE conversation.id = conversation_id
        AND conversation.user_id = (SELECT auth.uid())
    )
  );

REVOKE ALL ON public.chatbot_user_settings FROM anon, authenticated;
REVOKE ALL ON public.chatbot_source_files FROM anon, authenticated;
REVOKE ALL ON public.chatbot_activity_logs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatbot_conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatbot_messages TO authenticated;
GRANT ALL ON public.chatbot_user_settings TO service_role;
GRANT ALL ON public.chatbot_source_files TO service_role;
GRANT ALL ON public.chatbot_conversations TO service_role;
GRANT ALL ON public.chatbot_messages TO service_role;
GRANT ALL ON public.chatbot_activity_logs TO service_role;
