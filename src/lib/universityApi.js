import api from "./header"; // Use shared axios instance with token interceptor

// ✅ Fetch all universities (paginated)
export const fetchUniversities = async ({ page = 1, limit = 10 } = {}) => {
  const res = await api.get(`/universities`, { params: { page, limit } });
  console.log(res.data,"data")
  return res.data; // { success, data, total, page, pages }
};

// ✅ Fetch all universities (for dropdowns - no pagination)
export const fetchAllUniversities = async () => {
  const res = await api.get(`/universities/list`);
  return res.data;
};

export async function fetchApprovals() {
  const res = await api.get(`/universities-approvals/name`);
  return res.data; // { success, data: { data } }
}
// ✅ Fetch single university by ID (for modal)
export const fetchUniversityById = async (id) => {
  const res = await api.get(`/universities/${id}`);
  return res.data.data; // full university object including banners & sections
};


// ✅ Add a new university
export const addUniversity = async (data) => {
  const res = await api.post(`/universities`, data);
  return res.data;
};

// ✅ Update university
export const updateUniversity = async (id, universityData) => {
  const res = await api.put(`/universities/${id}`, universityData);
  return res.data;
};

// ✅ Delete university
export const deleteUniversity = async (id) => {
  const res = await api.delete(`/universities/${id}`);
  return res.data;
};

// ✅ Toggle university status
export const toggleUniversityStatus = async (id, isActive) => {
  const res = await api.patch(`/universities/${id}/toggle-status`, { is_active: isActive });
  return res.data;
};

// ✅ Toggle university page visibility
export const toggleUniversityPageCreated = async (id, isPageCreated) => {
  const res = await api.patch(`/universities/${id}/toggle-page-created`, { is_page_created: isPageCreated });
  return res.data;
};

// ✅ Search universities (Elasticsearch)
export const searchUniversitiesApi = async (query, { page = 1, limit = 10 } = {}) => {
  const res = await api.get(`/universities/search`, { params: { q: query, page, limit } });
  return res.data; // { success, data: { data, total, page, pages } }
};


///////////////////  UNIVERSITY APPROVALS APIS   /////////////////////////////


// ✅ Fetch single university approvals
export const fetchUniversityApprovals = async ({ page = 1, limit = 10 }) => {
  const res = await api.get(`/universities-approvals`, { params: { page, limit } });
  return res.data; // full university object including banners & sections
};


// ✅ Add a new university approvals
export const addUniversityApprovals = async (data) => {
  const res = await api.post(`/universities-approvals`, data);
  return res.data;
};

export async function updateUniversityApprovals(id, data) {
  const res = await api.put(`/universities-approvals/${id}`, data);
  return res.data;
}



export const deleteUniversityApprovals = async (id) => {
  const res = await api.delete(`/universities-approvals/${id}`);
  return res.data; // full university object including banners & sections
};

// ========================================
// Placement Partners API
// ========================================

// Fetch all placement partners (with pagination)
export async function fetchPlacementPartners({ page = 1, limit = 10 } = {}) {
  const res = await api.get(`/placement-partners`, {
    params: { page, limit }
  });
  return res.data;
}

// Fetch ALL placement partners (no pagination - for dropdowns)
export async function fetchAllPlacementPartners() {
  const res = await api.get(`/placement-partners`, {
    params: { page: 1, limit: 1000 } // Large limit to get all
  });
  return res.data;
}

