"use client";

type ErrorPageProps = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-cream px-5 py-16 text-black">
      <div className="w-full max-w-md text-center">
        <p className="text-[0.72rem] font-extrabold tracking-[0.2em] text-brand uppercase">
          Error
        </p>
        <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          Something went wrong
        </h1>
        <p className="mt-3 text-[0.95rem] font-medium text-black/50">
          The page failed to load. Try again, or return home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-brand px-5 py-3 text-[0.88rem] font-bold text-cream"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-xl border border-black/12 bg-white px-5 py-3 text-[0.88rem] font-semibold text-[#0d120b]"
          >
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}
