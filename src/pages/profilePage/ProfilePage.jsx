import React, { useState } from "react";
import { ArrowLeft, Settings, CreditCard, Share, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, googleSignIn, emailSignIn, emailSignUp, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await emailSignUp(email, password);
      } else {
        await emailSignIn(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-100 to-blue-300">
      <div className="relative hidden items-center bg-white/80 px-4 py-5 text-blue-900 shadow-sm backdrop-blur-lg lg:flex">
        <ArrowLeft
          className="cursor-pointer text-blue-600"
          onClick={() => navigate("/menu")}
        />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
          Profile
        </h1>
      </div>

      <div className="mx-auto w-full max-w-md flex-1 p-2">
        {user ? (
          <div className="flex h-[97.5vh] flex-col rounded-3xl bg-white/80 shadow-xl backdrop-blur-md">
            <div className="rounded-t-3xl bg-blue-50/50 px-8 py-4 text-center">
              <h2 className="text-2xl font-bold text-blue-400">
                {user.displayName}
              </h2>
              <p className="text-blue-300">{user.email}</p>
            </div>

            <div className="flex-1 divide-y divide-blue-100">
              <div className="flex items-center px-8 py-6 transition-colors hover:bg-blue-50/50">
                <Settings className="mr-4 h-6 w-6 text-blue-400" />
                <span className="font-medium text-blue-900">
                  Account Settings
                </span>
              </div>
              <div className="flex items-center px-8 py-6 transition-colors hover:bg-blue-50/50">
                <CreditCard className="mr-4 h-6 w-6 text-blue-400" />
                <span className="font-medium text-blue-900">Subscription</span>
              </div>
              <div className="flex items-center px-8 py-6 transition-colors hover:bg-blue-50/50">
                <Share className="mr-4 h-6 w-6 text-blue-400" />
                <span className="font-medium text-blue-900">
                  Connected Apps
                </span>
              </div>
              <div className="flex items-center px-8 py-6 transition-colors hover:bg-blue-50/50">
                <Lock className="mr-4 h-6 w-6 text-blue-400" />
                <span className="font-medium text-blue-900">Privacy</span>
              </div>
              <div></div>
            </div>

            <div className="p-8 pb-[22vh]">
              <button
                onClick={logout}
                className="w-full rounded-2xl bg-blue-100 py-4 font-medium text-blue-600 transition-colors hover:bg-blue-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur-md">
            <h2 className="mb-8 text-center text-3xl font-bold text-blue-900">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>

            <form onSubmit={handleEmailAuth} className="mb-8 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-blue-100 bg-white/50 p-4 text-blue-900 placeholder-blue-400 focus:border-blue-200 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-blue-100 bg-white/50 p-4 text-blue-900 placeholder-blue-400 focus:border-blue-200 focus:outline-none"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 py-4 font-medium text-white transition-colors hover:bg-blue-700"
              >
                {isSignUp ? "Sign Up" : "Login"}
              </button>
            </form>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-blue-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/80 px-4 text-blue-500">or</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="mb-8 w-full rounded-2xl border border-blue-100 bg-white/50 py-4 font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              Continue with Google
            </button>

            <p className="text-center text-blue-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 font-medium text-blue-800 hover:text-blue-900"
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
