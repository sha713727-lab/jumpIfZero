"use client";

import { ChatAttachmentList } from "@/components/chat/ChatAttachmentList";
import { LinkifiedText } from "@/components/chat/LinkifiedText";

export function ChatBubble({
  body,
  meta,
  attachments,
  align,
}: {
  readonly body: string;
  readonly meta: string;
  readonly attachments: readonly { fileId: string; name: string }[];
  readonly align: "self" | "other";
}) {
  const self = align === "self";

  return (
    <div
      className={`flex w-full ${self ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[min(92%,28rem)] rounded-[1.15rem] px-4 py-3 ${
          self
            ? "rounded-br-md bg-brand text-cream shadow-[0_8px_20px_rgba(47,58,40,0.18)]"
            : "rounded-bl-md bg-white text-[#0d120b] shadow-[0_8px_20px_rgba(13,18,11,0.06)] ring-1 ring-black/6"
        }`}
      >
        {body.trim().length > 0 ? (
          <p className="whitespace-pre-wrap break-words text-[0.92rem] font-medium leading-[1.55]">
            <LinkifiedText text={body} />
          </p>
        ) : null}
        <ChatAttachmentList
          items={attachments}
          tone={self ? "staff" : "peer"}
        />
        <p
          className={`mt-2 text-[0.7rem] font-medium tracking-[0.01em] ${
            self ? "text-cream/65" : "text-black/35"
          }`}
        >
          {meta}
        </p>
      </div>
    </div>
  );
}
