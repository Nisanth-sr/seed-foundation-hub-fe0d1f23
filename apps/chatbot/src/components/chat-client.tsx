"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Menu, Plus, Sparkles } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Conversation = { id: string; title: string; updated_at: string };
type Message = { id: string; role: "user" | "assistant"; content: string };

export function ChatClient({ email }: { email: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshConversations = useCallback(async () => {
    const response = await fetch("/api/conversations");
    if (!response.ok) throw new Error("Could not load conversations");
    const data = await response.json() as { conversations: Conversation[] };
    setConversations(data.conversations);
  }, []);

  useEffect(() => {
    refreshConversations().catch((cause) => setError(cause instanceof Error ? cause.message : "Could not load conversations"));
  }, [refreshConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function openConversation(id: string) {
    setError("");
    setActiveId(id);
    setSidebarOpen(false);
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) throw new Error("Could not load this conversation");
      const data = await response.json() as { messages: Message[] };
      setMessages(data.messages);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load conversation");
    }
  }

  function startNewChat() {
    setActiveId("");
    setMessages([]);
    setDraft("");
    setError("");
    setSidebarOpen(false);
    textareaRef.current?.focus();
  }

  async function signOut() {
    const supabase = await createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.assign("/login");
  }

  async function sendMessage(event?: React.FormEvent) {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || busy) return;
    setDraft("");
    setError("");
    setBusy(true);
    const optimistic: Message = { id: crypto.randomUUID(), role: "user", content };
    const assistant: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
    setMessages((current) => [...current, optimistic, assistant]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeId || null, message: content }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error ?? "The assistant could not respond");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let responseText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const eventText of events) {
          const line = eventText.split("\n").find((candidate) => candidate.startsWith("data: "));
          if (!line) continue;
          const data = JSON.parse(line.slice(6)) as { delta?: string; conversationId?: string; error?: string; done?: boolean };
          if (data.error) throw new Error(data.error);
          if (data.conversationId) setActiveId(data.conversationId);
          if (data.delta) {
            responseText += data.delta;
            setMessages((current) => current.map((item) => item.id === assistant.id ? { ...item, content: responseText } : item));
          }
        }
      }
      await refreshConversations();
    } catch (cause) {
      setMessages((current) => current.filter((item) => item.id !== assistant.id));
      setError(cause instanceof Error ? cause.message : "The assistant could not respond");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="chat-layout">
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="brand"><span className="brand-mark">S</span><span>SEED Assistant</span></div>
        <button className="new-chat" onClick={startNewChat}><Plus size={16} style={{ verticalAlign: "middle", marginRight: 8 }} />New chat</button>
        <div className="sidebar-label">Your conversations</div>
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button key={conversation.id} className={`conversation${activeId === conversation.id ? " active" : ""}`} onClick={() => openConversation(conversation.id)} title={conversation.title}>
              {conversation.title || "New conversation"}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">{email}<button className="link-button" style={{ float: "right" }} onClick={signOut}>Sign out</button></div>
      </aside>
      <main className="main-panel">
        <header className="chat-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="mobile-menu" onClick={() => setSidebarOpen((open) => !open)} aria-label="Toggle conversation list"><Menu size={18} /></button>
            <span>SEED Assistant</span>
          </div>
          <span>Private conversation</span>
        </header>
        <section className="chat-content">
          {messages.length === 0 ? (
            <div className="welcome">
              <Sparkles className="welcome-mark" size={27} strokeWidth={1.5} />
              <h1>What would you like to work on?</h1>
              <p>Ask a question, explore an idea, or get help thinking through your next step.</p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message) => message.role === "user" ? (
                <div key={message.id} className="message user"><div className="message-text">{message.content}</div></div>
              ) : (
                <div key={message.id} className="message assistant"><span className="assistant-mark">S</span><div className="message-text">{message.content || (busy ? "…" : "")}</div></div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          {error && <div className="chat-error" role="alert">{error}</div>}
          <div className="composer-wrap">
            <form className="composer" onSubmit={sendMessage}>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Message SEED Assistant…"
                rows={1}
                maxLength={10000}
                aria-label="Message"
              />
              <button className="send-button" type="submit" disabled={!draft.trim() || busy} aria-label="Send message"><ArrowUp size={18} /></button>
            </form>
            <div className="disclaimer">AI can make mistakes. Check important information.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
