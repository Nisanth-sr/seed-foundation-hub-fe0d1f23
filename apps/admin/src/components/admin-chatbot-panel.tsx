"use client";

import { useEffect, useState } from "react";

type AdminUser = { id: string; email: string; displayName: string };
type SourceFile = { id: string; file_name: string; mime_type: string; byte_size: number; created_at: string };
type Conversation = { id: string; title: string; created_at: string; updated_at: string };
type ConversationMessage = { id: string; role: string; content: string; created_at: string };
type UserData = { instruction: string; sources: SourceFile[]; conversations: Conversation[] };
type ConversationData = { conversation: Conversation; messages: ConversationMessage[] };

export function AdminChatbotPanel({ users }: { users: AdminUser[] }) {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? "");
  const [data, setData] = useState<UserData | null>(null);
  const [instruction, setInstruction] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!selectedUserId) {
      setData(null);
      return;
    }
    let active = true;
    setBusy(true);
    setMessage("");
    setData(null);
    setInstruction("");
    setSelectedConversation(null);
    const query = new URLSearchParams();
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    fetch(`/api/chatbot/users/${selectedUserId}?${query.toString()}`)
      .then(async (response) => {
        const result = await response.json() as UserData & { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Could not load chatbot data");
        if (active) {
          setData(result);
          setInstruction(result.instruction);
        }
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load chatbot data");
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => { active = false; };
  }, [selectedUserId, from, to]);

  async function saveInstruction() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/chatbot/users/${selectedUserId}/instruction`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save instructions");
      setMessage("Instructions saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save instructions");
    } finally {
      setBusy(false);
    }
  }

  async function uploadSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = (new FormData(form)).get("file");
    if (!(file instanceof File) || !file.size) {
      setMessage("Choose a text, Markdown, CSV, or JSON file.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch(`/api/chatbot/users/${selectedUserId}/sources`, { method: "POST", body });
      const result = await response.json() as { error?: string; source?: SourceFile };
      if (!response.ok || !result.source) throw new Error(result.error ?? "Could not upload source file");
      setData((current) => current ? { ...current, sources: [result.source!, ...current.sources] } : current);
      form.reset();
      setMessage("Source file uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not upload source file");
    } finally {
      setBusy(false);
    }
  }

  async function removeSource(sourceId: string) {
    if (!window.confirm("Remove this source file from the user's assistant context?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/chatbot/users/${selectedUserId}/sources/${sourceId}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not remove source file");
      setData((current) => current ? { ...current, sources: current.sources.filter((source) => source.id !== sourceId) } : current);
      setMessage("Source file removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove source file");
    } finally {
      setBusy(false);
    }
  }

  async function viewConversation(conversationId: string) {
    setSelectedConversation(null);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/chatbot/users/${selectedUserId}/conversations/${conversationId}`);
      const result = await response.json() as ConversationData & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not load conversation");
      setSelectedConversation(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load conversation");
    } finally {
      setBusy(false);
    }
  }

  function download(format: "csv" | "json") {
    if (!selectedUserId) return;
    const query = new URLSearchParams({ userId: selectedUserId, format });
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    window.location.assign(`/api/chatbot/export?${query.toString()}`);
  }

  const fieldClass = "rounded-md border border-border bg-background px-3 py-2 text-sm";
  const buttonClass = "rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50";

  return (
    <div className="space-y-5">
      {message && <p className="rounded-md border border-border bg-background px-3 py-2 text-sm" role="status">{message}</p>}
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[minmax(220px,1fr)_180px_180px_auto_auto] md:items-end">
        <label className="grid gap-1.5 text-sm font-medium">
          User
          <select className={fieldClass} value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
            {users.map((user) => <option key={user.id} value={user.id}>{user.displayName} — {user.email}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">From<input className={fieldClass} type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label className="grid gap-1.5 text-sm font-medium">To<input className={fieldClass} type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        <button className={fieldClass} disabled={!selectedUserId} onClick={() => download("csv")}>Download CSV</button>
        <button className={fieldClass} disabled={!selectedUserId} onClick={() => download("json")}>Download JSON</button>
      </div>

      {!users.length && <p className="text-sm text-muted-foreground">No accounts are available.</p>}
      {busy && <p className="text-sm text-muted-foreground">Loading…</p>}
      {data && selectedUserId && (
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="space-y-5">
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 text-base font-semibold">Per-user instructions</h2>
              <textarea
                className="min-h-40 w-full rounded-md border border-border bg-background p-3 text-sm leading-6"
                maxLength={20000}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder="No additional instructions"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{instruction.length} characters (20 KB maximum)</span>
                <button className={buttonClass} disabled={busy} onClick={saveInstruction}>Save instructions</button>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-1 text-base font-semibold">Source files</h2>
              <p className="mb-4 text-xs text-muted-foreground">Plain text, Markdown, CSV, or JSON; up to 128 KiB per file.</p>
              <form className="mb-4 flex flex-wrap items-center gap-2" onSubmit={uploadSource}>
                <input className="min-w-0 flex-1 text-sm" name="file" type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" />
                <button className={buttonClass} disabled={busy} type="submit">Upload</button>
              </form>
              <div className="divide-y divide-border">
                {data.sources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="min-w-0 truncate" title={source.file_name}>{source.file_name}<span className="ml-2 text-xs text-muted-foreground">{Math.ceil(source.byte_size / 1024)} KB</span></span>
                    <button className="shrink-0 text-xs text-destructive hover:underline" disabled={busy} onClick={() => removeSource(source.id)}>Remove</button>
                  </div>
                ))}
                {!data.sources.length && <p className="py-3 text-sm text-muted-foreground">No source files.</p>}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold">Conversations</h2>
            <div className="max-h-[380px] divide-y divide-border overflow-auto">
              {data.conversations.map((conversation) => (
                <button key={conversation.id} className="block w-full py-3 text-left hover:bg-muted/50" onClick={() => viewConversation(conversation.id)}>
                  <span className="block truncate text-sm font-medium">{conversation.title || "New conversation"}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{new Date(conversation.created_at).toLocaleString()}</span>
                </button>
              ))}
              {!data.conversations.length && <p className="py-3 text-sm text-muted-foreground">No conversations in this date range.</p>}
            </div>
            {selectedConversation && (
              <div className="mt-4 border-t border-border pt-4">
                <h3 className="mb-3 text-sm font-semibold">{selectedConversation.conversation.title}</h3>
                <div className="max-h-[400px] space-y-3 overflow-auto">
                  {selectedConversation.messages.map((item) => (
                    <div key={item.id} className="rounded-md bg-muted/50 p-3">
                      <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{item.role} · {new Date(item.created_at).toLocaleString()}</div>
                      <div className="whitespace-pre-wrap break-words text-sm leading-6">{item.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
