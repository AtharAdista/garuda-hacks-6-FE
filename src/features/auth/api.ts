const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/authentication/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.errors || "Login failed");
  return data.data.token as string;
}

export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  console.log(BASE_URL);

  const response = await fetch(`${BASE_URL}/api/authentication/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.errors || "Register failed");
  return data.data.username as string;
}