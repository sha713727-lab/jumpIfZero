"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminDemo } from "@/components/admin/AdminDemoProvider";
import { adminFieldClass } from "@/components/admin/AdminFormModal";
import type { AdminMessage } from "@/constants/adminDemo";

function messageFromLabel(from: AdminMessage["from"]): string {
  if (from === "admin") {
    return "Admin";
  }

  if (from === "employee") {
    return "Staff";
  }

  return "Client";
}

function isStaffMessage(from: AdminMessage["from"]): boolean {
  return from === "admin" || from === "employee";
}

const cardClass =
  "grid overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)] lg:grid-cols-[18rem_1fr]";

export function ClientMessagesPage() {
  const params = useParams();
  const { state, setMessages } = useAdminDemo();
  const formId = useId();

  const clientId = typeof params.id === "string" ? params.id : "";
  const clientMessages = state.messages.filter(
    (item) => item.clientId === clientId,
  );

  const [draft, setDraft] = useState("");

  const onSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) {
      return;
    }

    const next: AdminMessage = {
      id: crypto.randomUUID(),
      clientId,
      from: "admin",
      body,
      at: "Just now",
      read: true,
    };

    setMessages([...state.messages, next]);
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Messages"
        lede="Thread with this client account."
      />

      <div className={cardClass}>
        <ul className="divide-y divide-black/8 border-b border-black/8 lg:border-r lg:border-b-0">
          {clientMessages.map((message) => (
            <li key={message.id} className="px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.88rem] font-bold text-[#0d120b]">
                  {messageFromLabel(message.from)}
                </p>
                {!message.read && message.from === "client" ? (
                  <span className="size-2 rounded-full bg-logo-gradient" />
                ) : null}
              </div>
              <p className="mt-0.5 text-[0.72rem] font-medium text-black/40">
                {message.at}
              </p>
              <p className="mt-2 line-clamp-3 text-[0.82rem] font-medium text-black/55">
                {message.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex min-h-[20rem] flex-col p-5 md:p-6">
          <div className="flex-1 space-y-4 overflow-y-auto">
            {clientMessages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  isStaffMessage(message.from)
                    ? "ml-auto bg-brand text-cream"
                    : "bg-[#f3f5ef] text-[#0d120b]"
                }`}
              >
                <p className="text-[0.88rem] font-medium leading-relaxed">
                  {message.body}
                </p>
                <p
                  className={`mt-1 text-[0.72rem] font-medium ${
                    isStaffMessage(message.from)
                      ? "text-cream/70"
                      : "text-black/40"
                  }`}
                >
                  {messageFromLabel(message.from)} · {message.at}
                </p>
              </div>
            ))}
          </div>

          <form id={formId} onSubmit={onSend} className="mt-4 flex gap-2">
            <input
              className={adminFieldClass}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Reply as admin…"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-[0.88rem] font-bold text-cream"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
