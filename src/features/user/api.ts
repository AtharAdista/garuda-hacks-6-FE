const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getCurrentUser() {
  const response = await fetch(`${BASE_URL}/api/user/current`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.errors || "Get current user failed");
  return data;
}
