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

// Fetch marketing leads (paginated)
export async function fetchLeads({ page = 1, limit = 10, search, fromDate, toDate } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  const res = await api.get("/leads", { params });
  return res.data;
}

// Fetch website leads (paginated)
export async function fetchWebsiteLeads({ page = 1, limit = 10, search, fromDate, toDate } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  const res = await api.get("/website/leads", { params });
  return res.data;
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

// Create user (admin only)
export const createUser = async (data) => {
  const res = await api.post("/admin/users", data);
  return res.data;
};

// Get all users (admin only) - filter by role if provided
export const fetchUsers = async ({ page = 1, limit = 10, role } = {}) => {
  const params = { page, limit };
  if (role) params.role = role;
  const res = await api.get("/admin/users", { params });
  return res.data;
};

// Get user by ID
export const getUser = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data;
};

// Update user (admin only)
export const updateUser = async (id, data) => {
  const res = await api.put(`/admin/users/${id}`, data);
  return res.data;
};

// Delete user (admin only)
export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

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

// ===== University FAQ APIs =====

export async function fetchUniversityFaqs({ page = 1, limit = 10, university_id, category_id }) {
  const params = { page, limit };
  if (university_id) params.university_id = university_id;
  if (category_id) params.category_id = category_id;
  
  const res = await api.get(`/universities/faqs/`, {
    params,
  });
  return res.data; // { success, data: { data, page, pages, total } }
}

export async function fetchUniversityFaqCategories({ page = 1, limit = 10 } = {}) {
  const res = await api.get(`/universities/faqs/categories`, {
    params: { page, limit },
  });
  return res.data; // { success, data: { data, page, pages, total } }
}

export async function addUniversityFaq(payload) {
  const res = await api.post(`/universities/faqs/questions`, payload);
  return res.data;
}

export async function updateUniversityFaq(id, payload) {
  const res = await api.put(`/universities/faqs/questions/${id}`, payload);
  return res.data;
}

export async function deleteUniversityFaq(id) {
  const res = await api.delete(`/universities/faqs/questions/${id}`);
  return res.data;
}

export async function addUniversityFaqCategory(payload) {
  const res = await api.post(`/universities/faqs/`, payload);
  return res.data;
}

export async function updateUniversityFaqCategory(id, payload) {
  const res = await api.put(`/universities/faqs/${id}`, payload);
  return res.data;
}

export async function deleteUniversityFaqCategory(id) {
  const res = await api.delete(`/universities/faqs/${id}`);
  return res.data;
}

// ===== University Types APIs =====

export async function fetchUniversityTypes({ page = 1, limit = 10 } = {}) {
  const res = await api.get(`/universities/types`, {
    params: { page, limit },
  });
  return res.data; // { success, data: { data, page, pages, total } }
}

export async function addUniversityType(payload) {
  const res = await api.post(`/universities/types`, payload);
  return res.data;
}

export async function updateUniversityType(id, payload) {
  const res = await api.put(`/universities/types/${id}`, payload);
  return res.data;
}

export async function deleteUniversityType(id) {
  const res = await api.delete(`/universities/types/${id}`);
  return res.data;
}

// Fetch all universities for dropdown (no pagination)
export async function fetchAllUniversities() {
  const res = await api.get(`/universities/list`);
  return res.data;
}

// ===== Blog Categories APIs =====

export async function fetchBlogCategories({ page = 1, limit = 10 } = {}) {
  const res = await api.get(`/blog-categories`, {
    params: { page, limit },
  });
  return res.data; // { success, data: { data, page, pages, total } }
}

export async function addBlogCategory(payload) {
  const res = await api.post(`/blog-categories`, payload);
  return res.data;
}

export async function updateBlogCategory(id, payload) {
  const res = await api.put(`/blog-categories/${id}`, payload);
  return res.data;
}

export async function deleteBlogCategory(id) {
  const res = await api.delete(`/blog-categories/${id}`);
  return res.data;
}

// ===== Blogs APIs =====

export async function fetchBlogs({ page = 1, limit = 10, search, category_id } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (category_id) params.category_id = category_id;
  const res = await api.get(`/blogs`, { params });
  return res.data; // { success, data: { data, page, pages, total } }
}

export async function fetchBlogById(id) {
  const res = await api.get(`/blogs/${id}`);
  return res.data;
}

export async function addBlog(formData) {
  const res = await api.post(`/blogs`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateBlog(id, formData) {
  const res = await api.put(`/blogs/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteBlog(id) {
  const res = await api.delete(`/blogs/${id}`);
  return res.data;
}

export async function toggleBlogVerified(id, verified) {
  const res = await api.patch(`/blogs/${id}/toggle-verified`, { verified });
  return res.data;
}

// ===== Blog FAQ APIs =====

export async function fetchBlogFaqs({ page = 1, limit = 10, blog_id, category_id } = {}) {
  const params = { page, limit };
  if (blog_id) params.blog_id = blog_id;
  if (category_id) params.category_id = category_id;
  const res = await api.get(`/blogs/faqs/`, { params });
  return res.data;
}

export async function fetchBlogFaqCategories({ page = 1, limit = 10 } = {}) {
  const res = await api.get(`/blogs/faqs/categories`, {
    params: { page, limit },
  });
  return res.data;
}

export async function addBlogFaq(payload) {
  const res = await api.post(`/blogs/faqs/questions`, payload);
  return res.data;
}

export async function updateBlogFaq(id, payload) {
  const res = await api.put(`/blogs/faqs/questions/${id}`, payload);
  return res.data;
}

export async function deleteBlogFaq(id) {
  const res = await api.delete(`/blogs/faqs/questions/${id}`);
  return res.data;
}

export async function fetchBlogFaqsByBlogId(blogId) {
  const res = await api.get(`/blogs/faqs/blogs/${blogId}/questions`);
  return res.data;
}

export async function addBlogFaqCategory(payload) {
  const res = await api.post(`/blogs/faqs/categories`, payload);
  return res.data;
}

export async function updateBlogFaqCategory(id, payload) {
  const res = await api.put(`/blogs/faqs/categories/${id}`, payload);
  return res.data;
}

export async function deleteBlogFaqCategory(id) {
  const res = await api.delete(`/blogs/faqs/categories/${id}`);
  return res.data;
}

// ===== Contact Us APIs =====

// Fetch contact us messages (paginated)
export async function fetchContactUs({ page = 1, limit = 10, search, fromDate, toDate } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  const res = await api.get("/contact-us", { params });
  return res.data;
}

// Delete a contact us message
export async function deleteContactUs(id) {
  const res = await api.delete(`/contact-us/${id}`);
  return res.data;
}

// ===== Auth/OTP APIs =====

// Verify OTP after login
export async function verifyOtp(email, otp) {
  const res = await api.post("/users/verify-otp", { email, otp });
  return res.data;
}

// ===== Dashboard APIs =====

// Fetch complete dashboard data (statistics, recent activity, today/week stats)
export async function fetchDashboardData() {
  const res = await api.get("/dashboard");
  return res.data; // { success, data: { statistics, recentActivity, todayStats, weekStats } }
}

// Fetch only statistics
export async function fetchDashboardStatistics() {
  const res = await api.get("/dashboard/statistics");
  return res.data; // { success, data: { leads, websiteLeads, ... } }
}

// Fetch recent activity
export async function fetchRecentActivity() {
  const res = await api.get("/dashboard/recent-activity");
  return res.data; // { success, data: { recentLeads, recentWebsiteLeads, ... } }
}

