export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }
  return data;
};
