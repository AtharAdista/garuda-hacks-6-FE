import { useEffect, useState } from "react";
import { getCurrentUser } from "@/features/user/api";

export default function ProfilePage() {
  const [user, setUser] = useState<{
    username: string;
    email: string;
    id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setUser({
          username: data.data.username,
          email: data.data.email,
          id: data.data.id,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch user info");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-blue-400 flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl text-white font-bold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
            Profile
          </h2>
          <p className="text-gray-500 mb-6">Your account information</p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            <span className="w-28 font-semibold text-gray-700">Username</span>
            <span className="ml-2 text-gray-900">{user?.username}</span>
          </div>
          <div className="flex items-center">
            <span className="w-28 font-semibold text-gray-700">Email</span>
            <span className="ml-2 text-gray-900">{user?.email}</span>
          </div>
          <div className="flex items-center">
            <span className="w-28 font-semibold text-gray-700">User ID</span>
            <span className="ml-2 text-gray-900">{user?.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
