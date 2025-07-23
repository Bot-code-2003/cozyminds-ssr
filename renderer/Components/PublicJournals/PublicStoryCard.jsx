"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AuthModals from "../Landing/AuthModals";
import { useDarkMode } from "../../context/ThemeContext";
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
import axios from "axios";

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
    if (item && item.value) return item.value;
    return item;
  } catch {
    return null;
  }
};

const JournalCard = ({
  journal,
  onLike,
  isLiked,
  isSaved: isSavedProp,
  onSave,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authorProfile, setAuthorProfile] = useState(journal.author || null);

  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useDarkMode();
  const { modals, openLoginModal } = AuthModals({ darkMode });

  const user = useMemo(() => getCurrentUser(), []);

  const prefix = location.pathname.startsWith("/stories")
    ? "/stories"
    : "/journals";

  const thumbnail = useMemo(() => {
    if (journal.thumbnail && !imageError) return journal.thumbnail;
    if (!journal.content || imageError) return null;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = journal.content;
    const img = tempDiv.querySelector("img");
    return img?.src || null;
  }, [journal.thumbnail, journal.content, imageError]);

  const storyPreview = useMemo(() => {
    if (journal.category === "story" && journal.metaDescription) {
      return journal.metaDescription;
    }
    if (!journal.content) return "No content available.";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = journal.content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    return text.trim().substring(0, 120) + (text.length > 120 ? "…" : "");
  }, [journal.category, journal.metaDescription, journal.content]);

  const readingTime = useMemo(() => {
    if (!journal.content) return "1 min read";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = journal.content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  }, [journal.content]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (
        journal.userId &&
        typeof journal.userId === "object" &&
        journal.userId !== null
      ) {
        if (user && user._id === journal.userId._id) {
          setAuthorProfile({
            userId: user._id,
            anonymousName: user.anonymousName,
            profileTheme: user.profileTheme,
          });
        } else {
          setAuthorProfile({
            userId: journal.userId._id,
            anonymousName: journal.userId.anonymousName,
            profileTheme: journal.userId.profileTheme,
          });
        }
        return;
      }

      const authorId = journal.userId;
      if (!authorId) return;

      if (user && user._id === authorId) {
        setAuthorProfile({
          userId: user._id,
          anonymousName: user.anonymousName,
          profileTheme: user.profileTheme,
        });
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/${authorId}`
        );
        const author = res.data.user;
        setAuthorProfile({
          userId: author._id,
          anonymousName: author.anonymousName,
          profileTheme: author.profileTheme,
        });
      } catch {
        setAuthorProfile(null);
      }
    };
    fetchProfile();
  }, [journal.userId, user]);

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/id/${authorProfile.userId}`);
  };

  const handleLike = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) return openLoginModal();

      setIsLiking(true);
      try {
        await onLike(journal);
      } catch (error) {
        console.error("Error liking:", error);
      } finally {
        setIsLiking(false);
      }
    },
    [onLike, journal, user, openLoginModal]
  );

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) return openLoginModal();
      setIsSaving(true);
      try {
        await onSave(journal._id, !isSavedProp);
      } catch (error) {
        console.error("Error saving:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [user, onSave, journal._id, isSavedProp, openLoginModal]
  );

  return (
    <>
      <article className="group py-8 border-b border-gray-200 dark:border-gray-800 last:border-b-0">
        <Link
          to={`/${authorProfile?.anonymousName || "anonymous"}/${journal.slug}`}
          className="block"
        >
          <div className="flex gap-6">
            {/* Content Section */}
            <div className="flex-1 min-w-0">
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-gray-200 dark:hover:ring-gray-700 flex-shrink-0"
                  onClick={handleAuthorClick}
                >
                  <img
                    src={getAvatarSvg(
                      authorProfile?.profileTheme?.avatarStyle || "avataaars",
                      authorProfile?.anonymousName || "Anonymous"
                    )}
                    alt=""
                    className="w-full h-full"
                  />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span 
                      className="font-medium text-gray-900 dark:text-white cursor-pointer hover:underline truncate"
                      onClick={handleAuthorClick}
                    >
                      {authorProfile?.anonymousName || "Anonymous"}
                    </span>
                    <span className="text-gray-400">·</span>
                    <time className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(journal.createdAt), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                </div>
              </div>

              {/* Category Tag */}
              {journal.tags && journal.tags.length > 0 && (
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded">
                    {journal.tags[0]}
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors line-clamp-2">
                {journal.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                {storyPreview}
              </p>

              {/* Meta and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{readingTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                      isLiked
                        ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Heart
                      className="w-3 h-3"
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    <span>{journal.likeCount || 0}</span>
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`p-1.5 rounded transition-all ${
                      isSavedProp
                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Bookmark
                      className="w-3 h-3"
                      fill={isSavedProp ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Thumbnail */}
            {thumbnail && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                <div className="w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-800 rounded">
                  <img
                    src={thumbnail}
                    alt=""
                    className="w-full h-full object-cover transition-all duration-300 ease-out group-hover:scale-105"
                    onError={() => setImageError(true)}
                  />
                </div>
              </div>
            )}
          </div>
        </Link>
      </article>
      {modals}
    </>
  );
};

export default JournalCard;

export const JournalCardSkeleton = () => (
  <div className="py-8 border-b border-gray-200 dark:border-gray-800 animate-pulse">
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        {/* Author skeleton */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>

        {/* Category skeleton */}
        <div className="mb-2">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Title skeleton */}
        <div className="mb-2 space-y-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 w-5/6 rounded" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 w-3/4 rounded" />
        </div>

        {/* Description skeleton */}
        <div className="mb-4 space-y-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 w-full rounded" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 w-4/5 rounded" />
        </div>

        {/* Meta skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>

      {/* Thumbnail skeleton */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);