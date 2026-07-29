"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { demoMessages } from "@/constants/dashboard";

type MessageRow = {
  readonly id: string;
  readonly from: string;
  readonly role: string;
  readonly preview: string;
  readonly time: string;
  unread: boolean;
};

export function MessagesPage() {
  const formId = useId();
  const [rows, setRows] = useState<MessageRow[]>(
    demoMessages.map((message) => ({ ...message })),
  );
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const selected = rows.find((row) => row.id === selectedId) ?? rows[0];

  const openMessage = (id: string) => {
    setSelectedId(id);
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, unread: false } : row)),
    );
  };

  const onSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();

    if (!text) {
      return;
    }

    const next: MessageRow = {
      id: `msg_local_${Date.now()}`,
      from: "You",
      role: "Customer",
      preview: text,
      time: "Just now",
      unread: false,
    };

    setRows((current) => [next, ...current]);
    setSelectedId(next.id);
    setDraft("");
    setNotice("Message sent to your account team (demo).");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[clamp(1.6rem,3vw,2rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          Messages
        </h1>
        <p className="mt-2 text-[0.95rem] font-medium text-black/50">
          Talk with your JZ account team.
        </p>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-brand/25 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.88rem] font-semibold text-[#2f3a28]"
        >
          {notice}
        </p>
      ) : null}

      <div className="grid overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_24px_rgba(47,58,40,0.04)] lg:grid-cols-[18rem_1fr]">
        <ul className="divide-y divide-black/8 border-b border-black/8 lg:border-r lg:border-b-0">
          {rows.map((message) => {
            const active = message.id === selected?.id;

            return (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => openMessage(message.id)}
                  className={`w-full px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary ${
                    active ? "bg-[rgba(116,129,95,0.1)]" : "hover:bg-[#f3f5ef]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[0.9rem] font-bold text-[#0d120b]">
                      {message.from}
                    </p>
                    {message.unread ? (
                      <span className="size-2 shrink-0 rounded-full bg-logo-gradient" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[0.72rem] font-medium text-black/40">
                    {message.role} · {message.time}
                  </p>
                  <p className="mt-2 line-clamp-2 text-[0.82rem] font-medium text-black/55">
                    {message.preview}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex min-h-[22rem] flex-col p-5 md:p-6">
          {selected ? (
            <>
              <div>
                <p className="text-[1.05rem] font-extrabold text-[#0d120b]">
                  {selected.from}
                </p>
                <p className="text-[0.8rem] font-medium text-black/40">
                  {selected.role} · {selected.time}
                </p>
              </div>
              <p className="mt-5 flex-1 text-[0.95rem] leading-[1.6] font-medium text-[#0d120b]/80">
                {selected.preview}
              </p>
              <form onSubmit={onSend} className="mt-6 space-y-3 border-t border-black/8 pt-5">
                <label
                  htmlFor={`${formId}-draft`}
                  className="block text-[0.8rem] font-bold text-[#0d120b]"
                >
                  Reply
                </label>
                <textarea
                  id={`${formId}-draft`}
                  rows={3}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message…"
                  className="w-full rounded-xl border-0 bg-[rgba(116,129,95,0.1)] px-4 py-3 text-[0.92rem] font-medium outline-none focus-visible:shadow-[0_0_0_2px_#f3f5ef,0_0_0_4px_#f9a137]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-logo-gradient px-5 py-2.5 text-[0.82rem] font-extrabold text-[#0d120b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
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
