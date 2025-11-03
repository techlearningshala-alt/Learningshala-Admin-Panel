import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch paginated domains
export async function fetchDomains({ page = 1, limit = 10 }) {
  const res = await axios.get(`${BASE_URL}/domains?page=${page}&limit=${limit}`);
  return res.data;
}

export async function fetchDomainsForCourse({ page = 1, limit = 100 }) {
  const res = await axios.get(`${BASE_URL}/domains?page=${page}&limit=${limit}`);
  console.log(res.data,"dataaaa")
  return res.data;
}

// Add a new domain
export async function addDomain(data) {
  const res = await axios.post(`${BASE_URL}/domains`, data);
  return res.data;
}

// Update domain
export async function updateDomain(id, data) {
  const res = await axios.put(`${BASE_URL}/domains/${id}`, data);
  return res.data;
}

// Delete domain
export async function deleteDomain(id) {
  const res = await axios.delete(`${BASE_URL}/domains/${id}`);
  return res.data;
}


///////////////////////    COURSES APIS    ///////////////////////////

// Fetch courses with pagination
export async function fetchCourses({ page = 1, limit = 10 }) {
  const res = await axios.get(`${BASE_URL}/courses`, {
    params: { page, limit },
  });
  return res.data;
}

// Fetch courses with names
export async function findAllCourseName() {
  const res = await axios.get(`${BASE_URL}/courses/course-name`);
  return res.data;
}

// Add a new course
export async function addCourse(formData) {
  const res = await axios.post(`${BASE_URL}/courses`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Update an existing course
export async function updateCourse(id, formData) {
  const res = await axios.put(`${BASE_URL}/courses/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Delete a course
export async function deleteCourse(id) {
  const res = await axios.delete(`${BASE_URL}/courses/${id}`);
  return res.data;
}


///////////////////////    SPECIALIZATION APIS    ///////////////////////////

// Fetch SPECIALIZATION with pagination
export async function fetchSpecialization({ page = 1, limit = 10 }) {
  const res = await axios.get(`${BASE_URL}/specializations`, {
    params: { page, limit },
  });
  return res.data;
}

// Add a new SPECIALIZATION
export async function addSpecialization(formData) {
  const res = await axios.post(`${BASE_URL}/specializations`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Update an existing SPECIALIZATION
export async function updateSpecializations(id, formData) {
  const res = await axios.put(`${BASE_URL}/specializations/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Delete a SPECIALIZATION
export async function deleteSpecializations(id) {
  const res = await axios.delete(`${BASE_URL}/specializations/${id}`);
  return res.data;
}