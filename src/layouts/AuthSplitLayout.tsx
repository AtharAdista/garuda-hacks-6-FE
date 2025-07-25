import { useState } from "react";
import LoginForm from "../features/auth/LoginForm";
import RegisterForm from "../features/auth/RegisterForm";

export default function AuthSplitLayout() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-200 to-rose-300">
      <div className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white/90 relative h-[600px]">
        {/* Sliding Container - 200% width to hold both layouts */}
        <div
          className="flex h-full w-[200%] transition-transform duration-700 ease-in-out"
          style={{
            transform: isLogin ? "translateX(0%)" : "translateX(-50%)",
          }}
        >
          {/* LOGIN LAYOUT - takes 50% of the sliding container (full width of visible area) */}
          <div className="w-1/2 h-full flex">
            {/* Gradient Left for Login */}
            <div className="w-1/2 bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 flex items-center justify-center">
              <div className="text-8xl font-black text-rose-300 opacity-90 select-none">
                Culturate
              </div>
            </div>

            {/* Form Right for Login */}
            <div className="w-1/2 flex flex-col justify-center px-10 py-12">
              <h2 className="text-3xl font-bold text-rose-600 mb-6 text-center">
                Login
              </h2>
              <LoginForm>
                <div className="mt-8 text-center">
                  <span className="text-gray-600">Belum punya akun? </span>
                  <button
                    className="text-rose-600 font-semibold hover:underline transition-colors"
                    type="button"
                    onClick={() => setIsLogin(false)}
                  >
                    Daftar di sini
                  </button>
                </div>
              </LoginForm>
            </div>
          </div>

          {/* REGISTER LAYOUT - takes 50% of the sliding container (full width of visible area) */}
          <div className="w-1/2 h-full flex">
            {/* Form Left for Register */}
            <div className="w-1/2 flex flex-col justify-center px-10 py-12">
              <h2 className="text-3xl font-bold text-rose-600 mb-6 text-center">
                Register
              </h2>
              <RegisterForm>
                <div className="mt-8 text-center">
                  <span className="text-gray-600">Sudah punya akun? </span>
                  <button
                    className="text-rose-600 font-semibold hover:underline transition-colors"
                    type="button"
                    onClick={() => setIsLogin(true)}
                  >
                    Login di sini
                  </button>
                </div>
              </RegisterForm>
            </div>

            {/* Gradient Right for Register */}
            <div className="w-1/2 bg-gradient-to-tl  from-rose-400 via-rose-500 to-rose-600  flex items-center justify-center">
              <div className="text-8xl font-black text-rose-100 opacity-80 select-none">
                One Culture at a time
              </div>
            </div>
          </div>
        </div>

        {/* Mobile overlay - shows on small screens */}
        <div className="md:hidden absolute inset-0 flex flex-col justify-center px-10 py-12 bg-white/95">
          {isLogin ? (
            <>
              <h2 className="text-3xl font-bold text-rose-600 mb-6 text-center">
                Login
              </h2>
              <LoginForm>
                <div className="mt-8 text-center">
                  <span className="text-gray-600">Belum punya akun? </span>
                  <button
                    className="text-rose-600 font-semibold hover:underline transition-colors"
                    type="button"
                    onClick={() => setIsLogin(false)}
                  >
                    Daftar di sini
                  </button>
                </div>
              </LoginForm>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-rose-600 mb-6 text-center">
                Register
              </h2>
              <RegisterForm>
                <div className="mt-8 text-center">
                  <span className="text-gray-600">Sudah punya akun? </span>
                  <button
                    className="text-rose-600 font-semibold hover:underline transition-colors"
                    type="button"
                    onClick={() => setIsLogin(true)}
                  >
                    Login di sini
                  </button>
                </div>
              </RegisterForm>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
