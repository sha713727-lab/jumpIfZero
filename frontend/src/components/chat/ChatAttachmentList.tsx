"use client";

export type ChatAttachmentItem = {
  readonly fileId: string;
  readonly name: string;
};

export function ChatAttachmentList({
  items,
  tone,
}: {
  readonly items: readonly ChatAttachmentItem[];
  readonly tone: "staff" | "peer";
}) {
  if (items.length === 0) {
    return null;
  }

  const linkClass =
    tone === "staff"
      ? "border-cream/25 bg-cream/10 text-cream hover:bg-cream/15"
      : "border-black/10 bg-white text-[#0d120b] hover:bg-[#eef1ea]";

  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li key={item.fileId}>
          <a
            href={`/api/files/${item.fileId}/download`}
            className={`inline-flex max-w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[0.78rem] font-semibold transition-colors ${linkClass}`}
          >
            <span className="truncate">{item.name}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
