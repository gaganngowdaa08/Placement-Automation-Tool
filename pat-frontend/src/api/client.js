const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("authToken");
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(!isFormData && options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
  });
  const raw = await response.text();
  let responseBody = {};
  try { responseBody = raw ? JSON.parse(raw) : {}; }
  catch { responseBody = { message: raw || "The server returned an unreadable response." }; }
  if (!response.ok) {
    throw new Error(responseBody.message || `Request failed (${response.status}). Please try again.`);
  }
  return responseBody;
}
