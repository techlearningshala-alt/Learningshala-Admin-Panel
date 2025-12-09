import api from "./header"; // Use shared axios instance with token interceptor

// Fetch paginated domains
export async function fetchDomains({ page = 1, limit = 10 }) {
  const res = await api.get(`/domains`, { params: { page, limit } });
  return res.data;
}

export async function fetchDomainsForCourse({ page = 1, limit = 100 }) {
  const res = await api.get(`/domains`, { params: { page, limit } });
  console.log(res.data,"dataaaa")
  return res.data;
}

// Add a new domain
export async function addDomain(data) {
  const res = await api.post(`/domains`, data);
  return res.data;
}

// Update domain
export async function updateDomain(id, data) {
  const res = await api.put(`/domains/${id}`, data);
  return res.data;
}

// Delete domain
export async function deleteDomain(id) {
  const res = await api.delete(`/domains/${id}`);
  return res.data;
}


///////////////////////    COURSES APIS    ///////////////////////////

// Fetch courses with pagination
export async function fetchCourses({ page = 1, limit = 10 }) {
  const res = await api.get(`/courses`, {
    params: { page, limit },
  });
  return res.data;
}

// Fetch courses with names
export async function findAllCourseName() {
  const res = await api.get(`/courses/course-name`);
  return res.data;
}

// Fetch single course by id
export async function fetchCourseById(id) {
  const res = await api.get(`/courses/${id}`);
  return res.data;
}

// Add a new course
export async function addCourse(formData) {
  const res = await api.post(`/courses`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Update an existing course
export async function updateCourse(id, formData) {
  const res = await api.put(`/courses/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Delete a course
export async function deleteCourse(id) {
  const res = await api.delete(`/courses/${id}`);
  return res.data;
}

export async function toggleCourseStatus(id, is_active) {
  const res = await api.patch(`/courses/${id}/toggle-status`, { is_active });
  return res.data;
}

export async function toggleCourseMenuVisibility(id, menu_visibility) {
  const res = await api.patch(`/courses/${id}/toggle-menu-visibility`, {
    menu_visibility,
  });
  return res.data;
}

///////////////////////    COURSE FAQ APIS    ///////////////////////////

export async function fetchCourseFaqs({ page = 1, limit = 10, course_id, category_id }) {
  const params = { page, limit };
  if (course_id) params.course_id = course_id;
  if (category_id) params.category_id = category_id;
  
  const res = await api.get(`/courses/faqs/`, {
    params,
  });
  return res.data;
}

export async function fetchCourseFaqCategories({ page = 1, limit = 10 } = {}) {
  const res = await api.get(`/courses/faqs/categories`, {
    params: { page, limit },
  });
  return res.data;
}

export async function addCourseFaq(payload) {
  const res = await api.post(`/courses/faqs/questions`, payload);
  return res.data;
}

export async function updateCourseFaq(id, payload) {
  const res = await api.put(`/courses/faqs/questions/${id}`, payload);
  return res.data;
}

export async function deleteCourseFaq(id) {
  const res = await api.delete(`/courses/faqs/questions/${id}`);
  return res.data;
}

export async function fetchCourseFaqsByCourseId(courseId) {
  const res = await api.get(`/courses/faqs/courses/${courseId}/questions`);
  return res.data;
}

export async function addCourseFaqCategory(payload) {
  const res = await api.post(`/courses/faqs/`, payload);
  return res.data;
}

export async function updateCourseFaqCategory(id, payload) {
  const res = await api.put(`/courses/faqs/${id}`, payload);
  return res.data;
}

export async function deleteCourseFaqCategory(id) {
  const res = await api.delete(`/courses/faqs/${id}`);
  return res.data;
}


///////////////////////    SPECIALIZATION APIS    ///////////////////////////

// Fetch SPECIALIZATION with pagination
export async function fetchSpecialization({ page = 1, limit = 10 }) {
  const res = await api.get(`/specializations`, {
    params: { page, limit },
  });
  return res.data;
}

// Fetch single specialization by id
export async function fetchSpecializationById(id) {
  const res = await api.get(`/specializations/${id}`);
  return res.data;
}

// Add a new SPECIALIZATION
export async function addSpecialization(formData) {
  const res = await api.post(`/specializations`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Update an existing SPECIALIZATION
export async function updateSpecializations(id, formData) {
  const res = await api.put(`/specializations/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Delete a SPECIALIZATION
export async function deleteSpecializations(id) {
  const res = await api.delete(`/specializations/${id}`);
  return res.data;
}

export async function toggleSpecializationStatus(id, is_active) {
  const res = await api.patch(`/specializations/${id}/toggle-status`, { is_active });
  return res.data;
}

export async function toggleSpecializationMenuVisibility(id, menu_visibility) {
  const res = await api.patch(`/specializations/${id}/toggle-menu-visibility`, {
    menu_visibility,
  });
  return res.data;
}

///////////////////////    SPECIALIZATION FAQ APIS    ///////////////////////////

export async function fetchSpecializationFaqsBySpecializationId(specializationId) {
  const res = await api.get(`/specializations/faqs/specializations/${specializationId}/questions`);
  return res.data;
}

///////////////////////    COURSE IMAGES APIS    ///////////////////////////

// Fetch course images with pagination
export async function fetchCourseImages({ page = 1, limit = 10 }) {
  const res = await api.get(`/course-images`, {
    params: { page, limit },
  });
  return res.data;
}

// Fetch all course images for select dropdown
export async function fetchAllCourseImages() {
  const res = await api.get(`/course-images/select`);
  return res.data;
}

// Fetch single course image by id
export async function fetchCourseImageById(id) {
  const res = await api.get(`/course-images/${id}`);
  return res.data;
}

// Add a new course image
export async function addCourseImage(formData) {
  const res = await api.post(`/course-images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// Update course image
export async function updateCourseImage(id, formData) {
  const res = await api.put(`/course-images/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

// Delete course image
export async function deleteCourseImage(id) {
  const res = await api.delete(`/course-images/${id}`);
  return res.data;
}

export async function addSpecializationFaq(data) {
  const res = await api.post(`/specializations/faqs/questions`, data);
  return res.data;
}

export async function updateSpecializationFaq(id, data) {
  const res = await api.put(`/specializations/faqs/questions/${id}`, data);
  return res.data;
}

export async function deleteSpecializationFaq(id) {
  const res = await api.delete(`/specializations/faqs/questions/${id}`);
  return res.data;
}