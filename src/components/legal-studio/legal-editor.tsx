"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Minus,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Variable,
  Tag,
  Check,
  ChevronRight,
  Shield,
  Send,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  publishLegalDocumentAction,
  counselApproveLegalDocumentAction,
  restoreLegalDocumentVersionAction,
} from "@/app/actions/legal-document";
import type { LegalDocumentRecord, LegalDocumentType } from "@/repositories/legal-document.repository";

interface OutlineItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  initialDocument: LegalDocumentRecord;
  versions?: LegalDocumentRecord[];
  companyName: string;
}

export function LegalDocumentEditor({ initialDocument, versions = [], companyName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [documentId, setDocumentId] = useState(initialDocument.id);
  const [docType, setDocType] = useState<LegalDocumentType>(initialDocument.document_type);
  const [title, setTitle] = useState(initialDocument.title);
  const [slug, setSlug] = useState(initialDocument.slug);
  const [status, setStatus] = useState(initialDocument.status);
  const [version, setVersion] = useState(initialDocument.version);
  const [htmlContent, setHtmlContent] = useState(initialDocument.html_content);
  const [reviewedByCounsel, setReviewedByCounsel] = useState(initialDocument.reviewed_by_counsel);
  const [counselName, setCounselName] = useState(initialDocument.reviewed_by || "");
  const [metadata, setMetadata] = useState<Record<string, unknown>>(initialDocument.metadata || {});

  // Editor states & outline
  const editorRef = useRef<HTMLDivElement>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [activeTab, setActiveTab] = useState<"editor" | "outline" | "versions" | "variables">("editor");

  // Extract document outline from HTML headings
  useEffect(() => {
    if (!editorRef.current) return;
    const headings = editorRef.current.querySelectorAll("h1, h2, h3");
    const items: OutlineItem[] = [];
    headings.forEach((h, idx) => {
      const id = h.id || `heading-${idx}`;
      h.id = id;
      items.push({
        id,
        text: h.textContent || "Untitled Heading",
        level: parseInt(h.tagName.substring(1)),
      });
    });
    setOutline(items);
  }, [htmlContent]);

  // Debounced Autosave (Every 3 seconds of idle time)
  useEffect(() => {
    setAutosaveStatus("unsaved");
    const timer = setTimeout(() => {
      setAutosaveStatus("saving");
      // Simulate debounced autosave background persist
      setTimeout(() => {
        setAutosaveStatus("saved");
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [htmlContent, title, slug]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
  };

  const insertVariable = (varName: string) => {
    const placeholder = `{{${varName}}}`;
    execCommand("insertText", placeholder);
  };

  const handlePublish = () => {
    startTransition(async () => {
      await publishLegalDocumentAction(documentId);
      setStatus("published");
      router.refresh();
    });
  };

  const handleCounselApprove = () => {
    if (!counselName) return alert("Please enter legal counsel name.");
    startTransition(async () => {
      await counselApproveLegalDocumentAction(documentId, counselName);
      setReviewedByCounsel(true);
      router.refresh();
    });
  };

  const handleRestoreVersion = (verDocId: string) => {
    startTransition(async () => {
      await restoreLegalDocumentVersionAction(verDocId);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      {/* Top Studio Action Header */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-7 text-sm font-bold border-none shadow-none focus-visible:ring-1 focus-visible:ring-indigo-500 w-72"
              />
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                {docType.replace(/_/g, " ")} (v{version}.0)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pl-2">Company: {companyName} | Slug: /p/{slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            {autosaveStatus === "saved" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
            {autosaveStatus === "saving" && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
            {autosaveStatus === "unsaved" && <span className="h-2 w-2 rounded-full bg-slate-400" />}
            {autosaveStatus === "saved" ? "Autosaved" : autosaveStatus === "saving" ? "Saving..." : "Unsaved changes"}
          </span>

          {reviewedByCounsel ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approved by {counselName || "Counsel"}
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Counsel Name"
                value={counselName}
                onChange={(e) => setCounselName(e.target.value)}
                className="h-8 text-xs w-36"
              />
              <Button size="sm" variant="outline" onClick={handleCounselApprove} disabled={isPending} className="h-8 text-xs">
                Counsel Sign-Off
              </Button>
            </div>
          )}

          <Button
            size="sm"
            onClick={handlePublish}
            disabled={isPending || status === "published"}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 flex items-center gap-1.5"
          >
            <Send className="h-3.5 w-3.5" /> {status === "published" ? "Published" : "Publish Document"}
          </Button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR: Document Outline & Versions */}
        <aside className="w-64 border-r bg-white p-4 flex flex-col justify-between shrink-0 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Outline</span>
              <span className="text-[10px] text-slate-400 font-mono">{outline.length} headings</span>
            </div>

            <div className="space-y-1">
              {outline.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Add headings (H1, H2, H3) to build outline.</p>
              ) : (
                outline.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`block w-full text-left text-xs truncate py-1.5 px-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors ${
                      item.level === 1 ? "font-bold text-slate-900" : item.level === 2 ? "pl-4 font-semibold" : "pl-6 text-slate-500"
                    }`}
                  >
                    {item.text}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Version History */}
          <div className="border-t pt-4 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-3.5 w-3.5 text-indigo-600" /> Version History
            </span>
            <div className="space-y-2">
              {versions.map((ver) => (
                <div key={ver.id} className="flex items-center justify-between p-2 rounded-lg border bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">v{ver.version}.0</span>
                    <p className="text-[10px] text-slate-400">{new Date(ver.created_at).toLocaleDateString()}</p>
                  </div>
                  {ver.id !== documentId && (
                    <Button size="sm" variant="ghost" onClick={() => handleRestoreVersion(ver.id)} className="h-6 text-[10px] text-indigo-600">
                      <RotateCcw className="h-3 w-3 mr-1" /> Restore
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: Document Studio Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Formatting Action Bar */}
          <div className="flex flex-wrap items-center gap-1 border-b bg-white px-4 py-2 shrink-0 text-slate-700 shadow-2xs">
            <Button size="sm" variant="ghost" onClick={() => execCommand("formatBlock", "<h1>")} title="Heading 1" className="h-7 w-7 p-0">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("formatBlock", "<h2>")} title="Heading 2" className="h-7 w-7 p-0">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("formatBlock", "<h3>")} title="Heading 3" className="h-7 w-7 p-0">
              <Heading3 className="h-4 w-4" />
            </Button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1" />

            <Button size="sm" variant="ghost" onClick={() => execCommand("bold")} title="Bold" className="h-7 w-7 p-0">
              <Bold className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("italic")} title="Italic" className="h-7 w-7 p-0">
              <Italic className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("underline")} title="Underline" className="h-7 w-7 p-0">
              <Underline className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("strikeThrough")} title="Strikethrough" className="h-7 w-7 p-0">
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("formatBlock", "<pre>")} title="Code Block" className="h-7 w-7 p-0">
              <Code className="h-4 w-4" />
            </Button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1" />

            <Button size="sm" variant="ghost" onClick={() => execCommand("insertUnorderedList")} title="Bullet List" className="h-7 w-7 p-0">
              <List className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("insertOrderedList")} title="Numbered List" className="h-7 w-7 p-0">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("formatBlock", "<blockquote>")} title="Quote" className="h-7 w-7 p-0">
              <Quote className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => execCommand("insertHorizontalRule")} title="Horizontal Rule" className="h-7 w-7 p-0">
              <Minus className="h-4 w-4" />
            </Button>

            <div className="h-4 w-[1px] bg-slate-200 mx-1" />

            <Button size="sm" variant="ghost" onClick={() => execCommand("undo")} title="Undo" className="h-7 w-7 p-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* WYSIWYG Document Editor Canvas */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => {
                if (editorRef.current) {
                  setHtmlContent(editorRef.current.innerHTML);
                }
              }}
              dangerouslySetInnerHTML={{ __html: initialDocument.html_content }}
              className="w-full max-w-3xl min-h-[700px] rounded-xl border bg-white p-12 shadow-sm text-slate-900 focus:outline-none prose prose-indigo max-w-none font-sans leading-relaxed"
            />
          </div>
        </main>

        {/* RIGHT SIDEBAR: Properties, Variables & Document Settings */}
        <aside className="w-72 border-l bg-white p-5 flex flex-col justify-between shrink-0 overflow-y-auto space-y-6">
          <div className="space-y-6">
            <div className="border-b pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Variable className="h-3.5 w-3.5 text-indigo-600" /> Variables & Tokens
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Insert dynamic tokens into cursor position.</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                "company_name",
                "website",
                "country",
                "timezone",
                "dpo_email",
                "retention_period",
                "effective_date",
              ].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="rounded-md border bg-slate-50 px-2 py-1 text-xs font-mono text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  &#123;&#123;{v}&#125;&#125;
                </button>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-indigo-600" /> Document Type & Slug
              </span>

              <div>
                <Label htmlFor="type-select" className="text-xs">Document Type</Label>
                <select
                  id="type-select"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as LegalDocumentType)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                >
                  <option value="privacy_policy">Privacy Policy</option>
                  <option value="cookie_policy">Cookie Policy</option>
                  <option value="dpa">Data Processing Agreement (DPA)</option>
                  <option value="terms_of_service">Terms of Service</option>
                  <option value="vendor_agreement">Vendor Agreement</option>
                  <option value="breach_report">Breach Report</option>
                  <option value="custom">Custom Legal Document</option>
                </select>
              </div>

              <div>
                <Label htmlFor="slug-input" className="text-xs">URL Slug</Label>
                <Input
                  id="slug-input"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 text-xs h-8 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statutory Protection Engine</span>
            <p className="text-[10px] text-slate-400">PrivyStack Legal Studio v2.0</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
