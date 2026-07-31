export function EmptyState({
  message,
}: {
  readonly message: string;
}) {
  return (
    <p className="px-5 py-10 text-center text-[0.92rem] font-medium text-black/45">
      {message}
    </p>
  );
}
