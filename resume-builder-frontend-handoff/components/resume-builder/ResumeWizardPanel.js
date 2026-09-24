import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getWizard, submitWizardStep } from "@/lib/resumeApi";

const EMPTY_EXP = { title: "", company: "", location: "", startDate: "", endDate: "", responsibilities: [""] };
const EMPTY_EDU = { degree: "", institution: "", startDate: "", endDate: "", details: "" };

function StepProgress({ steps, currentStep, completedSteps }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {steps
        .filter((s) => s.id !== "review")
        .map((s) => {
          const done = completedSteps.includes(s.id);
          const active = s.id === currentStep;
          return (
            <span
              key={s.id}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                active
                  ? "bg-indigo-600 text-white"
                  : done
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {s.title}
            </span>
          );
        })}
    </div>
  );
}

export default function ResumeWizardPanel({ resumeId, onResumeUpdated, onFinish }) {
  const [wizard, setWizard] = useState(null);
  const [step, setStep] = useState(null);
  const [steps, setSteps] = useState([]);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  const loadWizard = async () => {
    if (!resumeId) return;
    setBooting(true);
    try {
      const res = await getWizard(resumeId);
      if (!res.success) throw new Error(res.message);
      setWizard(res.wizard);
      setStep(res.step);
      setSteps(res.steps || []);
      setValues(res.values || {});
      setErrors([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load wizard");
    } finally {
      setBooting(false);
    }
  };

  useEffect(() => {
    loadWizard();
  }, [resumeId]);

  const handleAction = async (action) => {
    if (!step || loading) return;
    setLoading(true);
    setErrors([]);
    try {
      const payload = { step: step.id, action, ...values };
      if (step.id === "skills" && typeof values.skills === "string") {
        payload.skills = values.skills;
      }
      const res = await submitWizardStep(resumeId, payload);
      if (!res.success) {
        setErrors(res.errors || [res.message]);
        return;
      }
      setWizard(res.wizard);
      setStep(res.step);
      setValues(res.values || {});
      if (res.resume) onResumeUpdated?.(res.resume);
      if (res.message) toast.success(res.message);
      if (!res.wizard?.active) onFinish?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Could not save step";
      setErrors(err?.response?.data?.errors || [msg]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateExp = (index, field, val) => {
    const list = Array.isArray(values.experience) ? [...values.experience] : [];
    while (list.length <= index) list.push({ ...EMPTY_EXP });
    list[index] = { ...list[index], [field]: val };
    setValues((v) => ({ ...v, experience: list }));
  };

  const updateExpBullet = (expIndex, bulletIndex, val) => {
    const list = Array.isArray(values.experience) ? [...values.experience] : [];
    while (list.length <= expIndex) list.push({ ...EMPTY_EXP });
    const bullets = [...(list[expIndex].responsibilities || [""])];
    bullets[bulletIndex] = val;
    list[expIndex] = { ...list[expIndex], responsibilities: bullets };
    setValues((v) => ({ ...v, experience: list }));
  };

  const addExperience = () => {
    const list = Array.isArray(values.experience) ? [...values.experience] : [];
    list.push({ ...EMPTY_EXP });
    setValues((v) => ({ ...v, experience: list }));
  };

  const updateEdu = (index, field, val) => {
    const list = Array.isArray(values.education) ? [...values.education] : [];
    while (list.length <= index) list.push({ ...EMPTY_EDU });
    list[index] = { ...list[index], [field]: val };
    setValues((v) => ({ ...v, education: list }));
  };

  const addEducation = () => {
    const list = Array.isArray(values.education) ? [...values.education] : [];
    list.push({ ...EMPTY_EDU });
    setValues((v) => ({ ...v, education: list }));
  };

  if (booting) {
    return <div className="flex flex-1 items-center justify-center text-slate-500">Loading guided setup…</div>;
  }

  if (!wizard?.active && step?.id === "review") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-lg font-semibold text-slate-800">Basics complete!</p>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          Use the Form tab to edit any section manually, or Chat to refine with AI when available.
        </p>
      </div>
    );
  }

  if (!wizard?.active) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-slate-600">Guided setup is done. Switch to Form or Chat to continue editing.</p>
      </div>
    );
  }

  const stepId = step?.id;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
      <StepProgress steps={steps} currentStep={wizard.currentStep} completedSteps={wizard.completedSteps || []} />

      <h2 className="text-xl font-bold text-slate-900">{step?.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{step?.prompt}</p>

      {errors.length > 0 && (
        <ul className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="mt-6 space-y-4">
        {stepId === "fullName" && (
          <input
            type="text"
            value={values.fullName || ""}
            onChange={(e) => setValues((v) => ({ ...v, fullName: e.target.value }))}
            placeholder="e.g. Priya Sharma"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        )}

        {stepId === "contact" && (
          <>
            <input
              type="email"
              value={values.email || ""}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              placeholder="Email *"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="tel"
              value={values.phone || ""}
              onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              placeholder="Phone (optional)"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <input
              type="text"
              value={values.location || ""}
              onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
              placeholder="City, State"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </>
        )}

        {stepId === "summary" && (
          <textarea
            rows={6}
            value={values.summary || ""}
            onChange={(e) => setValues((v) => ({ ...v, summary: e.target.value }))}
            placeholder="Brief professional summary…"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        )}

        {stepId === "experience" && (
          <div className="space-y-6">
            {(Array.isArray(values.experience) && values.experience.length ? values.experience : [EMPTY_EXP]).map(
              (exp, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Role {i + 1}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      placeholder="Job title"
                      value={exp.title || ""}
                      onChange={(e) => updateExp(i, "title", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Company"
                      value={exp.company || ""}
                      onChange={(e) => updateExp(i, "company", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="Start (e.g. Jan 2022)"
                      value={exp.startDate || ""}
                      onChange={(e) => updateExp(i, "startDate", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="End (or Present)"
                      value={exp.endDate || ""}
                      onChange={(e) => updateExp(i, "endDate", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  {(exp.responsibilities || [""]).map((b, bi) => (
                    <input
                      key={bi}
                      placeholder="Achievement or responsibility"
                      value={b}
                      onChange={(e) => updateExpBullet(i, bi, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  ))}
                </div>
              )
            )}
            <button type="button" onClick={addExperience} className="text-sm font-medium text-indigo-600 hover:underline">
              + Add another role
            </button>
          </div>
        )}

        {stepId === "education" && (
          <div className="space-y-6">
            {(Array.isArray(values.education) && values.education.length ? values.education : [EMPTY_EDU]).map(
              (edu, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase text-slate-500">Education {i + 1}</p>
                  <input
                    placeholder="Degree"
                    value={edu.degree || ""}
                    onChange={(e) => updateEdu(i, "degree", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Institution"
                    value={edu.institution || ""}
                    onChange={(e) => updateEdu(i, "institution", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      placeholder="Start year"
                      value={edu.startDate || ""}
                      onChange={(e) => updateEdu(i, "startDate", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <input
                      placeholder="End year"
                      value={edu.endDate || ""}
                      onChange={(e) => updateEdu(i, "endDate", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )
            )}
            <button type="button" onClick={addEducation} className="text-sm font-medium text-indigo-600 hover:underline">
              + Add another degree
            </button>
          </div>
        )}

        {stepId === "skills" && (
          <textarea
            rows={4}
            value={
              Array.isArray(values.skills)
                ? values.skills.join(", ")
                : typeof values.skills === "string"
                  ? values.skills
                  : ""
            }
            onChange={(e) => setValues((v) => ({ ...v, skills: e.target.value }))}
            placeholder="JavaScript, React, Node.js, SQL…"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
        {wizard.currentStep !== "fullName" && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction("back")}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Back
          </button>
        )}
        {step?.optional && (
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction("skip")}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Skip for now
          </button>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction(wizard.currentStep === "skills" ? "finish" : "next")}
          className="ml-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : wizard.currentStep === "skills" ? "Finish setup" : "Continue"}
        </button>
      </div>
    </div>
  );
}
