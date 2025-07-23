"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff, AlertCircle } from "lucide-react";
import axios from "axios";
import Signup from "/signup.png";
import { useNavigate } from "react-router-dom";
import TermsModal from "./TermsModal";
import { setWithExpiry } from "../../utils/anonymousName";

// Production-ready typewriter component (same as LoginModal)
const StarlitJournalsLoader = () => {
  const [animationPhase, setAnimationPhase] = useState("typing");

  const text = "Starlit Journals";
  const typingDuration = 2000; // 2 seconds
  const pauseDuration = 2000; // 2 seconds pause
  const erasingDuration = 1500; // 1.5 seconds

  useEffect(() => {
    const cycleAnimation = () => {
      // Typing phase
      setAnimationPhase("typing");

      setTimeout(() => {
        // Pause phase
        setAnimationPhase("pause");

        setTimeout(() => {
          // Erasing phase
          setAnimationPhase("erasing");

          setTimeout(() => {
            // Restart cycle
            cycleAnimation();
          }, erasingDuration);
        }, pauseDuration);
      }, typingDuration);
    };

    cycleAnimation();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Main content */}
      <div className="relative text-center px-4">
        <div className="mb-8">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-800 dark:text-gray-100 tracking-wide select-none"
            role="heading"
            aria-level="1"
            aria-live="polite"
            aria-label={`${text} - Loading`}
          >
            <span
              className={`typewriter ${animationPhase}`}
              style={{
                "--text-length": `${text.length}ch`,
                "--typing-duration": `${typingDuration}ms`,
                "--erasing-duration": `${erasingDuration}ms`,
              }}
            >
              {text}
            </span>
          </h1>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center space-x-1 opacity-60">
          <div
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
            style={{ animationDelay: "200ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
            style={{ animationDelay: "400ms" }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        .typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 3px solid currentColor;
          font-feature-settings: "tnum";
          letter-spacing: 0.1em;
        }

        .typewriter.typing {
          width: 0;
          animation: typing var(--typing-duration) steps(${text.length}, end)
              forwards,
            blink 1s step-end infinite;
        }

        .typewriter.pause {
          width: var(--text-length);
          animation: blink 1s step-end infinite;
        }

        .typewriter.erasing {
          width: var(--text-length);
          animation: erasing var(--erasing-duration) steps(${text.length}, end)
              forwards,
            blink 1s step-end infinite;
        }

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: var(--text-length);
          }
        }

        @keyframes erasing {
          from {
            width: var(--text-length);
          }
          to {
            width: 0;
          }
        }

        @keyframes blink {
          0%,
          50% {
            border-color: currentColor;
            opacity: 1;
          }
          51%,
          100% {
            border-color: transparent;
            opacity: 0.7;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .typewriter {
            animation: none !important;
            width: var(--text-length) !important;
            border-right-color: currentColor;
          }

          .animate-pulse {
            animation: none !important;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .typewriter {
            border-right-width: 4px;
            font-weight: 500;
          }
        }

        /* Print styles */
        @media print {
          .typewriter {
            animation: none !important;
            width: var(--text-length) !important;
            border-right: none !important;
          }
        }
      `}</style>
    </div>
  );
};

const SignupModal = ({ isOpen, onClose, onSwitchToLogin, darkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [signupForm, setSignupForm] = useState({
    nickname: "",
    email: "",
    password: "",
    verifyPassword: "",
    age: "",
    gender: "",
    subscribe: false,
    agreedToTerms: false,
  });
  const [signupError, setSignupError] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
  });

  useEffect(() => {
    const pass = signupForm.password;
    if (pass) {
      if (pass.length < 10) {
        setPasswordError("Password must be at least 10 characters long.");
      } else if (!/[a-zA-Z]/.test(pass)) {
        setPasswordError("Password must contain at least one letter.");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }

    if (signupForm.verifyPassword || signupForm.password) {
      setPasswordMatch(signupForm.password === signupForm.verifyPassword);
    }
  }, [signupForm.password, signupForm.verifyPassword]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignupError(null);

    if (passwordError) {
      setSignupError(passwordError);
      return;
    }

    if (signupForm.password !== signupForm.verifyPassword) {
      setPasswordMatch(false);
      setSignupError("Passwords do not match. Please try again.");
      return;
    }

    if (!signupForm.agreedToTerms) {
      setSignupError("You must agree to the Terms and Conditions to sign up.");
      return;
    }

    setIsLoading(true);
    setShowLoadingScreen(true);

    try {
      const signupPromise = API.post("/signup", {
        nickname: signupForm.nickname,
        email: signupForm.email,
        password: signupForm.password,
        age: signupForm.age,
        gender: signupForm.gender,
        subscribe: signupForm.subscribe,
        agreedToTerms: signupForm.agreedToTerms,
      });
      const timerPromise = new Promise((resolve) => setTimeout(resolve, 3000));

      const [signupRes] = await Promise.all([signupPromise, timerPromise]);
      const { user } = signupRes.data;

      localStorage.setItem("userId", user._id);
      setWithExpiry("user", user, 2 * 60 * 60 * 1000);

      window.dispatchEvent(
        new CustomEvent("user-signed-up", {
          detail: { user },
        })
      );

      setSignupSuccess(true);
      setShowLoadingScreen(false); // Hide loading screen after both API and timer resolve
    } catch (err) {
      setSignupError(
        err?.response?.data?.message || "Signup failed. Try again."
      );
      setIsLoading(false);
      setShowLoadingScreen(false);
      setSignupSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (signupSuccess && !showLoadingScreen) {
      onClose();
      navigate("/", { replace: true });
      window.location.reload(); // Force a full page refresh after signup
    }
  }, [signupSuccess, showLoadingScreen, onClose, navigate]);

  const handleSwitchToLogin = (e) => {
    e.preventDefault();
    onSwitchToLogin();
  };

  if (!isOpen) return null;

  // Show loading screen during signup (now using the same component as LoginModal)
  if (showLoadingScreen) {
    return <StarlitJournalsLoader />;
  }

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
        <div className="w-full max-w-5xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-[95vh] overflow-y-auto">
          <div className="relative flex flex-col lg:flex-row min-h-[600px]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
              aria-label="Close signup modal"
            >
              <X size={20} />
            </button>
            <div
              className="flex-1 p-8 lg:p-12 flex items-center justify-center relative min-h-[250px] lg:min-h-[600px]"
              style={{
                backgroundImage: `url(${Signup})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="absolute inset-0 bg-black/50"
                aria-hidden="true"
              ></div>
              <div className="text-center relative z-10 max-w-md">
                <h2 className="text-3xl lg:text-4xl font-light text-white mb-4 tracking-tight">
                  Hello, new friend
                </h2>
                <p className="text-lg text-gray-200 font-light">
                  Let's start writing your story, one page at a time.
                </p>
              </div>
            </div>
            <div className="flex-1 p-8 lg:p-12 flex items-center">
              <div className="w-full max-w-md mx-auto">
                <form
                  onSubmit={handleSubmit}
                  className="w-full space-y-5"
                  aria-labelledby="signup-form-heading"
                >
                  <div className="text-center mb-8">
                    <h2
                      id="signup-form-heading"
                      className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100"
                    >
                      Join Starlit Journals
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Create your account to get started
                    </p>
                  </div>

                  {signupError && (
                    <div className="text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <input
                    type="text"
                    name="nickname"
                    placeholder="Nickname"
                    value={signupForm.nickname}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                    aria-label="Nickname"
                    disabled={isLoading}
                  />

                  <div className="space-y-2">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={signupForm.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                      aria-label="Email address"
                      disabled={isLoading}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      💡 No need for your real email! Feel free to use something
                      creative.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="age"
                      placeholder="Age"
                      value={signupForm.age}
                      onChange={handleChange}
                      required
                      min={1}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                      aria-label="Age"
                      disabled={isLoading}
                    />

                    <select
                      name="gender"
                      value={signupForm.gender}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                      aria-label="Gender"
                      disabled={isLoading}
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={signupForm.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                        aria-label="Password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <div className="text-red-500 text-xs px-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {passwordError}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showVerifyPassword ? "text" : "password"}
                        name="verifyPassword"
                        placeholder="Confirm password"
                        value={signupForm.verifyPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                        aria-label="Verify Password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowVerifyPassword(!showVerifyPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={
                          showVerifyPassword ? "Hide password" : "Show password"
                        }
                        disabled={isLoading}
                      >
                        {showVerifyPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {signupForm.verifyPassword && !passwordMatch && (
                      <div className="text-red-500 text-xs px-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Passwords do not match.
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="agreedToTerms"
                        name="agreedToTerms"
                        checked={signupForm.agreedToTerms}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 dark:focus:ring-gray-100"
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="agreedToTerms"
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setIsTermsModalOpen(true)}
                          className="text-gray-900 dark:text-gray-100 underline hover:no-underline"
                          disabled={isLoading}
                        >
                          Terms and Conditions
                        </button>
                      </label>
                    </div>
                    <div className="text-xs text-center">
                      <a
                        href="/terms-of-service"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 underline hover:no-underline"
                      >
                        Read the full Terms and Conditions
                      </a>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      isLoading ||
                      !passwordMatch ||
                      !!passwordError ||
                      !signupForm.agreedToTerms
                    }
                    aria-label="Create your account"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>

                  <div className="text-center pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Already have an account?{" "}
                      <button
                        onClick={handleSwitchToLogin}
                        className="text-gray-900 dark:text-gray-100 underline hover:no-underline font-medium"
                        aria-label="Open login modal"
                        disabled={isLoading}
                      >
                        Log In
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        darkMode={darkMode}
      />
    </>
  );
};

export default SignupModal;
