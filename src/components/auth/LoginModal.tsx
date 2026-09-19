// src/components/auth/LoginModal.tsx
import React, { useState } from "react";
import { Modal } from "./Modal";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "../../services/authService";

interface LoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen = true, onClose }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSubmitting(true);
  try {
    if (mode === "login") {
      await signInWithEmail(email, password);
    } else {
      await signUpWithEmail(email, password, username);
    }
    onClose();
  } catch (err: any) {
    if (err.message?.toLowerCase().includes("rate limit")) {
      setError("Too many attempts. Please wait a few minutes or disable email confirmation in your dashboard.");
    } else {
      setError(err.message || "Something went wrong");
    }
  } finally {
    setSubmitting(false);
  }
};


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={mode === "login" ? "Log In" : "Sign Up"}
      title={mode === "login" ? "Log In" : "Sign Up"}
      subtitle={
        <>
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-400 hover:underline">User Agreement</a> and acknowledge that you understand the{" "}
          <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>.
        </>
      }
      footer={
        <p className="text-xs text-center text-[#818384]">
          {mode === "login" ? "New to the platform? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "login" ? "signup" : "login");
            }}
            className="text-blue-400 hover:underline font-semibold"
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </button>
        </p>
      }
    >
      <div className="flex flex-col gap-3.5">
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-[#272729] hover:bg-[#343536] text-white text-sm font-semibold rounded-full border border-[#343536] transition"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center my-1">
          <div className="flex-1 border-t border-[#343536]"></div>
          <span className="px-3 text-[11px] font-bold tracking-wider text-[#818384] uppercase">OR</span>
          <div className="flex-1 border-t border-[#343536]"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#272729] text-white text-sm rounded-xl px-4 py-3 border border-[#343536] focus:border-[#FF4500] focus:outline-none placeholder-[#818384] transition"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#272729] text-white text-sm rounded-xl px-4 py-3 border border-[#343536] focus:border-[#FF4500] focus:outline-none placeholder-[#818384] transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#272729] text-white text-sm rounded-xl px-4 py-3 border border-[#343536] focus:border-[#FF4500] focus:outline-none placeholder-[#818384] transition"
          />

          {mode === "login" && (
            <div className="flex justify-end">
              <a href="#" className="text-xs text-blue-400 hover:underline">Forgot password?</a>
            </div>
          )}

          {error && <div className="text-xs text-[#ff4500]">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 bg-[#FF4500] hover:bg-[#E03D00] text-white font-semibold text-sm rounded-full transition shadow-sm disabled:opacity-50"
          >
            {submitting ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>
      </div>
    </Modal>
  );
};