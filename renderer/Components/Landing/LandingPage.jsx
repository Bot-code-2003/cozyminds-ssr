import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import AuthModals from "./AuthModals";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Modal control handlers
  const openLoginModal = () => {
    setShowSignup(false);
    setShowLogin(true);
  };
  const openSignupModal = () => {
    setShowLogin(false);
    setShowSignup(true);
  };
  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <div className="min-h-screen bg-[#f7eee0] text-black relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button className="flex items-center">
              <div className="text-2xl font-bold tracking-tight flex items-baseline">
                <span className="text-[var(--accent)] newsreader">Starlit</span>
                <span className="text-gray-800 dark:text-white ml-1 newsreader opacity-80">
                  Journals
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a
                href="#"
                className="text-gray-700 hover:text-black transition-colors text-sm"
              >
                Our story
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-black transition-colors text-sm"
              >
                Write
              </a>
              <button
                onClick={openLoginModal}
                className="text-gray-700 hover:text-black transition-colors text-sm"
              >
                Sign in
              </button>
              <button
                onClick={openSignupModal}
                className="bg-black text-white px-4 py-2 rounded-full text-sm hover:bg-gray-800 transition-colors"
              >
                Get started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-500 py-4 bg-[#f7eee0]">
              <div className="flex flex-col space-y-3">
                <a
                  href="#"
                  className="text-gray-700 hover:text-black px-4 py-2 text-sm"
                >
                  Our story
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-black px-4 py-2 text-sm"
                >
                  Write
                </a>
                <button
                  onClick={openLoginModal}
                  className="text-gray-700 hover:text-black px-4 py-2 text-sm text-left"
                >
                  Sign in
                </button>
                <button
                  onClick={openSignupModal}
                  className="bg-black text-white mx-4 py-2 rounded-full text-sm"
                >
                  Get started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="relative min-h-[calc(100vh-120px)] flex items-center">
        {/* Background Image - Only visible on large screens */}
        <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/2 xl:w-2/5">
          <div className="relative h-full flex items-center justify-center">
            <img src="/absr.png" alt="" className="max-w-full h-auto" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:w-1/2 xl:w-3/5 py-12 sm:py-16 lg:py-20">
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal leading-[0.9] mb-6 sm:mb-8 text-black tracking-tight">
                Anonymous
                <br />
                stories & ideas
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-black/80 mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-md font-light">
                A place to read, write, and share authentic experiences without
                revealing who you are
              </p>

              <button
                onClick={openLoginModal}
                className="bg-black text-white px-8 sm:px-10 lg:px-12 py-3 lg:py-4 rounded-full text-base sm:text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 font-light"
              >
                Start reading
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-500 bg-[#f7eee0]">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600">
            <a href="#" className="hover:text-black transition-colors">
              Help
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Status
            </a>
            <a href="#" className="hover:text-black transition-colors">
              About
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Careers
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Text to speech
            </a>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLogin}
        onClose={closeModals}
        onSwitchToSignup={openSignupModal}
      />
      <SignupModal
        isOpen={showSignup}
        onClose={closeModals}
        onSwitchToLogin={openLoginModal}
      />
    </div>
  );
};

export default LandingPage;
