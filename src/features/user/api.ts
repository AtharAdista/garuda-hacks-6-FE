const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getCurrentUser() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/api/user/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.errors || "Get current user failed");

  localStorage.setItem("id", data.data.id)
  return data;
}
