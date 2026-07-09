import { notFound } from "next/navigation";
import { getPublishedTemplate } from "@/services/consent-template.service";
import { AcceptButton } from "./accept-button";

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ConsentPage({
  params,
}: Props) {
  const { token } = await params;

  const template =
    await getPublishedTemplate(token);

  if (!template) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">
          {template.title}
        </h1>

        {template.description && (
          <p className="mt-3 text-gray-600">
            {template.description}
          </p>
        )}

        <div className="mt-8 rounded-lg border p-6">
          <p className="whitespace-pre-wrap">
            {template.consent_text}
          </p>
        <div className="mt-6"></div>
          <AcceptButton token={token} />
        </div>
      </div>
    </main>
  );
}