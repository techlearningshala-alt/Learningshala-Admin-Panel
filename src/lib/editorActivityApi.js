import api from "./header";

/**
 * Records editor activity from client-submitted dirty field paths (mentor-only on server).
 * @param {{
 *   entity_type: string;
 *   entity_id: number;
 *   page_key?: string | null;
 *   changed_fields: string[];
 * }} payload
 */
export async function logEditorActivity(payload) {
  const res = await api.post("/admin-activity", payload);
  return res.data;
}

/**
 * Fetches editor activity logs (admin-only on server).
 * @param {{
 *   page?: number;
 *   limit?: number;
 *   action?: string;
 *   entity_type?: string;
 *   actor_role?: string;
 *   fromDate?: string;
 *   toDate?: string;
 * }} params
 */
export async function fetchEditorActivities(params = {}) {
  const res = await api.get("/admin-activity", { params });
  return res.data;
}
