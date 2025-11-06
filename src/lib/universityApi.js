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