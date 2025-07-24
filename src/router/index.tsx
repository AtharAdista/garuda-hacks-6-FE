import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";
import Game from "../pages/GamePage";
import LoginForm from "@/features/auth/LoginForm";
import RegisterForm from "@/features/auth/RegisterForm";
import RoomPage from "@/pages/RoomPage";

function Encyclopedia() {
  return (
    <div className="pt-24 text-center text-2xl font-bold">
      Encyclopedia Page (Placeholder)
    </div>
  );
}
function Profile() {
  return (
    <div className="pt-24 text-center text-2xl font-bold">
      Profile Page (Placeholder)
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/game" element={<Game />} />
        <Route path="/encyclopedia" element={<Encyclopedia />} />
        <Route path="/profile" element={<Profile />} />

        {/* Auth */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/room" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}
