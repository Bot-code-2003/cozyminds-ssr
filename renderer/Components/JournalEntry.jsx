"use client";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDarkMode } from "../context/ThemeContext";
import { usePublicJournals } from "../context/PublicJournalsContext";
import { ArrowLeft, Loader2, Clock, Heart } from "lucide-react";
import DashboardNavbar from "./Dashboard/Navbar";
import AuthModals from "./Landing/AuthModals";
import { createAvatar } from "@dicebear/core";
import {
  avataaars,
  bottts,
  funEmoji,
  miniavs,
  croodles,
  micah,
  pixelArt,
  adventurer,
  bigEars,
  bigSmile,
  lorelei,
  openPeeps,
  personas,
  rings,
  shapes,
  thumbs,
} from "@dicebear/collection";
import JournalCard from "./PublicJournals/PublicStoryCard";
import Comments from "./PublicJournals/Comments";
import "./styles/JournalContent.css";

const avatarStyles = {
  avataaars,
  bottts,
  funEmoji,
  miniavs,
  croodles,
  micah,
  pixelArt,
  adventurer,
  bigEars,
  bigSmile,
  lorelei,
  openPeeps,
  personas,
  rings,
  shapes,
  thumbs,
};

const getAvatarSvg = (style, seed) => {
  const collection = avatarStyles[style] || avataaars;
  const svg = createAvatar(collection, { seed }).toString();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getCurrentUser = () => {
  try {
    const itemStr = localStorage.getItem("user");
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem("user");
      return null;
    }
    return item.value;
  } catch {
    return null;
  }
};

