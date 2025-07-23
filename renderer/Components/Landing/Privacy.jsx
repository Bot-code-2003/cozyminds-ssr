"use client";

import { useEffect } from "react";

import {
  Database,
  BarChart3,
  Cookie,
  UserCheck,
  Mail,
  Calendar,
  User,
  Shield,
  RefreshCw,
} from "lucide-react";

const Privacy = ({ darkMode }) => {
  useEffect(() => {
    scrollTo(0, 0);
  }, []);
  const sections = [
    {
      icon: <Database size={24} />,
      title: "What Data We Collect",
      content:
        "We collect only the information you choose to provide during signup, such as anonymous nickname, password, and (optionally) age or gender. Your journal entries, including public journals, are stored securely. We do not require real names or emails for account creation. If you use third-party logins, we may receive basic profile info from those services.",
    },
    {
      icon: <User size={24} />,
      title: "How We Use Your Data",
      content:
        "We use your information to provide and improve Starlit Journals, personalize your experience, deliver features like mood tracking and rewards, and ensure platform safety. Public journal entries are visible to all users and may be indexed by search engines. Private entries remain accessible only to you.",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Public Content & Visibility",
      content:
        "When you post a public journal, it is visible to anyone on the platform and may be shared, commented on, or featured. Public journals may be indexed by search engines and are not private. Please do not include personal information in public entries. You can delete your own public journals at any time.",
    },
    {
      icon: <UserCheck size={24} />,
      title: "Your Rights & Choices",
      content:
        "You have the right to access, correct, export, or delete your data at any time. You can delete your account and all associated data from your profile settings. For data export or additional requests, contact us at the email below. We comply with global privacy laws, including GDPR and India's DPDP Act.",
    },
    {
      icon: <Shield size={24} />,
      title: "Content Moderation & Reporting",
      content:
        "We reserve the right to moderate, remove, or restrict content that violates our community guidelines, is illegal, or is reported by users. You can report inappropriate content via the platform or by email. We respond promptly to all valid reports and take user safety seriously.",
    },
    {
      icon: <Cookie size={24} />,
      title: "Cookies & Analytics",
      content:
        "Starlit Journals uses cookies for login sessions, rewards, and essential features. We use anonymized analytics (e.g., Google Analytics) to understand usage and improve the platform. No personal data is sold or used for advertising.",
    },
    {
      icon: <Mail size={24} />,
      title: "Third-Party Services",
      content:
        "We may use third-party services for hosting, analytics, and email delivery. These providers are contractually obligated to protect your data and may only use it as necessary to provide their services.",
    },
    {
      icon: <Shield size={24} />,
      title: "Data Security",
      content:
        "We use industry-standard security measures to protect your data. All journal entries are encrypted in transit and at rest. We do not sell or share your data with advertisers. In the event of a data breach, we will notify affected users promptly.",
    },
    {
      icon: <User size={24} />,
      title: "Age Restrictions & Parental Consent",
      content:
        "Starlit Journals is intended for users 13 and older. If you are under 18, please use the platform with parental guidance. We do not knowingly collect data from children under 13. Parents can request deletion of a minor's data by contacting us.",
    },
    {
      icon: <RefreshCw size={24} />,
      title: "Changes to This Policy",
      content:
        "We may update this Privacy Policy from time to time. If we make significant changes, we will notify users via the platform or email. Continued use of Starlit Journals after changes means you accept the updated policy.",
    },
  ];

  return (
    <div className="min-h-screen dark:bg-[#1A1A1A] dark:text-[#F8F1E9] bg-[#f3f9fc] text-[#1A1A1A] font-sans transition-colors duration-300">
      {/* Gradient Accents */}
      <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-[#8fa9af] to-transparent opacity-70 dark:opacity-20 transition-opacity duration-300"></div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 grid grid-cols-12 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-full border-r border-black dark:border-white"
            ></div>
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-12 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-full border-b border-black dark:border-white"
            ></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-3 py-1 border-2 border-[#1A1A1A] dark:border-[#F8F1E9] text-xs font-medium tracking-wider">
            YOUR PRIVACY
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            <span className="relative">
              Privacy <span className="text-[#5999a8]">Policy</span>
              <svg
                className="absolute -bottom-2 left-0 w-full h-2 text-[#5999a8]"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,5 Q25,0 50,5 T100,5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </span>
          </h1>
          <p className="text-lg md:text-xl opacity-80 font-medium max-w-2xl mx-auto">
            At <strong>Cozy Minds</strong>, your privacy is important to us.
            We're all about creating a safe, calming space — and that includes
            respecting your data.
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8 mb-16">
          {sections.map((section, index) => (
            <div
              key={index}
              className="border-2 border-[#1A1A1A] dark:border-[#F8F1E9] rounded-apple p-8 hover:shadow-xl transition-all duration-300 bg-white/50 dark:bg-[#2A2A2A]/50 backdrop-blur-sm"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 border-2 border-[#1A1A1A] dark:border-[#F8F1E9] rounded-apple flex items-center justify-center bg-[#5999a8]/10 dark:bg-[#5999a8]/20">
                    {section.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4 tracking-tight">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="text-lg opacity-80 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="border-2 border-[#1A1A1A] dark:border-[#F8F1E9] rounded-2xl p-8 mb-8 bg-[#5999a8]/10 dark:bg-[#5999a8]/5">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block p-4 border-2 border-[#1A1A1A] dark:border-[#F8F1E9] rounded-2xl">
                <Mail size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4 tracking-tight">
              6. Contact
            </h2>
            <p className="text-lg opacity-80 mb-6 max-w-xl mx-auto">
              Questions or concerns? Drop us an email and we'll get back to you
              as soon as possible.
            </p>
            <a
              href="mailto:madisettydharmadeep@gmail.com"
              className="inline-flex items-center gap-3 px-6 py-3 bg-[#1A1A1A] dark:bg-[#F8F1E9] text-[#F8F1E9] dark:text-[#1A1A1A] hover:opacity-90 transition-opacity rounded-md font-semibold border-2 border-transparent"
            >
              <Mail size={18} />
              madisettydharmadeep@gmail.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-2 border-[#1A1A1A] dark:border-[#F8F1E9] rounded-2xl p-6">
          <div className="flex items-center justify-center gap-3 opacity-70">
            <div className="p-2 border-2 border-[#1A1A1A] dark:border-[#F8F1E9] rounded-2xl">
              <Calendar size={16} />
            </div>
            <span className="text-sm font-medium tracking-wider">
              Last updated: May 4, 2025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
