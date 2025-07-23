"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

const AuthModals = ({ darkMode }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const openLoginModal = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const openSignupModal = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  return {
    // Return the modal components and control functions
    modals: (
      <>
        <LoginModal
          isOpen={showLoginModal}
          onClose={closeModals}
          onSwitchToSignup={openSignupModal}
          darkMode={darkMode}
        />
        <SignupModal
          isOpen={showSignupModal}
          onClose={closeModals}
          onSwitchToLogin={openLoginModal}
          darkMode={darkMode}
        />
      </>
    ),
    openLoginModal,
    openSignupModal,
    closeModals,
  };
};

export default AuthModals;
