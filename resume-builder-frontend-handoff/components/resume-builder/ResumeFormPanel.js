import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateResume } from "@/lib/resumeApi";

const EMPTY_EXP = { title: "", company: "", location: "", startDate: "", endDate: "", responsibilities: [""] };
const EMPTY_EDU = { degree: "", institution: "", startDate: "", endDate: "", details: "" };

function Field({ label, required, hint, children, error }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {hint && <span className="mb-1 block text-xs text-slate-400">{hint}</span>}
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

const inputErrorClass =
  "w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200";

function validateForm(form) {
  const fieldErrors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  const phoneRegex = /^[\d\s+\-()]{7,20}$/;
  const urlRegex = /^https?:\/\/.+/i;

  const name = String(form.fullName || "").trim();
  if (name.length < 2) fieldErrors.fullName = "Full name is required (min 2 characters)";

  const email = String(form.email || "").trim();
  if (!email) fieldErrors.email = "Email is required";
  else if (!emailRegex.test(email)) fieldErrors.email = "Enter a valid email address";

  const location = String(form.location || "").trim();
  if (!location) fieldErrors.location = "City / location is required";

  const phone = String(form.phone || "").trim();
  if (phone && !phoneRegex.test(phone)) fieldErrors.phone = "Enter a valid phone number";

  const linkedin = String(form.linkedin || "").trim();
  if (linkedin && !urlRegex.test(linkedin)) fieldErrors.linkedin = "Enter a full URL (https://…)";

  const github = String(form.github || "").trim();
  if (github && !urlRegex.test(github)) fieldErrors.github = "Enter a full URL (https://…)";

  const portfolio = String(form.portfolio || "").trim();
  if (portfolio && !urlRegex.test(portfolio)) fieldErrors.portfolio = "Enter a full URL (https://…)";

  const skills = String(form.skills || "").trim();
  if (!skills) fieldErrors.skills = "Add at least one skill";

  const hasExperience = form.experience.some((e) => e.title?.trim() || e.company?.trim());
  const hasEducation = form.education.some((e) => e.degree?.trim() || e.institution?.trim());
  if (!hasExperience && !hasEducation) {
    fieldErrors.experience = "Add at least one work experience or education entry";
  }

  return fieldErrors;
}

export default function ResumeFormPanel({ resume, resumeId, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);

  useEffect(() => {
    if (!resume) return;
    const links = resume.socialLinks && typeof resume.socialLinks === "object" ? resume.socialLinks : {};
    setForm({
      fullName: resume.fullName === "Your Name" ? "" : resume.fullName || "",
      email: resume.email === "you@email.com" ? "" : resume.email || "",
      phone: resume.phone || "",
      location: resume.location || "",
      summary: resume.summary || "",
      linkedin: links.LinkedIn || links.linkedin || "",
      github: links.GitHub || links.github || "",
      portfolio: links.Portfolio || links.portfolio || "",
      skills: Array.isArray(resume.skills) ? resume.skills.join(", ") : "",
      languages: Array.isArray(resume.languages) ? resume.languages.join(", ") : "",
      experience: resume.experience?.length ? resume.experience : [],
      education: resume.education?.length ? resume.education : [],
      certifications: Array.isArray(resume.certifications) ? resume.certifications.join(", ") : "",
    });
  }, [resume]);

  if (!form) {
    return <div className="flex flex-1 items-center justify-center text-slate-500">Loading form…</div>;
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const updateListItem = (listKey, index, field, val) => {
    const list = [...(form[listKey] || [])];
    list[index] = { ...list[index], [field]: val };
    set(listKey, list);
  };

  const handleSave = async () => {
    if (!resumeId) return;

    const errors = validateForm(form);
    setFieldErrors(errors);
    setServerErrors([]);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the required fields marked below");
      return;
    }

    setSaving(true);
    try {
      const socialLinks = {};
      if (form.linkedin?.trim()) socialLinks.LinkedIn = form.linkedin.trim();
      if (form.github?.trim()) socialLinks.GitHub = form.github.trim();
      if (form.portfolio?.trim()) socialLinks.Portfolio = form.portfolio.trim();

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || null,
        location: form.location.trim(),
        summary: form.summary?.trim() || null,
        skills: form.skills,
        languages: form.languages,
        socialLinks,
        experience: form.experience.filter((e) => e.title?.trim() || e.company?.trim()),
        education: form.education.filter((e) => e.degree?.trim() || e.institution?.trim()),
        certifications: form.certifications,
      };

      const res = await updateResume(resumeId, payload, { partial: true });
      if (!res.success) {
        setServerErrors(res.errors || [res.message]);
        return;
      }
      toast.success("Resume saved");
      setFieldErrors({});
      onSaved?.(res.resume);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Save failed";
      setServerErrors(err?.response?.data?.errors || [msg]);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const ic = (key) => (fieldErrors[key] ? inputErrorClass : inputClass);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Resume form</h2>
          <p className="text-sm text-slate-600">
            Fields marked <span className="text-red-500">*</span> are required.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save resume"}
        </button>
      </div>

      {serverErrors.length > 0 && (
        <ul className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <section className="mb-8 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Personal details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" required error={fieldErrors.fullName}>
            <input
              className={ic("fullName")}
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              placeholder="e.g. Priya Sharma"
            />
          </Field>
          <Field label="Email" required error={fieldErrors.email}>
            <input
              className={ic("email")}
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@email.com"
            />
          </Field>
          <Field label="Phone" hint="Optional but recommended" error={fieldErrors.phone}>
            <input
              className={ic("phone")}
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </Field>
          <Field label="City / location" required error={fieldErrors.location}>
            <input
              className={ic("location")}
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Noida, UP"
            />
          </Field>
        </div>
        <Field label="Professional summary" hint="2–4 lines about your role and strengths">
          <textarea
            className={inputClass}
            rows={4}
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
            placeholder="Results-driven software engineer with 3+ years in full-stack development…"
          />
        </Field>
      </section>

      <section className="mb-8 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Profile links</h3>
        <Field label="LinkedIn URL" hint="Optional" error={fieldErrors.linkedin}>
          <input
            className={ic("linkedin")}
            type="url"
            value={form.linkedin}
            onChange={(e) => set("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/your-profile"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="GitHub URL" hint="Optional" error={fieldErrors.github}>
            <input
              className={ic("github")}
              type="url"
              value={form.github}
              onChange={(e) => set("github", e.target.value)}
              placeholder="https://github.com/username"
            />
          </Field>
          <Field label="Portfolio / website" hint="Optional" error={fieldErrors.portfolio}>
            <input
              className={ic("portfolio")}
              type="url"
              value={form.portfolio}
              onChange={(e) => set("portfolio", e.target.value)}
              placeholder="https://yourportfolio.com"
            />
          </Field>
        </div>
      </section>

      <section className="mb-8 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Skills & languages</h3>
        <Field label="Skills" required hint="Comma-separated" error={fieldErrors.skills}>
          <textarea
            className={ic("skills")}
            rows={2}
            value={form.skills}
            onChange={(e) => set("skills", e.target.value)}
            placeholder="JavaScript, React, Node.js, SQL, Git"
          />
        </Field>
        <Field label="Languages" hint="Comma-separated — e.g. English (Fluent), Hindi (Native)">
          <input
            className={inputClass}
            value={form.languages}
            onChange={(e) => set("languages", e.target.value)}
            placeholder="English, Hindi, Tamil"
          />
        </Field>
        <Field label="Certifications" hint="Optional — comma-separated">
          <input
            className={inputClass}
            value={form.certifications}
            onChange={(e) => set("certifications", e.target.value)}
            placeholder="AWS Certified Developer, Google Data Analytics"
          />
        </Field>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Work experience <span className="text-red-500">*</span>
            </h3>
            {fieldErrors.experience && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.experience}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => set("experience", [...form.experience, { ...EMPTY_EXP }])}
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            + Add role
          </button>
        </div>
        <div className="space-y-4">
          {form.experience.map((exp, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="Job title *"
                  className={inputClass}
                  value={exp.title || ""}
                  onChange={(e) => updateListItem("experience", i, "title", e.target.value)}
                />
                <input
                  placeholder="Company *"
                  className={inputClass}
                  value={exp.company || ""}
                  onChange={(e) => updateListItem("experience", i, "company", e.target.value)}
                />
                <input
                  placeholder="Start (e.g. Jan 2022)"
                  className={inputClass}
                  value={exp.startDate || ""}
                  onChange={(e) => updateListItem("experience", i, "startDate", e.target.value)}
                />
                <input
                  placeholder="End (or Present)"
                  className={inputClass}
                  value={exp.endDate || ""}
                  onChange={(e) => updateListItem("experience", i, "endDate", e.target.value)}
                />
              </div>
              <textarea
                placeholder="Responsibilities (one per line)"
                className={inputClass}
                rows={3}
                value={(exp.responsibilities || []).join("\n")}
                onChange={(e) =>
                  updateListItem("experience", i, "responsibilities", e.target.value.split("\n").filter(Boolean))
                }
              />
            </div>
          ))}
          {!form.experience.length && (
            <button
              type="button"
              onClick={() => set("experience", [{ ...EMPTY_EXP }])}
              className="w-full rounded-xl border border-dashed border-slate-300 py-4 text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
            >
              + Add your first job
            </button>
          )}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Education</h3>
          <button
            type="button"
            onClick={() => set("education", [...form.education, { ...EMPTY_EDU }])}
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            + Add education
          </button>
        </div>
        <div className="space-y-4">
          {form.education.map((edu, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-2">
              <input
                placeholder="Degree (e.g. B.Tech Computer Science)"
                className={inputClass}
                value={edu.degree || ""}
                onChange={(e) => updateListItem("education", i, "degree", e.target.value)}
              />
              <input
                placeholder="Institution"
                className={inputClass}
                value={edu.institution || ""}
                onChange={(e) => updateListItem("education", i, "institution", e.target.value)}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  placeholder="Start year"
                  className={inputClass}
                  value={edu.startDate || ""}
                  onChange={(e) => updateListItem("education", i, "startDate", e.target.value)}
                />
                <input
                  placeholder="End year"
                  className={inputClass}
                  value={edu.endDate || ""}
                  onChange={(e) => updateListItem("education", i, "endDate", e.target.value)}
                />
              </div>
            </div>
          ))}
          {!form.education.length && (
            <button
              type="button"
              onClick={() => set("education", [{ ...EMPTY_EDU }])}
              className="w-full rounded-xl border border-dashed border-slate-300 py-4 text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
            >
              + Add your education
            </button>
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="sticky bottom-0 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save resume"}
      </button>
    </div>
  );
}
