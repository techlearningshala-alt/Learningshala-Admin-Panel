import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/cms";

const resumeApi = axios.create({ baseURL });

export async function listTemplates() {
  const { data } = await resumeApi.get("/resumes/templates");
  return data;
}

export async function generateResume(payload) {
  const { data } = await resumeApi.post("/resumes/generate", payload);
  return data;
}

export async function uploadResume(file, options = {}) {
  const form = new FormData();
  form.append("file", file);
  if (options.templateKey) form.append("templateKey", options.templateKey);
  const { data } = await resumeApi.post("/resumes/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getResume(id) {
  const { data } = await resumeApi.get(`/resumes/${id}`);
  return data;
}

export async function getWizard(id) {
  const { data } = await resumeApi.get(`/resumes/${id}/wizard`);
  return data;
}

export async function submitWizardStep(id, payload) {
  const { data } = await resumeApi.post(`/resumes/${id}/wizard/step`, payload);
  return data;
}

export async function updateResume(id, payload, options = {}) {
  const { data } = await resumeApi.put(`/resumes/${id}`, {
    ...payload,
    partial: options.partial ?? false,
    draft: options.draft ?? false,
  });
  return data;
}

export async function chatEditResume(id, message, history = []) {
  const { data } = await resumeApi.post(`/resumes/${id}/chat`, { message, history });
  return data;
}

export async function fetchPreviewHtml(id, templateKey = "classic") {
  const { data } = await resumeApi.get(`/resumes/${id}/preview/${templateKey}`, {
    responseType: "text",
    transformResponse: [(raw) => raw],
    headers: { Accept: "text/html" },
  });
  return data;
}

export function previewUrl(id, templateKey = "classic", cacheBust) {
  const t = cacheBust ? `?t=${cacheBust}` : "";
  return `${baseURL}/resumes/${id}/preview/${templateKey}${t}`;
}

export async function downloadResumePdf(id, templateKey = "classic") {
  const res = await resumeApi.get(`/resumes/${id}/download/${templateKey}`, {
    responseType: "blob",
  });

  const blob = res.data;
  if (blob?.type?.includes("application/json")) {
    const text = await blob.text();
    const json = JSON.parse(text);
    throw new Error(json.error || "PDF download failed");
  }

  return blob;
}

export function downloadUrl(id, templateKey = "classic") {
  return `${baseURL}/resumes/${id}/download/${templateKey}`;
}

export default resumeApi;
