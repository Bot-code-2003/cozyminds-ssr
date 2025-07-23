import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useDarkMode } from "../context/ThemeContext";
import AuthModals from "./Landing/AuthModals";
import Navbar from "./Dashboard/Navbar";
import PublicStories from "./PublicJournals/PublicStories";
import PublicJournals from "./PublicJournals/PublicJournals";
import { BookOpen, FileText } from "lucide-react";

const getCurrentUser = () => {
  try {
    const itemStr = localStorage.getItem("user");
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    if (item && item.value) return item.value;
    return item;
  } catch {
    return null;
  }
};

const Public = () => {
  const [activeTab, setActiveTab] = useState("stories");
  const { darkMode, setDarkMode } = useDarkMode();
  const { modals, openLoginModal, openSignupModal } = AuthModals({ darkMode });
  const user = useMemo(() => getCurrentUser(), []);
  const isLoggedIn = !!user;

  // Dynamic SEO content
  const seo = {
    title:
      activeTab === "stories"
        ? "Discover Short Stories by Real Writers | Starlit Journals"
        : "Read Real Journals by Everyday Writers | Starlit Journals",
    description:
      activeTab === "stories"
        ? "Explore an ever-growing collection of short, strange, and beautiful stories written by our community. Discover your next favorite tale."
        : "Peek into personal journals shared by people like you. Honest, unfiltered, and meaningful entries from everyday lives.",
  };

  return (
    <>
      {/* SEO Helmet */}
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta
          name="keywords"
          content="stories, journals, creative writing, online journal, short stories, daily writing, starlit journals"
        />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={`https://starlitjournals.com/${activeTab}`}
        />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href={`https://starlitjournals.com/${activeTab}`}
        />
      </Helmet>

      {/* Navbar */}
      <Navbar name="New Entry" link="/journaling-alt" />

      {modals}

      {/* Sub Navigation */}
      <div className="bg-white sticky top-0 z-[100]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex bg-gray-100 rounded-lg p-1 my-4">
              <button
                onClick={() => setActiveTab("stories")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "stories"
                    ? "bg-white text-black-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Stories
              </button>
              <button
                onClick={() => setActiveTab("journals")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === "journals"
                    ? "bg-white text-black-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                Journals
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === "stories" ? <PublicStories /> : <PublicJournals />}
    </>
  );
};

export default Public;
