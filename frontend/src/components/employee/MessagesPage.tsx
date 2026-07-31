"use client";

import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { EmployeePageHeader } from "@/components/employee/EmployeePageHeader";
import {
  employeeTodayLabel,
  useEmployeeDemo,
} from "@/components/employee/EmployeeDemoProvider";
import { adminFieldClass } from "@/components/admin/AdminFormModal";
import type { AdminMessage, AdminSalesMessage } from "@/constants/adminDemo";

const cardClass =
  "grid overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)] lg:grid-cols-[18rem_1fr]";

function messageTimestamp(): string {
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

  return `${employeeTodayLabel()} · ${time}`;
}

function DeliveryMessagesPage() {
  const { state, setMessages } = useEmployeeDemo();
  const formId = useId();

  const threads = state.clients
    .map((client) => {
      const messages = state.messages.filter((m) => m.clientId === client.id);
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

  const selectedThread = threads.find(
    (thread) => thread.client.id === selectedClientId,
  );

  useEffect(() => {
    if (!selectedClientId || !selectedThread) {
      return;
    }

    const hasUnread = selectedThread.messages.some(
      (message) => message.from === "client" && !message.read,
    );

    if (!hasUnread) {
      return;
    }

    setMessages(
      state.messages.map((message) =>
        message.clientId === selectedClientId && message.from === "client"
          ? { ...message, read: true }
          : message,
      ),
    );
  }, [selectedClientId, selectedThread, setMessages, state.messages]);

  const onSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();

    if (!body || !selectedClientId) {
      return;
    }

    const next: AdminMessage = {
      id: crypto.randomUUID(),
      clientId: selectedClientId,
      from: "employee",
      body,
      at: messageTimestamp(),
      read: true,
    };

    setMessages([...state.messages, next]);
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        title="Messages"
        lede="Conversations with your assigned clients."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8 border-b border-black/8 lg:border-r lg:border-b-0">
          {threads.map(({ client, latest, unread }) => {
            const active = client.id === selectedClientId;

            return (
              <li key={client.id}>
                <button
                  type="button"
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                    active ? "bg-[rgba(116,129,95,0.1)]" : "hover:bg-[#f3f5ef]"
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
                    {latest?.body}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex min-h-[20rem] flex-col p-5 md:p-6">
          {selectedThread ? (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto">
                {selectedThread.messages.map((message) => {
                  const isStaff =
                    message.from === "admin" || message.from === "employee";

                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isStaff
                          ? "ml-auto bg-brand text-cream"
                          : "bg-[#f3f5ef] text-[#0d120b]"
                      }`}
                    >
                      <p className="text-[0.88rem] font-medium leading-relaxed">
                        {message.body}
                      </p>
                      <p
                        className={`mt-1 text-[0.72rem] font-medium ${
                          isStaff ? "text-cream/70" : "text-black/40"
                        }`}
                      >
                        {message.from === "client"
                          ? selectedThread.client.name
                          : message.from === "employee"
                            ? "You"
                            : "Admin"}{" "}
                        · {message.at}
                      </p>
                    </div>
                  );
                })}
              </div>

              <form id={formId} onSubmit={onSend} className="mt-4 flex gap-2">
                <input
                  className={adminFieldClass}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
                >
                  Send
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SalesMessagesPage() {
  const { state, setSalesMessages } = useEmployeeDemo();
  const formId = useId();
  const selfId = state.employee.id;

  const peers = state.salesPeers;

  const threads = peers.map((peer) => {
    const messages = state.salesMessages.filter(
      (message) =>
        (message.fromRepId === selfId && message.toRepId === peer.id) ||
        (message.fromRepId === peer.id && message.toRepId === selfId),
    );
    const latest = messages[messages.length - 1];
    const unread = messages.filter(
      (message) => message.toRepId === selfId && !message.read,
    ).length;

    return { peer, messages, latest, unread };
  });

  const [selectedPeerId, setSelectedPeerId] = useState(
    peers[0]?.id ?? "",
  );
  const [draft, setDraft] = useState("");

  const selectedThread = threads.find(
    (thread) => thread.peer.id === selectedPeerId,
  );

  useEffect(() => {
    if (!selectedPeerId || !selectedThread) {
      return;
    }

    const hasUnread = selectedThread.messages.some(
      (message) => message.toRepId === selfId && !message.read,
    );

    if (!hasUnread) {
      return;
    }

    setSalesMessages(
      state.salesMessages.map((message) =>
        message.toRepId === selfId &&
        message.fromRepId === selectedPeerId &&
        !message.read
          ? { ...message, read: true }
          : message,
      ),
    );
  }, [selectedPeerId, selectedThread, selfId, setSalesMessages, state.salesMessages]);

  const onSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();

    if (!body || !selectedPeerId) {
      return;
    }

    const next: AdminSalesMessage = {
      id: crypto.randomUUID(),
      fromRepId: selfId,
      toRepId: selectedPeerId,
      body,
      at: messageTimestamp(),
      read: false,
    };

    setSalesMessages([...state.salesMessages, next]);
    setDraft("");
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
                  onClick={() => setSelectedPeerId(peer.id)}
                  className={`w-full px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                    active ? "bg-[rgba(116,129,95,0.1)]" : "hover:bg-[#f3f5ef]"
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
                    {latest?.at}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[0.82rem] font-medium text-black/55">
                    {latest?.body}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex min-h-[20rem] flex-col p-5 md:p-6">
          {selectedThread ? (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto">
                {selectedThread.messages.map((message) => {
                  const isSelf = message.fromRepId === selfId;

                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isSelf
                          ? "ml-auto bg-brand text-cream"
                          : "bg-[#f3f5ef] text-[#0d120b]"
                      }`}
                    >
                      <p className="text-[0.88rem] font-medium leading-relaxed">
                        {message.body}
                      </p>
                      <p
                        className={`mt-1 text-[0.72rem] font-medium ${
                          isSelf ? "text-cream/70" : "text-black/40"
                        }`}
                      >
                        {isSelf ? "You" : selectedThread.peer.name} ·{" "}
                        {message.at}
                      </p>
                    </div>
                  );
                })}
              </div>

              <form id={formId} onSubmit={onSend} className="mt-4 flex gap-2">
                <input
                  className={adminFieldClass}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
                >
                  Send
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
  const { state } = useEmployeeDemo();

  if (state.employee.kind === "sales") {
    return <SalesMessagesPage />;
  }

  return <DeliveryMessagesPage />;
}
