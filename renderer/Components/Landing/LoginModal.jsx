"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import Signin from "/signin.png";
import { useNavigate } from "react-router-dom";
import { setWithExpiry } from "../../utils/anonymousName";

const MIN_LOADING_DURATION = 3000; // Minimum loading screen duration in ms
const API_BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";

// Production-ready typewriter component
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

const LoginModal = ({ isOpen, onClose, onSwitchToSignup, darkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  const API = axios.create({ baseURL: API_BASE_URL });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value.trim() }));
    setLoginError(null); // Clear error on input change
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoginError(null);
      setIsLoading(true);
      setShowLoadingScreen(true);

      const { email, password } = loginForm;

      // Client-side validation
      if (!validateEmail(email)) {
        setLoginError("Please enter a valid email address.");
        setIsLoading(false);
        setShowLoadingScreen(false);
        return;
      }

      try {
        const loginPromise = API.post("/login", { email, password });
        const timerPromise = new Promise((resolve) =>
          setTimeout(resolve, MIN_LOADING_DURATION)
        );
        const [loginRes] = await Promise.all([loginPromise, timerPromise]);

        const { user, coinsEarned } = loginRes.data;
        const coinsEarnedNum = Number.parseInt(coinsEarned || 0, 10);

        // Securely store minimal data
        localStorage.setItem("userId", user._id);
        setWithExpiry("user", user, 2 * 60 * 60 * 1000);

        window.dispatchEvent(
          new CustomEvent("user-logged-in", {
            detail: { user, coinsEarned: coinsEarnedNum },
          })
        );

        setLoginSuccess(true);
        setShowLoadingScreen(false); // Hide loading screen after both API and timer resolve
      } catch (err) {
        console.error("Login error:", err); // Log for debugging
        const errorMessage =
          err?.response?.data?.message ||
          "Login failed. Please try again later.";
        setLoginError(errorMessage);
        setShowLoadingScreen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [loginForm, API]
  );

  const handleSwitchToSignup = useCallback(
    (e) => {
      e.preventDefault();
      onSwitchToSignup();
    },
    [onSwitchToSignup]
  );

  useEffect(() => {
    if (loginSuccess && !showLoadingScreen) {
      onClose();
      navigate("/", { replace: true });
      window.location.reload(); // Force a full page refresh after login
    }
  }, [loginSuccess, showLoadingScreen, onClose, navigate]);

  if (!isOpen) return null;

  // Show loading screen during login
  if (showLoadingScreen) {
    return <StarlitJournalsLoader />;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
      style={{ zIndex: 9999 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-form-heading"
    >
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="relative flex flex-col lg:flex-row min-h-[500px]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
            aria-label="Close login modal"
          >
            <X size={20} />
          </button>
          <div
            className="flex-1 p-8 lg:p-12 flex items-center justify-center relative min-h-[200px] lg:min-h-[500px]"
            style={{
              backgroundImage: `url(${Signin})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              aria-hidden="true"
            ></div>
            <div className="text-center relative z-10">
              <h2 className="text-3xl lg:text-4xl font-light text-white mb-4 tracking-tight">
                Back for another chapter?
              </h2>
              <p className="text-lg text-gray-200 font-light">
                Let's keep the story going.
              </p>
            </div>
          </div>
          <div className="flex-1 p-8 lg:p-12 flex items-center">
            <div className="w-full max-w-md mx-auto">
              <form
                onSubmit={handleSubmit}
                className="w-full space-y-5"
                noValidate
              >
                <div className="text-center mb-8">
                  <h2
                    id="login-form-heading"
                    className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100"
                  >
                    Welcome Back
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Sign in to continue your journey
                  </p>
                </div>
                {loginError && (
                  <div
                    className="text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    role="alert"
                  >
                    {loginError}
                  </div>
                )}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium sr-only"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                    aria-label="Email address"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-1 relative">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium sr-only"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent transition-all placeholder-gray-500 dark:placeholder-gray-400"
                    aria-label="Password"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  Important: Remember your email and password. If you forget
                  them, you'll need to contact support to recover your account.
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Sign in to your account"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{" "}
                    <a
                      href="#"
                      onClick={handleSwitchToSignup}
                      className="text-gray-900 dark:text-gray-100 underline hover:no-underline font-medium"
                      aria-label="Open signup modal"
                    >
                      Sign Up
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
