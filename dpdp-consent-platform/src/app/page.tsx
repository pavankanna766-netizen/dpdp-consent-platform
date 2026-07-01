import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-5xl font-bold">PrivyStack</h1>
        <p className="text-gray-600">
          DPDP Compliance Platform for Indian Businesses
        </p>

        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="rounded bg-black px-5 py-3 text-white"
          >
            Sign In
          </Link>

          <Link
            href="/sign-up"
            className="rounded border px-5 py-3"
          >
            Sign Up
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        Welcome to PrivyStack 🚀
      </h1>
    </main>
  );
}