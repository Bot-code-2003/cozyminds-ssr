"use client";

import { useEffect } from "react";

import {
  Shield,
  FileText,
  Globe,
  RefreshCw,
  Mail,
  Calendar,
  Copyright,
  BookText,
} from "lucide-react";

const Terms = ({ darkMode }) => {
  useEffect(() => {
    scrollTo(0, 0);
  }, []);
  const sections = [
    {
      icon: <Globe size={24} />,
      title: "User Eligibility & Age Restrictions",
      content:
        "You must be at least 13 years old to use Starlit Journals. If you are under 18, you must use the platform with parental guidance. By using the platform, you confirm you meet these requirements.",
    },
    {
      icon: <FileText size={24} />,
      title: "User Responsibilities & Conduct",
      content:
        "You agree to use Starlit Journals for lawful, personal, and non-commercial purposes. You will not post illegal, harmful, or abusive content, nor attempt to disrupt or exploit the platform. You are responsible for your own content and interactions.",
    },
    {
      icon: <BookText size={24} />,
      title: "Content Ownership & Public Visibility",
      content:
        "You retain ownership of your journal entries and data. Public journals are visible to all users and may be indexed by search engines. By posting public content, you grant Starlit Journals a license to display, share, and promote your entries within the platform. Do not include personal information in public journals.",
    },
    {
      icon: <Shield size={24} />,
      title: "Content Moderation & Takedown",
      content:
        "We reserve the right to moderate, remove, or restrict content that violates our guidelines, is illegal, or is reported by users. You can report inappropriate content via the platform or by email. We respond promptly to all valid reports.",
    },
    {
      icon: <Copyright size={24} />,
      title: "Copyright & DMCA",
      content:
        "If you believe your copyright has been infringed, contact us with details. We comply with DMCA and will promptly remove infringing content upon valid notice.",
    },
    {
      icon: <RefreshCw size={24} />,
      title: "Disclaimers & Limitation of Liability",
      content:
        "Starlit Journals is provided as-is, without warranties. We are not liable for user content, data loss, or damages arising from use of the platform. Use at your own risk.",
    },
    {
      icon: <Shield size={24} />,
      title: "Service Availability & Changes",
      content:
        "We strive to keep Starlit Journals running smoothly, but cannot guarantee uninterrupted service. Features may change or be discontinued at any time.",
    },
    {
      icon: <Mail size={24} />,
      title: "Third-Party Services",
      content:
        "We may use third-party services for hosting, analytics, and email delivery. These providers are contractually obligated to protect your data and may only use it as necessary to provide their services.",
    },
    {
      icon: <Shield size={24} />,
      title: "Jurisdiction & Dispute Resolution",
      content:
        "These terms are governed by the laws of India. Any disputes will be resolved in the courts of Hyderabad, India. By using the platform, you consent to this jurisdiction.",
    },
    {
      icon: <RefreshCw size={24} />,
      title: "Updates to Terms",
      content:
        "We may update these Terms of Service from time to time. If we make significant changes, we will notify users via the platform or email. Continued use of Starlit Journals after changes means you accept the updated terms.",
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
            LEGAL TERMS
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            <span className="relative">
              Terms of <span className="text-[#5999a8]">Service</span>
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
            Welcome to <strong>Starlit Journals</strong>. These terms govern
            your use of our platform. By accessing or using the app, you agree
            to these terms.
          </p>
        </div>

        {/* Terms Sections */}
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
              6. Contact Us
            </h2>
            <p className="text-lg opacity-80 mb-6 max-w-xl mx-auto">
              Questions? We're here to help and would love to hear from you.
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

export default Terms;
