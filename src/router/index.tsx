import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";
import GamePage from "../pages/GamePage";
import EncyclopediaPage from "../pages/EncyclopediaPage";
import LoginForm from "@/features/auth/LoginForm";
import RegisterForm from "@/features/auth/RegisterForm";
import RoomPage from "@/pages/RoomPage";
import ProfilePage from "@/pages/ProfilePage";
import AuthSplitLayout from "@/layouts/AuthSplitLayout";
import VersusAiPage from "@/pages/VersusAiPage";
import AboutUsPage from "@/pages/AboutUsPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout utama dengan NavBar */}
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="game" element={<GamePage />} />
          <Route path="encyclopedia" element={<EncyclopediaPage />} />
          <Route path="room" element={<RoomPage />} />
          <Route path="room/:id" element={<VersusAiPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="aboutus" element={<AboutUsPage />} />
        </Route>
        {/* Layout auth tanpa NavBar */}
        <Route element={<AuthSplitLayout />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
