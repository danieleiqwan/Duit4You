import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Brand Badge */}
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-base font-black text-white shadow-xs">
            F
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Finance Assistant
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Personal finance management & analytics
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
          <Link
            href="/login"
            className="flex w-full justify-center rounded-lg bg-[#181E29] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex w-full justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
