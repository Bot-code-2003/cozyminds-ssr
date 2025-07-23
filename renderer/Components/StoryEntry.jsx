"use client";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDarkMode } from "../context/ThemeContext";
import { usePublicStories } from "../context/PublicStoriesContext";
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
import { Helmet } from "react-helmet";

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

const StoryEntry = () => {
  const { anonymousName, slug } = useParams();
  const { darkMode } = useDarkMode();
  const { fetchSingleStory, stories, loading, error, handleLike } =
    usePublicStories();
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
    const loadStory = async () => {
      try {
        const story = await fetchSingleStory(anonymousName, slug);
        setEntry(story);
        const wordCount =
          story.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;
        setReadingTime(Math.ceil(wordCount / 200));
      } catch (err) {
        setEntry(null);
      }
    };

    loadStory();
  }, [anonymousName, slug, fetchSingleStory]);

  useEffect(() => {
    setRecommendations([]);
  }, [anonymousName, slug]);

  useEffect(() => {
    if (entry && entry.isPublic && entry._id) {
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

  const handleStoryLike = async () => {
    if (!currentUser) {
      alert("Please log in to appreciate this story.");
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
            {error || "This entry doesn't exist."}
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
      <Helmet>
        <title>{entry.title || "Untitled Entry"} | Cozy Mind</title>
        {entry.metaDescription && (
          <meta name="description" content={entry.metaDescription} />
        )}
      </Helmet>
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
        <div className="mx-auto px-4 sm:px-0">
          <header className="max-w-6xl mx-auto relative">
            {/* Hero Image - Full viewport impact */}
            {entry.thumbnail && (
              <div className="relative h-[85vh] overflow-hidden">
                <img
                  src={entry.thumbnail}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-end">
                  <div className="max-w-4xl mx-auto w-full px-6 pb-16">
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex gap-3 mb-6">
                        {entry.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs font-semibold tracking-[0.2em] uppercase text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light text-white mb-6 leading-[0.9] tracking-tight font-serif max-w-4xl">
                      {entry.title || "Untitled Entry"}
                    </h1>
                    {entry.metaDescription && (
                      <p className="text-md text-white sm:text-lg italic font-light leading-relaxed max-w-2xl mb-8">
                        {entry.metaDescription}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No image fallback - Minimalist header */}
            {!entry.thumbnail && (
              <div className="max-w-4xl mx-auto px-6 py-20">
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex gap-3 mb-12">
                    {entry.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600 dark:text-emerald-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light text-gray-900 dark:text-gray-100 mb-8 leading-[0.9] tracking-tight font-serif">
                  {entry.title || "Untitled Entry"}
                </h1>
                {entry.metaDescription && (
                  <p className="text-2xl sm:text-3xl text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-3xl mb-16">
                    {entry.metaDescription}
                  </p>
                )}
              </div>
            )}

            {/* Author section - Clean separation */}
            <div className="dark:border-gray-800">
              <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {authorProfile && (
                      <div className="flex items-start gap-6">
                        <Link
                          to={`/profile/id/${authorProfile._id}`}
                          className="flex-shrink-0 group"
                        >
                          <img
                            src={getAvatarSvg(
                              authorProfile.profileTheme?.avatarStyle ||
                                "avataaars",
                              authorProfile.anonymousName || "Anonymous"
                            )}
                            alt="Author"
                            className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700 group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400 mb-2">
                            Written by
                          </div>
                          <Link
                            to={`/profile/id/${authorProfile._id}`}
                            className="block group"
                          >
                            <h2 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                              {authorProfile.anonymousName || "Anonymous"}
                            </h2>
                          </Link>
                          {authorProfile.bio && (
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                              {authorProfile.bio}
                            </p>
                          )}
                          <div className="flex items-center gap-6 mt-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span>Published {formatDate(entry.date)}</span>
                            </div>
                            <span>{readingTime} minute read</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {authorProfile &&
                    currentUser &&
                    authorProfile._id !== currentUser._id && (
                      <div className="ml-8 flex-shrink-0">
                        <button
                          onClick={handleSubscribe}
                          disabled={subscribing}
                          className={`relative overflow-hidden px-8 py-3 text-sm font-medium transition-all duration-300 ${
                            isSubscribed
                              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                              : "bg-transparent border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-white dark:hover:bg-gray-100 dark:hover:text-gray-900"
                          } ${
                            subscribing ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {subscribing && (
                            <Loader2
                              size={16}
                              className="inline-block mr-2 animate-spin"
                            />
                          )}
                          {isSubscribed ? "Following" : "Follow"}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </header>

          <div className="w-16 h-px mb-10 bg-gray-200 dark:bg-gray-800 mx-auto"></div>

          <article className="max-w-3xl mx-auto journal-content">
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
                onClick={handleStoryLike}
                disabled={likeLoading}
              >
                <Heart
                  size={20}
                  className={`${
                    isLiked
                      ? "fill-red-500 dark:fill-red-400"
                      : "fill-gray-400 dark:fill-gray-500"
                  }`}
                />
                <span>{likeCount}</span>
              </button>
            </div>
          )}

          {entry?.isPublic && (
            <div className="max-w-3xl mx-auto mt-24">
              <h2 className="text-xl font-bold mb-8 text-gray-900 dark:text-gray-100">
                Comments
              </h2>
              <div className="rounded-2xl">
                <Comments journalId={entry._id} />
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <section className="max-w-3xl mx-auto mt-28">
              <h2 className="text-xl font-bold mb-12 text-gray-900 dark:text-gray-100">
                More {entry.category === "story" ? "Stories" : "Journals"} to
                Read
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

export default StoryEntry;
