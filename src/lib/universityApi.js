import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Fetch all universities (paginated)
export const fetchUniversities = async ({ page = 1, limit = 10 } = {}) => {
  const res = await axios.get(`${BASE_URL}/universities`, { params: { page, limit } });
  console.log(res.data,"data")
  return res.data; // { success, data, total, page, pages }
};

// ✅ Fetch all universities (for dropdowns - no pagination)
export const fetchAllUniversities = async () => {
  const res = await axios.get(`${BASE_URL}/universities/list`);
  return res.data;
};

export async function fetchApprovals() {
  const res = await axios.get(`${BASE_URL}/universities-approvals/name`, {
  });
  return res.data; // { success, data: { data } }
}
// ✅ Fetch single university by ID (for modal)
export const fetchUniversityById = async (id) => {
  const res = await axios.get(`${BASE_URL}/universities/${id}`);
  return res.data.data; // full university object including banners & sections
};


// ✅ Add a new university
export const addUniversity = (data) => {
  const res =  axios.post(`${BASE_URL}/universities`, data);
  return res.data
};

// ✅ Update university

export async function updateDomain(id, data) {
  const res = await axios.put(`${BASE_URL}/domains/${id}`, data);
  return res.data;
}
export const updateUniversity = (id, universityData) => {
  const res = axios.put(`${BASE_URL}/universities/${id}`, universityData);
  return res.data;
};

// ✅ Delete university
export const deleteUniversity = (id) => {
  return axios.delete(`${BASE_URL}/universities/${id}`);
};

// ✅ Toggle university status
export const toggleUniversityStatus = async (id, isActive) => {
  const res = await axios.patch(`${BASE_URL}/universities/${id}/toggle-status`, { is_active: isActive });
  return res.data;
};


///////////////////  UNIVERSITY APPROVALS APIS   /////////////////////////////


// ✅ Fetch single university approvals
export const fetchUniversityApprovals = async ({ page = 1, limit = 10 }) => {
  const res = await axios.get(`${BASE_URL}/universities-approvals/`, { params: { page, limit } });
  return res.data; // full university object including banners & sections
};


// ✅ Add a new university approvals
export const addUniversityApprovals = (data) => {
  const res =  axios.post(`${BASE_URL}/universities-approvals`, data);
  return res.data
};

export async function updateUniversityApprovals(id, data) {
  const res = await axios.put(`${BASE_URL}/universities-approvals/${id}`, data);
  return res.data;
}



export const deleteUniversityApprovals = async (id) => {
  const res = await axios.delete(`${BASE_URL}/universities-approvals/${id}`);
  return res.data; // full university object including banners & sections
};

// ========================================
// Placement Partners API
// ========================================

// Fetch all placement partners (with pagination)
export async function fetchPlacementPartners({ page = 1, limit = 10 } = {}) {
  const res = await axios.get(`${BASE_URL}/placement-partners`, {
    params: { page, limit }
  });
  return res.data;
}

// Fetch ALL placement partners (no pagination - for dropdowns)
export async function fetchAllPlacementPartners() {
  const res = await axios.get(`${BASE_URL}/placement-partners`, {
    params: { page: 1, limit: 1000 } // Large limit to get all
  });
  return res.data;
}

// Add a new placement partner
export const addPlacementPartner = (formData) =>
  axios.post(`${BASE_URL}/placement-partners`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Update existing placement partner
export const updatePlacementPartner = (id, formData) =>
  axios.put(`${BASE_URL}/placement-partners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete a placement partner
export const deletePlacementPartner = (id) =>
  axios.delete(`${BASE_URL}/placement-partners/${id}`);

// ========================================
// EMI Partners API
// ========================================

// Fetch all EMI partners (with pagination)
export async function fetchEmiPartners({ page = 1, limit = 10 } = {}) {
  const res = await axios.get(`${BASE_URL}/emi-partners`, {
    params: { page, limit }
  });
  return res.data;
}

// Fetch ALL EMI partners (no pagination - for dropdowns)
export async function fetchAllEmiPartners() {
  const res = await axios.get(`${BASE_URL}/emi-partners`, {
    params: { page: 1, limit: 1000 } // Large limit to get all
  });
  return res.data;
}

// Add a new EMI partner
export const addEmiPartner = (formData) =>
  axios.post(`${BASE_URL}/emi-partners`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Update an EMI partner
export const updateEmiPartner = (id, formData) =>
  axios.put(`${BASE_URL}/emi-partners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete an EMI partner
export const deleteEmiPartner = (id) =>
  axios.delete(`${BASE_URL}/emi-partners/${id}`);