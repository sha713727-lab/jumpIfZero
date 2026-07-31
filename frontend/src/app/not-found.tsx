import Link from "next/link";
import { site } from "@/constants/site";

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-cream px-5 py-16 text-black">
      <div className="w-full max-w-md text-center">
        <p className="text-[0.72rem] font-extrabold tracking-[0.2em] text-brand uppercase">
          404
        </p>
        <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold tracking-[-0.04em] text-[#0d120b]">
          Page not found
        </h1>
        <p className="mt-3 text-[0.95rem] font-medium text-black/50">
          That URL is not part of {site.name}. Check the address, or go home.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-brand px-5 py-3 text-[0.88rem] font-bold text-cream"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
