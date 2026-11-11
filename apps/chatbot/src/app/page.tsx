import { requireUser } from "@/lib/auth";
import { ChatClient } from "@/components/chat-client";

export default async function ChatPage() {
  const user = await requireUser();
  return <ChatClient email={user.email ?? ""} />;
}
