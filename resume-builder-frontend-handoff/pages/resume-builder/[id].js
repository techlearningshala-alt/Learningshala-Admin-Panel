import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import toast from "react-hot-toast";
import ResumeFormPanel from "@/components/resume-builder/ResumeFormPanel";
import { downloadResumePdf, fetchPreviewHtml, getResume, updateResume } from "@/lib/resumeApi";

export default function ResumeBuilderEditor() {
  const router = useRouter();
  const { id } = router.query;
  const [resume, setResume] = useState(null);
  const [templateKey, setTemplateKey] = useState("classic");
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const applyResume = useCallback((r) => {
    if (!r) return;
    setResume(r);
    setTemplateKey(r?.settings?.templateKey || "classic");
    setPreviewKey(Date.now());
  }, []);

  const loadResume = useCallback(async () => {
    if (!id) return;
    try {
      const res = await getResume(id);
      if (!res.success) throw new Error(res.message);
      applyResume(res.resume);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load resume");
    }
  }, [id, applyResume]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const loadPreview = useCallback(async () => {
    if (!id) return;
    setPreviewLoading(true);
    try {
      const html = await fetchPreviewHtml(id, templateKey);
      setPreviewHtml(html);
    } catch {
      setPreviewHtml(
        "<html><body><p style='font-family:sans-serif;padding:16px;color:#666'>Preview failed to load. Check that the backend is running.</p></body></html>"
      );
    } finally {
      setPreviewLoading(false);
    }
  }, [id, templateKey, previewKey]);

  useEffect(() => {
    if (resume) loadPreview();
  }, [resume, loadPreview]);

  const handleTemplateChange = async (key) => {
    setTemplateKey(key);
    setPreviewKey(Date.now());
    if (!resume || !id) return;
    try {
      await updateResume(id, { settings: { ...(resume.settings || {}), templateKey: key } }, { partial: true });
      await loadResume();
    } catch {
      toast.error("Could not save template preference");
    }
  };

  const handleDownload = async () => {
    if (!id) return;
    try {
      const blob = await downloadResumePdf(id, templateKey);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume-${templateKey}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(err.message || "PDF download failed");
    }
  };

  if (!id) return null;

  return (
    <>
      <Head>
        <title>{resume?.fullName ? `${resume.fullName} — Resume` : "Resume Editor"}</title>
      </Head>
      <div className="flex h-screen flex-col bg-slate-100">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <button
              type="button"
              onClick={() => router.push("/resume-builder")}
              className="text-sm text-indigo-600 hover:underline"
            >
              ← New resume
            </button>
            <h1 className="text-lg font-bold text-slate-900">{resume?.fullName || "Resume Editor"}</h1>
            <p className="text-xs text-slate-500">Fill the form and save — live preview updates on the right</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={templateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="executive">Executive</option>
              <option value="creative">Creative</option>
              <option value="minimalist">Minimalist</option>
              <option value="atsstandard">ATS Standard</option>
            </select>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Download PDF
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          <div className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
            <ResumeFormPanel resume={resume} resumeId={id} onSaved={applyResume} />
          </div>

          <div className="min-h-0 bg-slate-200 p-4">
            <div className="h-full overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
              {previewLoading && !previewHtml ? (
                <div className="flex h-full items-center justify-center text-slate-500">Loading preview…</div>
              ) : previewHtml ? (
                <iframe
                  key={previewKey}
                  title="Resume preview"
                  srcDoc={previewHtml}
                  className="h-full w-full border-0"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">Loading preview…</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