const JournalEntry = () => {
  const { anonymousName, slug } = useParams();
  const { darkMode } = useDarkMode();
  const { fetchSingleJournal, journals, loading, error, handleLike } =
    usePublicJournals();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [readingTime, setReadingTime] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const currentUser = getCurrentUser();
  const [authorProfile, setAuthorProfile] = useState(null);
  const { modals, openLoginModal, openSignupModal } = AuthModals({ darkMode });

  const author =
    entry && entry.userId && typeof entry.userId === "object"
      ? entry.userId
      : null;

  useEffect(() => {
    const loadJournal = async () => {
      try {
        const journal = await fetchSingleJournal(anonymousName, slug);
        setEntry(journal);
        const wordCount =
          journal.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;
        setReadingTime(Math.ceil(wordCount / 200));
      } catch (err) {
        setEntry(null);
      }
    };

    loadJournal();
  }, [anonymousName, slug, fetchSingleJournal]);

  useEffect(() => {
    setRecommendations([]);
  }, [anonymousName, slug]);

  useEffect(() => {
    if (entry && entry.isPublic && entry._id && entry.category) {
      axios
        .get(
          `${import.meta.env.VITE_API_URL}/recommendations?category=${
            entry.category
          }&exclude=${entry._id}`
        )
        .then((res) => setRecommendations(res.data.journals || []))
        .catch(() => setRecommendations([]));
    }
  }, [entry]);

  useEffect(() => {
    if (entry) {
      setLikeCount(entry.likeCount || 0);
      if (currentUser && entry.likes && Array.isArray(entry.likes)) {
        setIsLiked(entry.likes.includes(currentUser._id));
      } else {
        setIsLiked(false);
      }
    }
  }, [entry, currentUser]);

  useEffect(() => {
    if (!author || !currentUser || author._id === currentUser._id) return;
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/subscription-status/${
          currentUser._id
        }/${author._id}`
      )
      .then((res) => {
        setIsSubscribed(res.data.isSubscribed || res.data.subscribed);
      })
      .catch(() => setIsSubscribed(false));
  }, [author, currentUser]);

  useEffect(() => {
    if (entry && entry.userId && typeof entry.userId === "object") {
      axios
        .get(`${import.meta.env.VITE_API_URL}/user/${entry.userId._id}`)
        .then((res) => setAuthorProfile(res.data.user))
        .catch(() => setAuthorProfile(null));
    }
  }, [entry]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubscribe = async () => {
    if (!currentUser) {
      alert("Please log in to follow users.");
      return;
    }
    if (!author) return;
    try {
      setSubscribing(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/subscribe`,
        {
          subscriberId: currentUser._id,
          targetUserId: author._id,
        }
      );
      setTimeout(() => {
        setIsSubscribed(response.data.subscribed);
        setSubscribing(false);
      }, 2000);
    } catch (error) {
      setSubscribing(false);
      alert("Error following user.");
    }
  };

  const handleJournalLike = async () => {
    if (!currentUser) {
      alert("Please log in to appreciate this journal.");
      return;
    }
    setLikeLoading(true);
    try {
      const res = await handleLike(entry);
      setTimeout(() => {
        setLikeCount(res.likeCount);
        setIsLiked(res.isLiked);
        setLikeLoading(false);
      }, 2000);
    } catch (err) {
      setLikeLoading(false);
      alert("Failed to update like. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const processContent = (content) => {
    if (!content) return "No content available.";
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const images = tempDiv.querySelectorAll("img");
      images.forEach((img) => {
        img.style.cssText = `
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
          margin: 2.5rem auto;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        `;
      });
      return tempDiv.innerHTML;
    } catch (error) {
      return content;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Entry Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            {error || "This journal entry doesn't exist."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar />

      {modals}

      <button
        onClick={() => navigate(-1)}
        className="relative p-3 rounded-full"
        aria-label="Back"
      >
        <ArrowLeft size={18} className="text-gray-600 dark:text-gray-400" />
      </button>

      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-0">
          <header className="mb-5">
            {entry.thumbnail && (
              <div className="mb-12 flex justify-center">
                <img
                  src={entry.thumbnail}
                  alt="Journal thumbnail"
                  className="rounded-2xl shadow-2xl max-h-96 w-full object-cover border border-gray-100 dark:border-gray-800"
                  style={{
                    maxWidth: "100%",
                    aspectRatio: "16/9",
                  }}
                />
              </div>
            )}

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex gap-2 mb-6">
                {entry.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs font-medium tracking-wide uppercase text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight tracking-tight">
              {entry.title || "Untitled Entry"}
            </h1>

            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-4">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {authorProfile && (
                      <Link
                        to={`/journals/${authorProfile.anonymousName}`}
                        className="flex items-center gap-3 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group min-w-0"
                      >
                        <img
                          src={getAvatarSvg(
                            authorProfile.profileTheme?.avatarStyle ||
                              "avataaars",
                            authorProfile.anonymousName || "Anonymous"
                          )}
                          alt="Author"
                          className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700 shadow-sm group-hover:scale-105 transition-transform"
                        />
                        <span className="font-semibold text-gray-900 dark:text-gray-100 block truncate text-lg">
                          {authorProfile.anonymousName || "Anonymous"}
                        </span>
                      </Link>
                    )}
                  </div>
                  {authorProfile &&
                    currentUser &&
                    authorProfile._id !== currentUser._id && (
                      <button
                        onClick={handleSubscribe}
                        disabled={subscribing}
                        className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-auto ${
                          isSubscribed
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        } ${
                          subscribing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {subscribing ? (
                          <Loader2
                            size={16}
                            className="inline-block mr-1 animate-spin align-middle"
                          />
                        ) : isSubscribed ? (
                          "Following"
                        ) : (
                          "Follow"
                        )}
                      </button>
                    )}
                </div>
                {authorProfile && authorProfile.bio && (
                  <div className="mt-2 text-gray-500 dark:text-gray-400 text-sm break-words max-w-full line-clamp-2 sm:line-clamp-none">
                    {authorProfile.bio}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  <span>{formatDate(entry.date)}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>
          </header>

          <div className="w-16 h-px bg-gray-200 dark:bg-gray-800 mx-auto"></div>

          <article className="journal-content">
            <div
              dangerouslySetInnerHTML={{
                __html: processContent(entry.content),
              }}
            />
          </article>

          {entry?.isPublic && (
            <div className="mt-20 pt-12 flex justify-center border-t border-gray-100 dark:border-gray-800">
              <button
                className={`flex items-center gap-3 px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-base font-medium rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 ${
                  isLiked ? "opacity-90" : ""
                } ${likeLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                onClick={handleJournalLike}
                aria-pressed={isLiked}
                disabled={likeLoading}
              >
                {likeLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Heart
                    size={20}
                    fill={isLiked ? "currentColor" : "none"}
                    strokeWidth={2}
                    className={isLiked ? "text-pink-500" : ""}
                  />
                )}
                <span>{isLiked ? "Appreciated" : "Appreciate"}</span>
                <span className="ml-2 text-sm font-semibold">{likeCount}</span>
              </button>
            </div>
          )}

          {entry?.isPublic && (
            <div className="mt-24">
              <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-gray-100">
                Comments
              </h2>
              <div className=" rounded-2xl">
                <Comments journalId={entry._id} />
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <section className="mt-28">
              <h2 className="text-xl font-bold mb-12 text-gray-900 dark:text-gray-100">
                More to read
              </h2>
              <div className="space-y-8">
                {recommendations.slice(0, 5).map((recommendation) => (
                  <div key={recommendation._id}>
                    <JournalCard journal={recommendation} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default JournalEntry;
