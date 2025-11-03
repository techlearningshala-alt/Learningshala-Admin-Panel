// import api from "api";

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ```js
import api from "@/lib/header"; // ✅ use the shared authenticated instance

// Fetch mentors (paginated)
export async function fetchMentors({ page = 1, limit = 10 }) {
  const res = await api.get("/mentors", {
    params: { page, limit },
  });
  return res.data; // { success, data, total, page, pages }
}

// Add a new mentor
export const addMentor = (formData) =>
  api.post("/mentors", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Update existing mentor
export const updateMentor = (id, formData) =>
  api.put(`/mentors/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete a mentor
export const deleteMentor = (id) => api.delete(`/mentors/${id}`);


// export async function fetchMentors({ page = 1, limit = 10 }) {
//   const res = await api.get(`/mentors`, {
//     params: { page, limit }
//   });
//   return res.data; // { success, data, total, page, pages }
// }

// export const addMentor = (formData) =>
//   api.post(`/mentors`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

// export const updateMentor = (id, formData) =>
//   api.put(`/mentors/${id}`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });

// export const deleteMentor = (id) =>
//   api.delete(`/mentors/${id}`);

// ===== Media Spotlight APIs =====

// Fetch paginated media spotlights
export async function fetchMediaSpotlights({ page = 1, limit = 10 }) {
  const res = await api.get(`/media-spotlight`, {
    params: { page, limit },
  });
  return res.data; // { success, data, total, page, pages }
}

// Add a new media spotlight
export async function addMediaSpotlight(formData) {
  const res = await api.post(`/media-spotlight`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Update media spotlight
export async function updateMediaSpotlight(id, formData) {
  const res = await api.put(`/media-spotlight/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Delete media spotlight
export async function deleteMediaSpotlight(id) {
  const res = await api.delete(`/media-spotlight/${id}`);
  return res.data;
}


// ===== student testimonials APIs =====

export async function fetchTestimonials({ page = 1, limit = 10 }) {
  const res = await api.get(`/student-testimonials`, {
    params: { page, limit },
  });
  return res.data.data; // { data, total, page, pages }
}

export async function deleteTestimonial(id) {
  const res = await api.delete(`/student-testimonials/${id}`);
  return res.data;
}

export async function addTestimonial(formData) {
  const res = await api.post(`/student-testimonials`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateTestimonial(id, formData) {
  const res = await api.put(`/student-testimonials/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}


// ===== faq category APIs =====

// ✅ Fetch all FAQ categories with pagination
export async function fetchFaqCategories({ page = 1, limit = 10 }) {
  const res = await api.get(`/faqs/categories`, {
    params: { page, limit },
  });
  return res.data; // { success, data: { data: [], page, pages, total } }
}

// ✅ Add a new FAQ category
export async function addFaqCategory(payload) {
  const res = await api.post(`/faqs/`, payload);
  return res.data;
}

// ✅ Update an FAQ category
export async function updateFaqCategory(id, payload) {
  const res = await api.put(`/faqs/${id}`, payload);
  return res.data;
}

// ✅ Delete an FAQ category
export async function deleteFaqCategory(id) {
  return api.delete(`/faqs/${id}`);
}


// ===== faq APIs =====

export async function fetchFaqs({ page = 1, limit = 10 }) {
  const res = await api.get(`/faqs/`, {
    params: { page, limit },
  });
  return res.data; // { success, data: { data, page, pages, total } }
}

export async function fetchCategories() {
  const res = await api.get(`/faqs/categories`, {
    params: { page: 1, limit: 10 },
  });
  return res.data; // { success, data: { data } }
}

export async function addFaq(payload) {
  const res = await api.post(`/faqs/questions`, payload);
  return res.data;
}

export async function updateFaq(id, payload) {
  const res = await api.put(`/faqs/questions/${id}`, payload);
  return res.data;
}

export async function deleteFaq(id) {
  const res = await api.delete(`/faqs/questions/${id}`);
  return res.data;
}

