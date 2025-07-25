import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Logo3 from "../assets/logo_3_pink.svg";
import { useAuth } from "@/features/auth/useAuth";

const navItems = [
  { text: "Home", to: "/" },
  { text: "Encyclopedia", to: "/encyclopedia" },
];

export default function NavBar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { isLoggedIn, email, username, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setDrawer(false);
    navigate("/");
  };
  // Navigasi ke login/register
  const handleLogin = () => {
    setDrawer(false);
    navigate("/login");
  };
  const handleRegister = () => {
    setDrawer(false);
    navigate("/register");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-998 py-3 bg-transparent backdrop-blur-lg border-b border-gray-200/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <img src={Logo3} alt="Logo" className="w-30 h-30 " />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-4 py-4 rounded-lg font-medium transition-all duration-300 ${
                    location.pathname === item.to
                      ? "text-rose-600 bg-pink-50 shadow-sm"
                      : "text-gray-700 hover:text-rose-800 hover:bg-gray-50"
                  }`}
                >
                  {item.text}
                  {location.pathname === item.to && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-pink-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Auth Buttons (Desktop) */}
              {!isLoggedIn ? (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-all duration-300"
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                  <button
                    className="px-6 py-2 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    onClick={handleRegister}
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                /* Profile Dropdown */
                <div className="hidden md:block relative">
                  <button
                    className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all duration-300"
                    onClick={() => setShowDropdown((v) => !v)}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white text-lg font-bold uppercase">
                      {username ? username.charAt(0) : "?"}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold">
                        {username ?? "Loading..."}
                      </span>
                      <span className="text-xs text-gray-500">
                        {email ?? ""}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>
                      <hr className="my-2 border-gray-200" />
                      <button
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                onClick={() => setDrawer(true)}
                aria-label="Open menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setDrawer(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img src={Logo3} alt="Logo" className="w-20 h-20" />
              </div>
              <button
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setDrawer(false)}
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                    location.pathname === item.to
                      ? "bg-pink-50 text-pink-600 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setDrawer(false)}
                >
                  {item.text}
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50">
              {!isLoggedIn ? (
                <div className="space-y-3">
                  <button
                    className="w-full px-4 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-white transition-all duration-300"
                    onClick={handleLogin}
                  >
                    Login
                  </button>
                  <button
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    onClick={handleRegister}
                  >
                    Sign Up
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold uppercase">
                      {username ? username.charAt(0) : "?"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{username}</p>
                      <p className="text-sm text-gray-500">
                        {email ? email : "Loading..."}
                      </p>
                    </div>
                  </div>
                  <button
                    className="w-full px-4 py-3 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-all duration-300"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}