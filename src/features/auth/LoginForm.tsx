import { useState } from "react";
import { loginUser } from "./api";
import { useAuth } from "./useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginForm({ onLogin }: { onLogin?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const token = await loginUser(email, password);
      await login(token);
      onLogin?.();
      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border p-2 rounded w-full"
      />
      {error && <div className="text-red-600">{error}</div>}
      <button
        type="submit"
        className="bg-pink-600 text-white px-4 py-2 rounded"
      >
        Login
      </button>
    </form>
  );
}
