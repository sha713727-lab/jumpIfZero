export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-48 rounded-xl bg-black/10" />
      <div className="h-5 w-80 max-w-full rounded-lg bg-black/8" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-24 rounded-2xl bg-white/80" />
        <div className="h-24 rounded-2xl bg-white/80" />
        <div className="h-24 rounded-2xl bg-white/80" />
        <div className="h-24 rounded-2xl bg-white/80" />
      </div>
      <div className="h-64 rounded-2xl bg-white/80" />
    </div>
  );
}
