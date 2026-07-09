import Link from "next/link";

import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ConsentSuccessPage({
  params,
}: Props) {
  await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center p-8">
      <div className="w-full rounded-xl border bg-white p-10 text-center shadow-sm">
        <div className="text-5xl">✅</div>

        <h1 className="mt-6 text-3xl font-bold">
          Consent Recorded
        </h1>

        <p className="mt-4 text-gray-600">
          Thank you.
          <br />
          Your consent has been securely
          recorded by PrivyStack.
        </p>

        <Link href="/">
          <Button className="mt-8">
            Done
          </Button>
        </Link>
      </div>
    </main>
  );
}