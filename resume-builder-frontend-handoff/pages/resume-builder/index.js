import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import toast from "react-hot-toast";
import { generateResume, uploadResume } from "@/lib/resumeApi";

export default function ResumeBuilderLanding() {
  const router = useRouter();
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("form");

  const goToEditor = (id) => router.push(`/resume-builder/${id}`);

  const handleCreateForm = async () => {
    setLoading(true);
    try {
      const res = await generateResume({ mode: "blank", buildMode: "form", templateKey: "classic" });
      if (!res.success) throw new Error(res.message || "Failed to start");
      toast.success("Fill in your details in the form");
      goToEditor(res.resume.id);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    if (!pasteText.trim()) {
      toast.error("Paste your background details first");
      return;
    }
    setLoading(true);
    try {
      const res = await generateResume({ text: pasteText, useAI: true });
      if (!res.success) throw new Error(res.message || "Failed to generate");
      toast.success(res.message || "Resume created — review and edit in the form");
      goToEditor(res.resume.id);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadResume(file, { templateKey: "classic" });
      if (!res.success) throw new Error(res.message || "Upload failed");
      toast.success(res.message || "Resume parsed — review in the form");
      goToEditor(res.resume.id);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <Head>
        <title>Resume Builder</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Career Bracket</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Resume Builder</h1>
            <p className="mt-3 text-slate-600">
              Fill the form manually, paste your details, or upload an existing resume — then download PDF.
            </p>
          </div>

          <div className="mb-6 flex justify-center gap-2">
            {[
              { id: "form", label: "Fill form" },
              { id: "paste", label: "Paste details" },
              { id: "upload", label: "Upload PDF" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200">
            {activeTab === "form" && (
              <div className="text-center">
                <p className="mb-2 text-slate-700 font-medium">Create your resume step by step</p>
                <p className="mb-6 text-sm text-slate-500">
                  Personal details, LinkedIn, skills, experience, education — no AI needed.
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleCreateForm}
                  className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Starting…" : "Create new resume"}
                </button>
              </div>
            )}

            {activeTab === "paste" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Paste your work history, education, and skills (AI will pre-fill the form)
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={12}
                  placeholder={`Example:\nJohn Doe, john@email.com, Bangalore\n\nSoftware Engineer at Acme Corp (2021-2024)\n- Built APIs with Node.js\n\nB.Tech CS, XYZ University, 2021\nSkills: JavaScript, Python, SQL`}
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePaste}
                  className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Structuring your resume…" : "Generate and open form"}
                </button>
              </div>
            )}

            {activeTab === "upload" && (
              <div className="text-center">
                <p className="mb-4 text-slate-600">
                  Upload an existing resume (PDF, DOCX, or image). We will extract details into the form.
                </p>
                <label className="inline-flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-10 py-12 hover:bg-indigo-50">
                  <span className="text-lg font-semibold text-indigo-700">
                    {loading ? "Processing…" : "Choose file"}
                  </span>
                  <span className="mt-1 text-sm text-slate-500">PDF, DOCX, PNG, JPG</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={handleUpload}
                    disabled={loading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
