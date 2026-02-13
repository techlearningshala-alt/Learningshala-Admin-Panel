import api from "../header"; // Use shared axios instance with token interceptor

export const fetchRedirections = async (page = 1, limit = 20, search = "") => {
  const params = { page, limit };
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const response = await api.get(`/redirections`, { params });
  return response.data;
};

export const fetchRedirectionById = async (id) => {
  const response = await api.get(`/redirections/${id}`);
  return response.data;
};

export const addRedirection = async (data) => {
  const response = await api.post("/redirections", data);
  return response.data;
};

export const updateRedirection = async (id, data) => {
  const response = await api.put(`/redirections/${id}`, data);
  return response.data;
};

export const deleteRedirection = async (id) => {
  const response = await api.delete(`/redirections/${id}`);
  return response.data;
};
