import React, { useState, useEffect, useCallback } from "react";
import { Clock, Heart, Eye, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import JournalCard, { JournalCardSkeleton } from "./PublicStoryCard";
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

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

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

// Tag Filter Component
const TagFilters = ({ tags, selectedTag, onTagSelect }) => {
  const navigate = useNavigate();

  const handleTagClick = (tag) => {
    if (tag) {
      navigate(`/tag/${tag.toLowerCase()}`, {
        state: { contentType: "journals" },
      });
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 pb-4 pt-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => onTagSelect(null)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              !selectedTag
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main PublicJournals Component
const PublicJournals = () => {
  const [featuredJournals, setFeaturedJournals] = useState([]);
  const [latestJournals, setLatestJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [likedJournals, setLikedJournals] = useState(new Set());
  const [savedJournals, setSavedJournals] = useState(new Set());

  const popularTags = [
    "Personal",
    "Reflection",
    "Life",
    "Growth",
    "Thoughts",
    "Experience",
    "Daily",
    "Mindfulness",
  ];
  const { darkMode } = useDarkMode();
  const { modals, openLoginModal } = AuthModals({ darkMode });

  const getCurrentUser = () => {
    try {
      const itemStr = localStorage.getItem("user");
      if (!itemStr) return null;
      const item = JSON.parse(itemStr);
      return item?.value || item;
    } catch {
      return null;
    }
  };

  // Fetch featured journals (top liked from last 30 days)
  const fetchFeaturedJournals = useCallback(async () => {
    try {
      const response = await API.get("/journals/top-liked");
      setFeaturedJournals(response.data.journals || []);
    } catch (error) {
      console.error("Error fetching featured journals:", error);
    }
  }, []);

  // Fetch latest journals
  const fetchLatestJournals = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const params = {
          page: pageNum,
          limit: 12,
          sort: "-createdAt",
          category: "journal",
        };

        if (selectedTag) {
          params.tag = selectedTag;
        }

        const endpoint = selectedTag
          ? `/journals/by-tag/${encodeURIComponent(selectedTag)}`
          : "/journals/public";
        const response = await API.get(endpoint, { params });

        const newJournals = response.data.journals || [];

        if (append) {
          setLatestJournals((prev) => [...prev, ...newJournals]);
        } else {
          setLatestJournals(newJournals);
        }

        setHasMore(response.data.hasMore);
        setPage(pageNum);

        // Update liked/saved status
        const user = getCurrentUser();
        if (user) {
          const liked = new Set(
            newJournals
              .filter((journal) => journal.likes?.includes(user._id))
              .map((journal) => journal._id)
          );
          const saved = new Set(
            newJournals
              .filter((journal) => user.savedEntries?.includes(journal._id))
              .map((journal) => journal._id)
          );

          if (append) {
            setLikedJournals((prev) => new Set([...prev, ...liked]));
            setSavedJournals((prev) => new Set([...prev, ...saved]));
          } else {
            setLikedJournals(liked);
            setSavedJournals(saved);
          }
        }
      } catch (error) {
        console.error("Error fetching journals:", error);
        setError("Failed to fetch journals");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedTag]
  );

  // Handle like
  const handleLike = useCallback(
    async (journal) => {
      const user = getCurrentUser();
      if (!user) return;

      const journalId = journal._id;
      const isCurrentlyLiked = likedJournals.has(journalId);

      // Optimistic update
      setLikedJournals((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(journalId);
        } else {
          newSet.add(journalId);
        }
        return newSet;
      });

      // Update journal in both lists
      const updateJournal = (journals) =>
        journals.map((j) =>
          j._id === journalId
            ? { ...j, likeCount: j.likeCount + (isCurrentlyLiked ? -1 : 1) }
            : j
        );

      setFeaturedJournals(updateJournal);
      setLatestJournals(updateJournal);

      try {
        await API.post(`/journals/${journalId}/like`, { userId: user._id });
      } catch (error) {
        // Revert on error
        setLikedJournals((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyLiked) {
            newSet.add(journalId);
          } else {
            newSet.delete(journalId);
          }
          return newSet;
        });
        console.error("Error liking journal:", error);
      }
    },
    [likedJournals]
  );

  // Handle save
  const handleSave = useCallback(
    async (journalId) => {
      const user = getCurrentUser();
      if (!user) return;

      const isCurrentlySaved = savedJournals.has(journalId);

      setSavedJournals((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.delete(journalId);
        } else {
          newSet.add(journalId);
        }
        return newSet;
      });

      try {
        await API.post(`/journals/${journalId}/save`, { userId: user._id });
      } catch (error) {
        // Revert on error
        setSavedJournals((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlySaved) {
            newSet.add(journalId);
          } else {
            newSet.delete(journalId);
          }
          return newSet;
        });
        console.error("Error saving journal:", error);
      }
    },
    [savedJournals]
  );

  // Handle tag selection (now just resets to show all)
  const handleTagSelect = useCallback((tag) => {
    setSelectedTag(tag);
    setPage(1);
  }, []);

  // Load more journals
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchLatestJournals(page + 1, true);
    }
  }, [hasMore, loadingMore, page, fetchLatestJournals]);

  // Initial load
  useEffect(() => {
    fetchFeaturedJournals();
    fetchLatestJournals();
  }, [fetchFeaturedJournals, fetchLatestJournals]);

  if (loading && !loadingMore) {
    return (
      <div className="min-h-[50vh] bg-gray-50">
        <TagFilters
          tags={popularTags}
          selectedTag={selectedTag}
          onTagSelect={handleTagSelect}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <JournalCardSkeleton key={i} />
            ))}
          </div>
        </div>
        {modals}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchLatestJournals();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        {modals}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TagFilters
        tags={popularTags}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Journals Section */}
        {!selectedTag && featuredJournals.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-8">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Journals
              </h2>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4  h-auto lg:h-[600px]">
              {featuredJournals.map((journal, index) => {
                const isLarge = index === 0;
                const isMedium = index === 1;
                // Thumbnail logic: fallback to first image in content
                let thumbnail = journal.thumbnail;
                if (!thumbnail && journal.content) {
                  try {
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = journal.content;
                    const img = tempDiv.querySelector("img");
                    thumbnail = img?.src || null;
                  } catch {}
                }
                // Author avatar logic
                const avatarStyle =
                  journal.author?.profileTheme?.avatarStyle || "avataaars";
                const avatarSeed = journal.author?.anonymousName || "Anonymous";
                const avatarUrl = getAvatarSvg(avatarStyle, avatarSeed);

                return (
                  <div
                    key={journal._id}
                    className={`
                      group rounded-lg relative overflow-hidden bg-gray-900 border border-gray-800 hover:shadow-lg transition-all duration-300
                      ${isLarge ? "md:col-span-2 md:row-span-2" : ""}
                      ${isMedium ? "lg:col-span-2" : ""}
                    `}
                  >
                    {/* Background Image */}
                    {thumbnail && (
                      <div className="absolute inset-0">
                        <img
                          src={thumbnail}
                          alt=""
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      </div>
                    )}

                    {/* Content Overlay */}
                    <div
                      className={`
                      relative z-10 p-6 h-full flex flex-col justify-between text-white
                      ${isLarge ? "p-8" : "p-6"}
                    `}
                    >
                      {/* Top Section */}
                      <div>
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={avatarUrl}
                            alt=""
                            className="w-6 h-6 rounded-full border border-white/20"
                          />
                          <span className="text-sm font-medium text-white/90">
                            {journal.author?.anonymousName || "Anonymous"}
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          className={`
                          font-bold leading-tight mb-2 line-clamp-3 text-white
                          ${isLarge ? "text-2xl" : "text-lg"}
                        `}
                        >
                          {journal.title}
                        </h3>

                        {/* Preview Text - Only for large card */}
                        {isLarge && (
                          <p className="text-sm leading-relaxed line-clamp-3 mb-4 text-white/80">
                            {journal.metaDescription ||
                              (journal.content
                                ? journal.content
                                    .replace(/<[^>]*>/g, "")
                                    .substring(0, 120) + "..."
                                : "No preview available")}
                          </p>
                        )}
                      </div>

                      {/* Bottom Section */}
                      <div className="flex items-center justify-between">
                        {/* Stats */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-white/80" />
                            <span className="text-sm text-white/80">
                              {journal.likeCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-white/80" />
                            <span className="text-sm text-white/80">
                              {journal.commentCount || 0}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLike(journal);
                            }}
                            className={`
                              p-2 rounded-full transition-colors
                              ${
                                likedJournals.has(journal._id)
                                  ? "bg-red-500 text-white"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }
                            `}
                          >
                            <Heart
                              className="w-4 h-4"
                              fill={
                                likedJournals.has(journal._id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSave(journal._id);
                            }}
                            className={`
                              p-2 rounded-full transition-colors
                              ${
                                savedJournals.has(journal._id)
                                  ? "bg-blue-500 text-white"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }
                            `}
                          >
                            <BookOpen
                              className="w-4 h-4"
                              fill={
                                savedJournals.has(journal._id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Click Overlay */}
                    <a
                      href={`/${journal.author?.anonymousName || "anonymous"}/${
                        journal.slug
                      }`}
                      className="absolute inset-0 z-20"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/${
                          journal.author?.anonymousName || "anonymous"
                        }/${journal.slug}`;
                      }}
                    />
                  </div>
                );
              })}

              {/* Fill empty slots if less than 3 journals */}
              {featuredJournals.length < 3 && (
                <div className="hidden lg:block bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">More journals coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Latest Journals Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedTag
                ? `Journals tagged "${selectedTag}"`
                : "Latest Journals"}
            </h2>
          </div>

          {latestJournals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No journals found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {latestJournals.map((journal) => (
                  <JournalCard
                    key={journal._id}
                    journal={journal}
                    onLike={handleLike}
                    onSave={handleSave}
                    isLiked={likedJournals.has(journal._id)}
                    isSaved={savedJournals.has(journal._id)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      {modals}
    </div>
  );
};

export default PublicJournals;
