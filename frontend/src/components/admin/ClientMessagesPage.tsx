"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { adminEmptyCopy } from "@/constants/admin";
import type { AdminMessage } from "@/lib/data/admin";
import {
  createMessageAction,
  uploadFileAction,
} from "@/lib/submitOps";
import { EmptyState } from "@/components/ui/EmptyState";

function messageFromLabel(from: AdminMessage["from"]): string {
  if (from === "admin") {
    return "You";
  }
  if (from === "employee") {
    return "Staff";
  }
  return "Client";
}

function isStaffMessage(from: AdminMessage["from"]): boolean {
  return from === "admin" || from === "employee";
}

type PendingFile = {
  readonly id: string;
  readonly name: string;
};

export function ClientMessagesPage() {
  const params = useParams();
  const { state, setMessages } = useAdmin();
  const formId = useId();
  const fileInputId = useId();
  const threadEndRef = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = typeof params.id === "string" ? params.id : "";
  const client = state.clients.find((item) => item.id === clientId);
  const clientMessages = state.messages
    .filter((item) => item.clientId === clientId)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [clientMessages.length, pendingFiles.length]);

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !clientId) {
      return;
    }
    setError(null);
    setUploading(true);
    const next: PendingFile[] = [];
    for (const file of Array.from(files)) {
      if (pendingFiles.length + next.length >= 10) {
        break;
      }
      const formData = new FormData();
      formData.set("clientId", clientId);
      formData.set("kind", "chat");
      formData.set("file", file);
      const result = await uploadFileAction(formData);
      if (!result.ok || !("data" in result)) {
        setError("Could not attach file. Try again.");
        break;
      }
      next.push({ id: result.data.id, name: result.data.name });
    }
    if (next.length > 0) {
      setPendingFiles((current) => [...current, ...next]);
    }
    setUploading(false);
  };

  const onSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if ((!body && pendingFiles.length === 0) || !clientId) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await createMessageAction({
        clientId,
        body,
        fileIds: pendingFiles.map((item) => item.id),
      });
      if (result.ok && "data" in result) {
        setMessages([...state.messages, result.data]);
        setDraft("");
        setPendingFiles([]);
        return;
      }
      setError("Could not send message. Try again.");
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        lede={
          client
            ? `Conversation with ${client.company}.`
            : "Thread with this client account."
        }
      />

      <div
        className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)]"
        aria-busy={pending || uploading}
      >
        <div className="flex items-center justify-between gap-3 border-b border-black/8 bg-[#f7f8f4] px-5 py-4">
          <div>
            <p className="text-[0.95rem] font-extrabold tracking-[-0.02em] text-[#0d120b]">
              {client?.company ?? "Client"}
            </p>
            <p className="mt-0.5 text-[0.78rem] font-medium text-black/45">
              {client?.name ? `${client.name} · Client chat` : "Client chat"}
            </p>
          </div>
          <span className="rounded-full bg-[rgba(92,104,73,0.14)] px-2.5 py-1 text-[0.7rem] font-bold text-brand">
            {clientMessages.length} message{clientMessages.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex min-h-[28rem] flex-col bg-[linear-gradient(180deg,#f3f5ef_0%,#fafbf8_40%,#f7f5f0_100%)]">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
            {clientMessages.length === 0 ? (
              <EmptyState message={adminEmptyCopy.clientMessages} />
            ) : (
              clientMessages.map((message) => {
                const staff = isStaffMessage(message.from);
                return (
                  <ChatBubble
                    key={message.id}
                    align={staff ? "self" : "other"}
                    body={message.body}
                    meta={`${messageFromLabel(message.from)} · ${message.at}`}
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
            {error ? (
              <p
                role="alert"
                className="mb-3 text-[0.8rem] font-semibold text-[#8a2f2f]"
              >
                {error}
              </p>
            ) : null}
            {pendingFiles.length > 0 ? (
              <ul className="mb-3 flex flex-wrap gap-2">
                {pendingFiles.map((file) => (
                  <li
                    key={file.id}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f3f5ef] px-3 py-1.5 text-[0.78rem] font-semibold text-[#0d120b]"
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
            <div className="flex items-end gap-2 rounded-2xl border border-black/10 bg-[#f7f8f4] p-2.5 focus-within:border-brand/40 focus-within:shadow-[0_0_0_3px_rgba(92,104,73,0.12)]">
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
                placeholder="Write a reply…"
                aria-label="Reply as admin"
                className="min-h-[2.75rem] flex-1 resize-none border-0 bg-transparent px-2 py-2 text-[0.92rem] font-medium text-[#0d120b] outline-none"
              />
              <button
                type="submit"
                disabled={pending || uploading}
                className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
