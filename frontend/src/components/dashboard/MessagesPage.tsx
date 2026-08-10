"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import {
  markMessageReadAction,
  sendMessageAction,
  uploadFileAction,
} from "@/lib/submitCustomerPortal";
import { dashboardEmptyCopy } from "@/lib/data/dashboard";
import { EmptyState } from "@/components/ui/EmptyState";

type PendingFile = {
  readonly id: string;
  readonly name: string;
};

export function MessagesPage() {
  const formId = useId();
  const fileInputId = useId();
  const threadEndRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef<Set<string>>(new Set());
  const { state, setMessages } = useDashboard();
  const rows = [...state.messages].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rows.length, pendingFiles.length]);

  useEffect(() => {
    const unread = rows.filter(
      (row) =>
        row.unread &&
        row.senderRole !== "client" &&
        !markedRef.current.has(row.id),
    );
    if (unread.length === 0) {
      return;
    }
    void (async () => {
      const updates = new Map<string, (typeof rows)[number]>();
      for (const message of unread) {
        markedRef.current.add(message.id);
        const result = await markMessageReadAction({ id: message.id });
        if (result.ok && "data" in result) {
          updates.set(message.id, result.data);
        }
      }
      if (updates.size === 0) {
        return;
      }
      setMessages(
        state.messages.map((row) => updates.get(row.id) ?? row),
      );
    })();
  }, [rows, setMessages, state.messages]);

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setUploading(true);
    setNotice(null);
    const next: PendingFile[] = [];
    for (const file of Array.from(files)) {
      if (pendingFiles.length + next.length >= 10) {
        break;
      }
      const formData = new FormData();
      formData.set("kind", "chat");
      formData.set("file", file);
      const result = await uploadFileAction(formData);
      if (!result.ok || !("data" in result)) {
        setNotice("Could not attach file. Try again.");
        break;
      }
      next.push({ id: result.data.id, name: result.data.name });
    }
    if (next.length > 0) {
      setPendingFiles((current) => [...current, ...next]);
    }
    setUploading(false);
  };

  const onSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();

    if ((!text && pendingFiles.length === 0) || sending || uploading) {
      return;
    }

    setSending(true);
    setNotice(null);
    const result = await sendMessageAction({
      body: text,
      fileIds: pendingFiles.map((item) => item.id),
    });
    setSending(false);

    if (!result.ok) {
      setNotice("Could not send your message. Try again.");
      return;
    }

    setMessages([...state.messages, result.data]);
    setDraft("");
    setPendingFiles([]);
    setNotice("Message sent to your account team.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          Messages
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          Chat with your JZ account team.
        </p>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-brand/25 bg-[rgba(92,104,73,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
        >
          {notice}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]">
        <div className="border-b border-black/8 bg-[#f7f8f4] px-5 py-4">
          <p className="text-[0.95rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
            Account team
          </p>
          <p className="mt-0.5 text-[0.78rem] font-medium text-black/45">
            Direct support conversation
          </p>
        </div>

        <div className="flex min-h-[28rem] flex-col bg-[linear-gradient(180deg,#f3f5ef_0%,#fafbf8_40%,#f7f5f0_100%)]">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
            {rows.length === 0 ? (
              <EmptyState message={dashboardEmptyCopy.messages} />
            ) : (
              rows.map((message) => {
                const self = message.senderRole === "client";
                return (
                  <ChatBubble
                    key={message.id}
                    align={self ? "self" : "other"}
                    body={message.body}
                    meta={`${self ? "You" : message.from} · ${message.time}`}
                    attachments={message.attachments.map((item) => ({
                      fileId: item.fileId,
                      name: item.name,
                    }))}
                  />
                );
              })
            )}
            <div ref={threadEndRef} />
          </div>

          <form
            id={formId}
            onSubmit={onSend}
            className="border-t border-black/8 bg-white/95 px-4 py-4 backdrop-blur md:px-6"
          >
            {pendingFiles.length > 0 ? (
              <ul className="mb-3 flex flex-wrap gap-2">
                {pendingFiles.map((file) => (
                  <li
                    key={file.id}
                    className="inline-flex items-center gap-2 rounded-full bg-[rgba(92,104,73,0.1)] px-3 py-1.5 text-[0.78rem] font-semibold text-[#0d120b]"
                  >
                    <span className="max-w-[10rem] truncate">{file.name}</span>
                    <button
                      type="button"
                      className="text-black/45 hover:text-[#0d120b]"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setPendingFiles((current) =>
                          current.filter((item) => item.id !== file.id),
                        )
                      }
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex items-end gap-2 rounded-2xl border-2 border-secondary bg-[#f7f8f4] p-2.5 focus-within:border-brand">
              <input
                id={fileInputId}
                type="file"
                className="sr-only"
                multiple
                onChange={(event) => {
                  void onPickFiles(event.target.files);
                  event.target.value = "";
                }}
              />
              <label
                htmlFor={fileInputId}
                className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-black/10 bg-white text-[0.82rem] font-bold text-[#0d120b] transition-colors hover:bg-[#eef1ea]"
                title="Attach files"
              >
                {uploading ? "…" : "+"}
              </label>
              <textarea
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write a message…"
                aria-label="Write a message"
                className="min-h-[2.75rem] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[0.92rem] font-medium text-[#0d120b] outline-none"
              />
              <button
                type="submit"
                disabled={sending || uploading}
                className="shrink-0 rounded-xl bg-logo-gradient px-4 py-2.5 text-[0.82rem] font-extrabold text-[#0d120b] disabled:opacity-70"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