// Add a new placement partner
export const addPlacementPartner = async (formData) => {
  const res = await api.post(`/placement-partners`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update existing placement partner
export const updatePlacementPartner = async (id, formData) => {
  const res = await api.put(`/placement-partners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete a placement partner
export const deletePlacementPartner = async (id) => {
  const res = await api.delete(`/placement-partners/${id}`);
  return res.data;
};

// ========================================
// EMI Partners API
// ========================================

// Fetch all EMI partners (with pagination)
export async function fetchEmiPartners({ page = 1, limit = 10 } = {}) {
  const res = await api.get(`/emi-partners`, {
    params: { page, limit }
  });
  return res.data;
}

// Fetch ALL EMI partners (no pagination - for dropdowns)
export async function fetchAllEmiPartners() {
  const res = await api.get(`/emi-partners`, {
    params: { page: 1, limit: 1000 } // Large limit to get all
  });
  return res.data;
}

// Add a new EMI partner
export const addEmiPartner = async (formData) => {
  const res = await api.post(`/emi-partners`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update an EMI partner
export const updateEmiPartner = async (id, formData) => {
  const res = await api.put(`/emi-partners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Delete an EMI partner
export const deleteEmiPartner = async (id) => {
  const res = await api.delete(`/emi-partners/${id}`);
  return res.data;
};

// ========================================
// University Courses API
// ========================================

export async function fetchUniversityCourses({
  page = 1,
  limit = 10,
  university_id,
  search,
} = {}) {
  const params = { page, limit };
  if (university_id) params.university_id = university_id;
  if (search) params.search = search;

  const res = await api.get(`/university-courses`, { params });
  return res.data;
}

export async function fetchUniversityCourseById(id) {
  if (!id) throw new Error("Course ID is required");
  const res = await api.get(`/university-courses/id/${id}`);
  
  let courseData = res.data;
  if (res.data?.data && typeof res.data.data === 'object') {
    courseData = res.data.data;
  }
  
  return courseData;
}

export async function fetchUniversityCourseBySlugs(universitySlug, courseSlug) {
  if (!universitySlug || !courseSlug) {
    throw new Error("University slug and course slug are required");
  }
  const res = await api.get(`/university-courses/${universitySlug}/${courseSlug}`);
  let courseData = res.data;
  if (res.data?.data && typeof res.data.data === 'object') {
    courseData = res.data.data;
  }
  return courseData;
}

export const createUniversityCourse = async (formData) => {
  const res = await api.post(`/university-courses`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateUniversityCourseApi = async (id, formData) => {
  const res = await api.put(`/university-courses/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteUniversityCourse = async (id) => {
  const res = await api.delete(`/university-courses/${id}`);
  return res.data;
};

export const toggleUniversityCourseStatus = async (id, isActive) => {
  const res = await api.patch(`/university-courses/${id}/toggle-status`, { is_active: isActive });
  return res.data;
};

export const toggleUniversityCoursePageCreated = async (id, isPageCreated) => {
  const res = await api.patch(`/university-courses/${id}/toggle-page-created`, { is_page_created: isPageCreated });
  return res.data;
};

// ========================================
// University Course Specializations API
// ========================================

export async function fetchUniversityCourseSpecializations({
  page = 1,
  limit = 10,
  university_id,
  university_course_id,
  search,
} = {}) {
  const params = { page, limit };
  if (university_id) params.university_id = university_id;
  if (university_course_id) params.university_course_id = university_course_id;
  if (search) params.search = search;

  const res = await api.get(`/university-course-specializations`, { params });
  return res.data;
}

export async function fetchUniversityCourseSpecializationById(idOrSlug) {
  const res = await api.get(`/university-course-specializations/${idOrSlug}`);
  
  let specializationData = res.data;
  // Check if response is wrapped in a data property (standard API response format)
  if (res.data?.data && typeof res.data.data === 'object' && res.data.data !== null) {
    specializationData = res.data.data;
  } else if (res.data && typeof res.data === 'object' && res.data !== null && res.data.id) {
    // Response might be directly the specialization object
    specializationData = res.data;
  }
  
  return specializationData;
}

export async function fetchUniversityCourseSpecializationOptions(university_course_id) {
  const res = await api.get(`/university-course-specializations/options`, {
    params: { university_course_id },
  });
  return res.data;
}

export const createUniversityCourseSpecialization = async (formData) => {
  const res = await api.post(`/university-course-specializations`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateUniversityCourseSpecialization = async (id, formData) => {
  const res = await api.put(`/university-course-specializations/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteUniversityCourseSpecialization = async (id) => {
  const res = await api.delete(`/university-course-specializations/${id}`);
  return res.data;
};

export const toggleUniversityCourseSpecializationPageCreated = async (id, isPageCreated) => {
  const res = await api.patch(`/university-course-specializations/${id}/toggle-page-created`, { is_page_created: isPageCreated });
  return res.data;
};

export const toggleUniversityCourseSpecializationStatus = async (id, isActive) => {
  const res = await api.patch(`/university-course-specializations/${id}/toggle-status`, { is_active: isActive });
  return res.data;
};

// ========================================
// Fee Types API
// ========================================

export async function fetchFeeTypes({ page = 1, limit = 10, search } = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  const res = await api.get(`/fee-types`, { params });
  return res.data;
}

export async function fetchFeeTypeById(id) {
  const res = await api.get(`/fee-types/${id}`);
  return res.data?.data || res.data;
}

export async function createFeeType(payload) {
  const res = await api.post(`/fee-types`, payload);
  return res.data;
}

export async function updateFeeType(id, payload) {
  const res = await api.put(`/fee-types/${id}`, payload);
  return res.data;
}

export async function deleteFeeType(id) {
  const res = await api.delete(`/fee-types/${id}`);
  return res.data;
}

// ===== University Course FAQ APIs =====

export async function fetchUniversityCourseFaqs({ page = 1, limit = 10, course_id, category_id }) {
  const params = { page, limit };
  if (course_id) params.course_id = course_id;
  if (category_id) params.category_id = category_id;
  
  const res = await api.get(`/university-courses/faqs/`, {
    params,
  });
  return res.data; // { success, data: { data, page, pages, total } }
}

export async function addUniversityCourseFaq(payload) {
  const res = await api.post(`/university-courses/faqs/questions`, payload);
  return res.data;
}

export async function updateUniversityCourseFaq(id, payload) {
  const res = await api.put(`/university-courses/faqs/questions/${id}`, payload);
  return res.data;
}

export async function deleteUniversityCourseFaq(id) {
  const res = await api.delete(`/university-courses/faqs/questions/${id}`);
  return res.data;
}

export async function fetchUniversityCourseFaqById(id) {
  const res = await api.get(`/university-courses/faqs/questions/${id}`);
  return res.data?.data || res.data;
}

// ===== University Course Specialization FAQ APIs =====

export async function fetchUniversityCourseSpecializationFaqs({ page = 1, limit = 10, specialization_id, category_id }) {
  const params = { page, limit };
  if (specialization_id) params.specialization_id = specialization_id;
  if (category_id) params.category_id = category_id;
  
  const res = await api.get(`/university-course-specializations/faqs/`, {
    params,
  });
  return res.data; // { success, data: { data, page, pages, total } }
}

export async function addUniversityCourseSpecializationFaq(payload) {
  const res = await api.post(`/university-course-specializations/faqs/questions`, payload);
  return res.data;
}

export async function updateUniversityCourseSpecializationFaq(id, payload) {
  const res = await api.put(`/university-course-specializations/faqs/questions/${id}`, payload);
  return res.data;
}

export async function deleteUniversityCourseSpecializationFaq(id) {
  const res = await api.delete(`/university-course-specializations/faqs/questions/${id}`);
  return res.data;
}

export async function fetchUniversityCourseSpecializationFaqById(id) {
  const res = await api.get(`/university-course-specializations/faqs/questions/${id}`);
  return res.data?.data || res.data;
}