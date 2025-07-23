import React from 'react';
import { X } from 'lucide-react';

const TermsModal = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl p-8 m-4 rounded-2xl shadow-2xl ${
          darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
          }`}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
        <p className="text-xs text-gray-400 mb-2">Effective as of: June 21, 2025</p>

        <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-4">
          <p>
            Welcome to Starlit Journals! By accessing or using our website and services, you agree to these Terms and Conditions. Please read them carefully.
          </p>

          <h3 className="font-semibold text-lg mt-4">1. Acceptance of Terms</h3>
          <p>
            By using Starlit Journals, you confirm that you have read and understood these Terms. If you do not agree with any part, please do not use the service.
          </p>

          <h3 className="font-semibold text-lg mt-4">2. User Conduct</h3>
          <p>
            You are responsible for your behavior and content on the platform. You agree not to post anything illegal, harmful, abusive, or offensive, or that infringes on others’ rights.
          </p>

          <h3 className="font-semibold text-lg mt-4">3. Image Uploads and Copyright</h3>
          <p>
            You are fully responsible for the images you upload. Only upload images you created, have permission to use, or that are free from copyright (e.g., public domain or Creative Commons).
          </p>
          <p>
            Starlit Journals is not responsible for any copyright violations from user uploads. If we receive a complaint, we may remove the content and warn or ban the user.
          </p>

          <h3 className="font-semibold text-lg mt-4">4. Copyright Complaints</h3>
          <p>
            If you believe your copyrighted content has been used without permission, please contact us at:
          </p>
          <p className="font-mono text-sm">📩 madisettydharmadeep@gmail.com</p>
          <p>
            Include a link to the content, proof of ownership, and a takedown request. We will investigate and take action.
          </p>

          <h3 className="font-semibold text-lg mt-4">5. Privacy</h3>
          <p>
            Your privacy is important. Our Privacy Policy explains how we handle your data. By using the platform, you agree to that policy.
          </p>

          <h3 className="font-semibold text-lg mt-4">6. Disclaimer of Warranties</h3>
          <p>
            We provide our services “as is” without any guarantees. We don’t promise that everything will work perfectly all the time or meet your exact needs.
          </p>

          <h3 className="font-semibold text-lg mt-4">7. Limitation of Liability</h3>
          <p>
            We are not liable for any indirect or consequential damages, data loss, or emotional impact caused by using our platform.
          </p>

          <h3 className="font-semibold text-lg mt-4">8. Governing Law</h3>
          <p>
            These Terms are governed by the laws of India. Any disputes will be handled under Indian legal jurisdiction.
          </p>

          <h3 className="font-semibold text-lg mt-4">9. Account Suspension or Removal</h3>
          <p>
            We may remove any content that breaks our rules and suspend or delete user accounts in case of repeated violations.
          </p>

          <h3 className="font-semibold text-lg mt-4">10. Changes to Terms</h3>
          <p>
            We may update these Terms occasionally. If we do, we’ll notify users through the site or email. Continued use means you accept the new terms.
          </p>

          <p className="mt-6 font-medium">
            By using Starlit Journals, you agree to these Terms and understand your responsibilities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
