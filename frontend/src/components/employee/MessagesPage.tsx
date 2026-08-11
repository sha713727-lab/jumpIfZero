"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { EmployeeDomainGate } from "@/components/employee/EmployeeDomainGate";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import { useEmployee } from "@/components/employee/EmployeeProvider";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { adminFieldClass } from "@/components/admin/AdminFormModal";
import type { AdminMessage, AdminSalesMessage } from "@/lib/data/admin";
import {
  createDeliveryMessageAction,
  markDeliveryMessageReadAction,
  uploadDeliveryFileAction,
} from "@/lib/submitEmployeeDelivery";
import {
  createSalesMessageAction,
  markSalesMessageReadAction,
} from "@/lib/submitCrm";

const cardClass =
  "grid overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)] lg:grid-cols-[18rem_1fr]";

function messagePreview(message: AdminMessage): string {
  if (message.body.trim().length > 0) {
    return message.body;
  }
  if (message.attachments.length > 0) {
    return message.attachments.map((item) => item.name).join(", ");
  }
  return "";
}

type PendingFile = {
  readonly id: string;
  readonly name: string;
};

function DeliveryMessagesPage() {
  const { state, setMessages } = useEmployee();
  const formId = useId();
  const fileInputId = useId();
  const threadEndRef = useRef<HTMLDivElement>(null);
  const markedRef = useRef<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const threads = state.clients
    .map((client) => {
      const messages = state.messages
        .filter((m) => m.clientId === client.id)
        .slice()
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const latest = messages[messages.length - 1];
      const unread = messages.filter(
        (m) => !m.read && m.from === "client",
      ).length;

      return { client, messages, latest, unread };
    })
    .filter((thread) => thread.latest);

  const [selectedClientId, setSelectedClientId] = useState(
    threads[0]?.client.id ?? "",
  );
  const [draft, setDraft] = useState("");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  const selectedThread = threads.find(
    (thread) => thread.client.id === selectedClientId,
  );

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages.length, pendingFiles.length]);

  useEffect(() => {
    if (!selectedClientId || !selectedThread) {
      return;
    }

    const unread = selectedThread.messages.filter(
      (message) =>
        message.from === "client" &&
        !message.read &&
        !markedRef.current.has(message.id),
    );
    if (unread.length === 0) {
      return;
    }

    void (async () => {
      const updates = new Map<string, AdminMessage>();
      for (const message of unread) {
        markedRef.current.add(message.id);
        const result = await markDeliveryMessageReadAction({ id: message.id });
        if (result.ok && "data" in result) {
          updates.set(message.id, result.data);
        }
      }
      if (updates.size === 0) {
        return;
      }
      setMessages(
        state.messages.map((message) => updates.get(message.id) ?? message),
      );
    })();
  }, [selectedClientId, selectedThread, setMessages, state.messages]);

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedClientId) {
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
      formData.set("clientId", selectedClientId);
      formData.set("kind", "chat");
      formData.set("file", file);
      const result = await uploadDeliveryFileAction(formData);
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

    if ((!body && pendingFiles.length === 0) || !selectedClientId) {
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await createDeliveryMessageAction({
        clientId: selectedClientId,
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
      <EmployeePageHeader
        title="Messages"
        lede="Conversations with your assigned clients."
      />

      <div className={cardClass} aria-busy={pending || uploading}>
        <ul className="divide-y divide-black/8 border-b border-black/8 lg:border-r lg:border-b-0">
          {threads.map(({ client, latest, unread }) => {
            const active = client.id === selectedClientId;

            return (
              <li key={client.id}>
                <button
                  type="button"
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                    active ? "bg-[rgba(92,104,73,0.1)]" : "hover:bg-[#f3f5ef]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[0.88rem] font-bold text-[#0d120b]">
                      {client.company}
                    </p>
                    {unread > 0 ? (
                      <span className="size-2 shrink-0 rounded-full bg-logo-gradient" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[0.72rem] font-medium text-black/40">
                    {latest?.at}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[0.82rem] font-medium text-black/55">
                    {latest ? messagePreview(latest) : ""}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex min-h-[22rem] flex-col bg-[#fafbf8] p-5 md:p-6">
          {selectedThread ? (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {selectedThread.messages.map((message) => {
                  const isStaff =
                    message.from === "admin" || message.from === "employee";

                  return (
                    <ChatBubble
                      key={message.id}
                      align={isStaff ? "self" : "other"}
                      body={message.body}
                      meta={`${
                        message.from === "client"
                          ? selectedThread.client.name
                          : message.from === "employee"
                            ? "You"
                            : "Admin"
                      } · ${message.at}`}
                      attachments={message.attachments.map((item) => ({
                        fileId: item.fileId,
                        name: item.name,
                      }))}
                    />
                  );
                })}
                <div ref={threadEndRef} />
              </div>

              <form
                id={formId}
                onSubmit={onSend}
                className="mt-4 space-y-3 rounded-2xl border-2 border-secondary bg-white p-3 shadow-[0_4px_16px_rgba(47,58,40,0.04)] focus-within:border-brand"
              >
                {error ? (
                  <p
                    role="alert"
                    className="text-[0.8rem] font-semibold text-[#8a2f2f]"
                  >
                    {error}
                  </p>
                ) : null}
                {pendingFiles.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {pendingFiles.map((file) => (
                      <li
                        key={file.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#f3f5ef] px-2.5 py-1.5 text-[0.78rem] font-semibold text-[#0d120b]"
                      >
                        <span className="max-w-[10rem] truncate">
                          {file.name}
                        </span>
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
                <textarea
                  rows={3}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                  aria-label="Write a message"
                  className={`${adminFieldClass} resize-none`}
                />
                <div className="flex items-center justify-between gap-3">
                  <div>
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
                      className="inline-flex cursor-pointer rounded-xl border border-black/10 bg-white px-3.5 py-2 text-[0.82rem] font-bold text-[#0d120b] transition-colors hover:bg-[#f3f5ef]"
                    >
                      {uploading ? "Uploading…" : "Attach"}
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={pending || uploading}
                    className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream disabled:opacity-60"
                  >
                    {pending ? "Sending…" : "Send"}
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SalesMessagesPage() {
  const { state, setSalesMessages } = useEmployee();
  const formId = useId();
  const selfId = state.employee.id;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const peers = state.salesPeers;

  const threads = peers.map((peer) => {
    const messages = state.salesMessages
      .filter(
        (message) =>
          (message.fromRepId === selfId && message.toRepId === peer.id) ||
          (message.fromRepId === peer.id && message.toRepId === selfId),
      )
      .slice()
      .sort((a, b) => a.at.localeCompare(b.at));
    const latest = messages[messages.length - 1];
    const unread = messages.filter(
      (message) => message.toRepId === selfId && !message.read,
    ).length;

    return { peer, messages, latest, unread };
  });

  const [selectedPeerId, setSelectedPeerId] = useState(peers[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const markedReadRef = useRef(new Set<string>());

  const resolvedPeerId =
    peers.length === 0
      ? ""
      : peers.some((peer) => peer.id === selectedPeerId)
        ? selectedPeerId
        : (peers[0]?.id ?? "");

  if (resolvedPeerId !== selectedPeerId) {
    setSelectedPeerId(resolvedPeerId);
  }

  const selectedThread = threads.find(
    (thread) => thread.peer.id === selectedPeerId,
  );

  useEffect(() => {
    if (!selectedPeerId || !selectedThread) {
      return;
    }

    const unreadIds = selectedThread.messages
      .filter(
        (message) =>
          message.toRepId === selfId &&
          message.fromRepId === selectedPeerId &&
          !message.read &&
          !markedReadRef.current.has(message.id),
      )
      .map((message) => message.id);

    if (unreadIds.length === 0) {
      return;
    }

    for (const id of unreadIds) {
      markedReadRef.current.add(id);
    }

    let cancelled = false;
    void (async () => {
      const results = await Promise.all(
        unreadIds.map((id) => markSalesMessageReadAction({ id })),
      );
      if (cancelled) {
        return;
      }
      const updatedById = new Map(
        results
          .filter(
            (
              result,
            ): result is { ok: true; data: AdminSalesMessage } =>
              result.ok && "data" in result,
          )
          .map((result) => [result.data.id, result.data] as const),
      );
      for (const id of unreadIds) {
        if (!updatedById.has(id)) {
          markedReadRef.current.delete(id);
        }
      }
      if (updatedById.size === 0) {
        return;
      }
      setSalesMessages(
        state.salesMessages.map(
          (message) => updatedById.get(message.id) ?? message,
        ),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedPeerId, selectedThread, selfId, setSalesMessages, state.salesMessages]);

  const onSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();

    if (!body || !selectedPeerId || pending) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createSalesMessageAction({
        toRepId: selectedPeerId,
        body,
      });
      if (result.ok && "data" in result) {
        setSalesMessages([...state.salesMessages, result.data]);
        setDraft("");
        return;
      }
      setError(
        result.reason === "unauthorized"
          ? "Session expired. Sign in again and retry."
          : result.reason === "validation"
            ? "Message could not be sent. Check the peer and try again."
            : "Could not send message. Try again.",
      );
    });
  };

  if (peers.length === 0) {
    return (
      <div className="space-y-6">
        <EmployeePageHeader
          title="Messages"
          lede="1:1 chat with other active sales team members."
        />
        <p className="text-[0.95rem] font-medium text-black/50">
          No other active sales team members are available for chat.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="Messages"
        lede="1:1 chat with other active sales team members."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8 border-b border-black/8 lg:border-r lg:border-b-0">
          {threads.map(({ peer, latest, unread }) => {
            const active = peer.id === selectedPeerId;

            return (
              <li key={peer.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPeerId(peer.id);
                    setError(null);
                  }}
                  className={`w-full px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                    active ? "bg-[rgba(92,104,73,0.1)]" : "hover:bg-[#f3f5ef]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[0.88rem] font-bold text-[#0d120b]">
                      {peer.name}
                    </p>
                    {unread > 0 ? (
                      <span className="size-2 shrink-0 rounded-full bg-logo-gradient" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[0.72rem] font-medium text-black/40">
                    {latest?.at ?? peer.email}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[0.82rem] font-medium text-black/55">
                    {latest?.body ?? "No messages yet."}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex min-h-[20rem] flex-col bg-[#fafbf8] p-5 md:p-6">
          {selectedThread ? (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {selectedThread.messages.map((message) => {
                  const isSelf = message.fromRepId === selfId;

                  return (
                    <ChatBubble
                      key={message.id}
                      align={isSelf ? "self" : "other"}
                      body={message.body}
                      meta={`${isSelf ? "You" : selectedThread.peer.name} · ${message.at}`}
                      attachments={[]}
                    />
                  );
                })}
              </div>

              {error ? (
                <p className="mt-3 text-[0.82rem] font-semibold text-[#a33]" role="alert">
                  {error}
                </p>
              ) : null}

              <form id={formId} onSubmit={onSend} className="mt-4 flex gap-2">
                <input
                  className={adminFieldClass}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                  aria-label="Write a message"
                  disabled={pending}
                />
                <button
                  type="submit"
                  disabled={pending || draft.trim().length === 0}
                  className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream disabled:opacity-60"
                >
                  {pending ? "Sending…" : "Send"}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MessagesPage() {
  const { state } = useEmployee();

  if (state.employee.kind === "sales") {
    return (
      <EmployeeDomainGate domain="crm">
        <SalesMessagesPage />
      </EmployeeDomainGate>
    );
  }

  return (
    <EmployeeDomainGate domain="delivery">
      <DeliveryMessagesPage />
    </EmployeeDomainGate>
  );
}
