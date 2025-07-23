import React, { useState, useEffect, useCallback } from "react";
import { Clock, Heart, MessageSquare, BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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

// Avatar logic
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
        state: {
          contentType: "stories",
          selectedTag: tag, // Pass the selected tag in state
        },
      });
    } else {
      navigate("/public", { state: { contentType: "stories" } }); // Navigate to public stories when "All" is clicked
      onTagSelect(null);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 pb-4 pt-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleTagClick(null)}
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
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main PublicStories Component
const PublicStories = () => {
  const [featuredStories, setFeaturedStories] = useState([]);
  const [latestStories, setLatestStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [likedStories, setLikedStories] = useState(new Set());
  const [savedStories, setSavedStories] = useState(new Set());

  const popularTags = [
    "Fantasy",
    "Horror",
    "Science Fiction",
    "Romance",
    "Mystery",
    "Adventure",
    "Drama",
    "Comedy",
  ];
  const { darkMode } = useDarkMode();
  const { modals } = AuthModals({ darkMode });
  const location = useLocation();
  const navigate = useNavigate();

  // Sync selectedTag with route state
  useEffect(() => {
    const tagFromRoute = location.state?.selectedTag || null;
    if (tagFromRoute !== selectedTag) {
      setSelectedTag(tagFromRoute);
      setPage(1); // Reset page when tag changes
    }
  }, [location.state, selectedTag]);

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

  // Fetch featured stories (top liked from last 30 days)
  const fetchFeaturedStories = useCallback(async () => {
    try {
      const response = await API.get("/stories/top-liked");
      setFeaturedStories(response.data.stories || []);
    } catch (error) {
      console.error("Error fetching featured stories:", error);
    }
  }, []);

  // Fetch latest stories
  const fetchLatestStories = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const params = {
          page: pageNum,
          limit: 12,
          sort: "-createdAt",
          category: "story",
        };

        if (selectedTag) {
          params.tag = selectedTag;
        }

        const endpoint = selectedTag
          ? `/journals/by-tag/${encodeURIComponent(selectedTag)}`
          : "/journals/public";
        const response = await API.get(endpoint, { params });

        const newStories = response.data.journals || [];

        if (append) {
          setLatestStories((prev) => [...prev, ...newStories]);
        } else {
          setLatestStories(newStories);
        }

        setHasMore(response.data.hasMore);
        setPage(pageNum);

        // Update liked/saved status
        const user = getCurrentUser();
        if (user) {
          const liked = new Set(
            newStories
              .filter((story) => story.likes?.includes(user._id))
              .map((story) => story._id)
          );
          const saved = new Set(
            newStories
              .filter((story) => user.savedEntries?.includes(story._id))
              .map((story) => story._id)
          );

          if (append) {
            setLikedStories((prev) => new Set([...prev, ...liked]));
            setSavedStories((prev) => new Set([...prev, ...saved]));
          } else {
            setLikedStories(liked);
            setSavedStories(saved);
          }
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
        setError("Failed to fetch stories");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedTag]
  );

  // Handle like
  const handleLike = useCallback(
    async (story) => {
      const user = getCurrentUser();
      if (!user) return;

      const storyId = story._id;
      const isCurrentlyLiked = likedStories.has(storyId);

      // Optimistic update
      setLikedStories((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(storyId);
        } else {
          newSet.add(storyId);
        }
        return newSet;
      });

      // Update story in both lists
      const updateStory = (stories) =>
        stories.map((s) =>
          s._id === storyId
            ? { ...s, likeCount: s.likeCount + (isCurrentlyLiked ? -1 : 1) }
            : s
        );

      setFeaturedStories(updateStory);
      setLatestStories(updateStory);

      try {
        await API.post(`/journals/${storyId}/like`, { userId: user._id });
      } catch (error) {
        // Revert on error
        setLikedStories((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyLiked) {
            newSet.add(storyId);
          } else {
            newSet.delete(storyId);
          }
          return newSet;
        });
        console.error("Error liking story:", error);
      }
    },
    [likedStories]
  );

  // Handle save
  const handleSave = useCallback(
    async (storyId) => {
      const user = getCurrentUser();
      if (!user) return;

      const isCurrentlySaved = savedStories.has(storyId);

      setSavedStories((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.delete(storyId);
        } else {
          newSet.add(storyId);
        }
        return newSet;
      });

      try {
        await API.post(`/journals/${storyId}/save`, { userId: user._id });
      } catch (error) {
        // Revert on error
        setSavedStories((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlySaved) {
            newSet.add(storyId);
          } else {
            newSet.delete(storyId);
          }
          return newSet;
        });
        console.error("Error saving story:", error);
      }
    },
    [savedStories]
  );

  // Load more stories
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchLatestStories(page + 1, true);
    }
  }, [hasMore, loadingMore, page, fetchLatestStories]);

  // Initial load and tag change
  useEffect(() => {
    fetchFeaturedStories();
    fetchLatestStories(1, false);
  }, [fetchFeaturedStories, fetchLatestStories]);

  if (loading && !loadingMore) {
    return (
      <div className="min-h-[50vh] bg-gray-50">
        <TagFilters
          tags={popularTags}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
        />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              fetchLatestStories(1, false);
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
    <div className="min-h-screen bg-white">
      <TagFilters
        tags={popularTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Stories Section */}
        {!selectedTag && featuredStories.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-8">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Stories
              </h2>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto lg:h-[600px]">
              {featuredStories.map((story, index) => {
                const isLarge = index === 0;
                const isMedium = index === 1;
                let thumbnail = story.thumbnail;
                if (!thumbnail && story.content) {
                  try {
                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = story.content;
                    const img = tempDiv.querySelector("img");
                    thumbnail = img?.src || null;
                  } catch {}
                }
                const avatarStyle =
                  story.author?.profileTheme?.avatarStyle || "avataaars";
                const avatarSeed = story.author?.anonymousName || "Anonymous";
                const avatarUrl = getAvatarSvg(avatarStyle, avatarSeed);

                return (
                  <div
                    key={story._id}
                    className={`
                      group rounded-lg relative overflow-hidden bg-gray-900 border border-gray-800 hover:shadow-lg transition-all duration-300
                      ${isLarge ? "md:col-span-2 md:row-span-2" : ""}
                      ${isMedium ? "lg:col-span-2" : ""}
                    `}
                  >
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

                    <div
                      className={`
                      relative z-10 p-6 h-full flex flex-col justify-between text-white
                      ${isLarge ? "p-8" : "p-6"}
                    `}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={avatarUrl}
                            alt=""
                            className="w-6 h-6 rounded-full border border-white/20"
                          />
                          <span className="text-sm font-medium text-white/90">
                            {story.author?.anonymousName || "Anonymous"}
                          </span>
                        </div>

                        <h3
                          className={`
                          font-bold leading-tight mb-2 line-clamp-3 text-white
                          ${isLarge ? "text-2xl" : "text-lg"}
                        `}
                        >
                          {story.title}
                        </h3>

                        {isLarge && (
                          <p className="text-sm leading-relaxed line-clamp-3 mb-4 text-white/80">
                            {story.metaDescription ||
                              (story.content
                                ? story.content
                                    .replace(/<[^>]*>/g, "")
                                    .substring(0, 120) + "..."
                                : "No preview available")}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-white/80" />
                            <span className="text-sm text-white/80">
                              {story.likeCount || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-white/80" />
                            <span className="text-sm text-white/80">
                              {story.commentCount || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleLike(story);
                            }}
                            className={`
                              p-2 rounded-full transition-colors
                              ${
                                likedStories.has(story._id)
                                  ? "bg-red-500 text-white"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }
                            `}
                          >
                            <Heart
                              className="w-4 h-4"
                              fill={
                                likedStories.has(story._id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSave(story._id);
                            }}
                            className={`
                              p-2 rounded-full transition-colors
                              ${
                                savedStories.has(story._id)
                                  ? "bg-blue-500 text-white"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }
                            `}
                          >
                            <BookOpen
                              className="w-4 h-4"
                              fill={
                                savedStories.has(story._id)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`/${story.author?.anonymousName || "anonymous"}/${
                        story.slug
                      }`}
                      className="absolute inset-0 z-20"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/${
                          story.author?.anonymousName || "anonymous"
                        }/${story.slug}`;
                      }}
                    />
                  </div>
                );
              })}

              {featuredStories.length < 3 && (
                <div className="hidden lg:block bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">More stories coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Latest Stories Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedTag
                ? `Stories tagged "${selectedTag}"`
                : "Latest Stories"}
            </h2>
          </div>

          {latestStories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No stories found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {latestStories.map((story) => (
                  <JournalCard
                    key={story._id}
                    journal={story}
                    onLike={handleLike}
                    onSave={handleSave}
                    isLiked={likedStories.has(story._id)}
                    isSaved={savedStories.has(story._id)}
                  />
                ))}
              </div>

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

export default PublicStories;
