const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const response = await fetch(`${BASE_URL}/api/user/current`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();

  if (!response.ok)
    throw new Error(data.errors || data.message || "Get current user failed");
  if (data?.data?.username) {
    localStorage.setItem("username", data.data.username);
    localStorage.setItem("email", data.data.email);
  }
  return data;
}
