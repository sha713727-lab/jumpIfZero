export default function EmployeePanelLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-52 rounded-xl bg-black/10" />
      <div className="h-5 w-72 max-w-full rounded-lg bg-black/8" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 rounded-2xl bg-white/80" />
        <div className="h-40 rounded-2xl bg-white/80" />
      </div>
      <div className="h-64 rounded-2xl bg-white/80" />
    </div>
  );
}
