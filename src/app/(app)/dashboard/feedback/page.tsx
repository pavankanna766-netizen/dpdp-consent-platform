import { auth } from "@clerk/nextjs/server";
import { MessageSquare, Sparkles, Flag, CheckCircle2, Clock } from "lucide-react";

export default async function FeedbackPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const roadmapItems = [
    { title: "DocuSign & Adobe Sign Native Connector", status: "In Development", category: "Legal Studio", target: "Q3 2026" },
    { title: "Automated CERT-In 6-Hour Breach Incident Filing", status: "Under Review", category: "Security", target: "Q3 2026" },
    { title: "WhatsApp & SMS Consent Channel Support", status: "Planned", category: "Consent Platform", target: "Q4 2026" },
    { title: "Multi-Language Policy Translator (22 Schedule Languages)", status: "Completed", category: "Legal Studio", target: "Released" },
  ];

  const releaseNotes = [
    { version: "v1.4.0", date: "August 2026", title: "Enterprise Developer Platform & Webhooks", description: "Added HMAC SHA-256 webhook signatures, public V1 REST APIs, and OpenAPI 3.1 specifications." },
    { version: "v1.3.0", date: "July 2026", title: "Multi-Format Legal Exporter & Approvals", description: "Introduced SHA-256 cryptographic signatures, DOCX/PDF export engine, and 10 branding theme presets." },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-indigo-600" />
          Customer Feedback & Product Roadmap
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Share your product ideas, track upcoming DPDP features, and explore recent release notes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feedback Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Submit Product Feedback
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select className="w-full rounded-lg border border-slate-200 p-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option>Feature Request</option>
                <option>Bug Report</option>
                <option>Legal Template Suggestion</option>
                <option>General Feedback</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="Brief summary of your request"
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Explain how this feature improves your compliance workflow..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow transition"
            >
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Product Roadmap */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Flag className="h-5 w-5 text-indigo-500" />
            Public Product Roadmap
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmapItems.map((item, idx) => (
              <div key={idx} className="p-4 border border-slate-100 rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{item.category}</span>
                  <span className="text-slate-400 font-medium">{item.target}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  {item.status === "Completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                  <span>{item.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Release Notes */}
          <div className="pt-6 border-t space-y-4">
            <h3 className="text-md font-bold text-slate-900">Recent Release Notes</h3>
            <div className="space-y-3">
              {releaseNotes.map((rel, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-white space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="text-indigo-600">{rel.version}</span>
                    <span>{rel.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{rel.title}</h4>
                  <p className="text-xs text-slate-600">{rel.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
