import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Tag, Loader } from "lucide-react";
import axios from "axios";
import { useDarkMode } from "../../context/ThemeContext";
import AuthModals from "../Landing/AuthModals";
import Navbar from "../Dashboard/Navbar";
import JournalCard, {
  JournalCardSkeleton,
} from "../PublicJournals/PublicStoryCard";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

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

// Related Tags Component
const RelatedTags = ({ currentTag, contentType, onTagSelect }) => {
  const storyTags = [
    "Fantasy",
    "Horror",
    "Science Fiction",
    "Romance",
    "Mystery",
    "Adventure",
    "Drama",
    "Comedy",
  ];
  const journalTags = [
    "Personal",
    "Reflection",
    "Life",
    "Growth",
    "Thoughts",
    "Experience",
    "Daily",
    "Mindfulness",
  ];

  const tags = contentType === "stories" ? storyTags : journalTags;
  const relatedTags = tags
    .filter((tag) => tag.toLowerCase() !== currentTag.toLowerCase())
    .slice(0, 6);

  if (relatedTags.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {relatedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagSelect(tag)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hero Section Component
const TagHeroSection = ({ tag, totalCount, contentType }) => {
  const getTagDescription = (tagName) => {
    const descriptions = {
      // Story tags
      Fantasy:
        "Dive into magical realms filled with wonder, mythical creatures, and extraordinary adventures.",
      Horror:
        "Experience spine-chilling tales that will keep you on the edge of your seat.",
      "Science Fiction":
        "Explore futuristic worlds and cutting-edge technology through imaginative storytelling.",
      Romance:
        "Discover heartwarming love stories that celebrate human connection and emotion.",
      Mystery:
        "Unravel puzzles and secrets in these captivating tales of intrigue.",
      Adventure:
        "Embark on thrilling journeys filled with excitement and discovery.",
      Drama:
        "Experience powerful stories that explore the depths of human emotion.",
      Comedy: "Enjoy lighthearted tales that bring joy and laughter.",

      // Journal tags
      Personal:
        "Intimate reflections and personal experiences shared authentically.",
      Reflection:
        "Thoughtful contemplations on life, growth, and self-discovery.",
      Life: "Real stories from everyday experiences and life's journey.",
      Growth: "Inspiring accounts of personal development and transformation.",
      Thoughts: "Stream-of-consciousness writing and deep thinking.",
      Experience: "First-hand accounts of meaningful life experiences.",
      Daily: "Everyday moments and daily life reflections.",
      Mindfulness: "Peaceful contemplations on presence and awareness.",
    };
    return (
      descriptions[tagName] ||
      `Explore ${contentType} tagged with "${tagName}" from our community of writers.`
    );
  };

  return (
    <div className="bg-white mt-4">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
          {/* {contentType === 'stories' ? 'Stories' : 'Journals'} Tagged "{tag}" */}
          {tag}
        </h1>
        <p className="text-gray-600 mb-4">{getTagDescription(tag)}</p>
      </div>
    </div>
  );
};

const TagEntries = () => {
  const { tag } = useParams();
  const location = useLocation();
  const { darkMode, setDarkMode } = useDarkMode();
  const { modals, openLoginModal, openSignupModal } = AuthModals({ darkMode });

  const [contentType, setContentType] = useState("stories");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [likedEntries, setLikedEntries] = useState(new Set());
  const [savedEntries, setSavedEntries] = useState(new Set());

  // Memoize user to prevent unnecessary re-renders
  const user = useMemo(() => getCurrentUser(), []);
  const isLoggedIn = !!user;

  // Determine content type from referrer or URL state
  useEffect(() => {
    const state = location.state;
    if (state?.contentType) {
      setContentType(state.contentType);
    } else {
      setContentType("stories"); // Default to stories
    }
  }, [location.state]);

  // Fetch entries by tag
  const fetchEntries = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        else setLoadingMore(true);

        const params = {
          page: pageNum,
          limit: 12,
          sort: "-createdAt",
          category: contentType === "stories" ? "story" : "journal",
        };

        const response = await API.get(
          `/journals/by-tag/${encodeURIComponent(tag)}`,
          { params }
        );

        const newEntries = response.data.journals || [];

        if (append) {
          setEntries((prev) => [...prev, ...newEntries]);
        } else {
          setEntries(newEntries);
        }

        setHasMore(response.data.hasMore);
        setTotalCount(response.data.totalCount || newEntries.length);
        setPage(pageNum);

        // Update liked/saved status
        if (user) {
          const liked = new Set(
            newEntries
              .filter((entry) => entry.likes?.includes(user._id))
              .map((entry) => entry._id)
          );
          const saved = new Set(
            newEntries
              .filter((entry) => user.savedEntries?.includes(entry._id))
              .map((entry) => entry._id)
          );

          if (append) {
            setLikedEntries((prev) => new Set([...prev, ...liked]));
            setSavedEntries((prev) => new Set([...prev, ...saved]));
          } else {
            setLikedEntries(liked);
            setSavedEntries(saved);
          }
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
        setError("Failed to fetch entries");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [tag, contentType, user]
  );

  // Handle like
  const handleLike = useCallback(
    async (entry) => {
      if (!user) return;

      const entryId = entry._id;
      const isCurrentlyLiked = likedEntries.has(entryId);

      // Optimistic update
      setLikedEntries((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(entryId);
        } else {
          newSet.add(entryId);
        }
        return newSet;
      });

      setEntries((prev) =>
        prev.map((e) =>
          e._id === entryId
            ? { ...e, likeCount: e.likeCount + (isCurrentlyLiked ? -1 : 1) }
            : e
        )
      );

      try {
        await API.post(`/journals/${entryId}/like`, { userId: user._id });
      } catch (error) {
        // Revert on error
        setLikedEntries((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlyLiked) {
            newSet.add(entryId);
          } else {
            newSet.delete(entryId);
          }
          return newSet;
        });
        console.error("Error liking entry:", error);
      }
    },
    [likedEntries, user]
  );

  // Handle save
  const handleSave = useCallback(
    async (entryId) => {
      if (!user) return;

      const isCurrentlySaved = savedEntries.has(entryId);

      setSavedEntries((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.delete(entryId);
        } else {
          newSet.add(entryId);
        }
        return newSet;
      });

      try {
        await API.post(`/journals/${entryId}/save`, { userId: user._id });
      } catch (error) {
        // Revert on error
        setSavedEntries((prev) => {
          const newSet = new Set(prev);
          if (isCurrentlySaved) {
            newSet.add(entryId);
          } else {
            newSet.delete(entryId);
          }
          return newSet;
        });
        console.error("Error saving entry:", error);
      }
    },
    [savedEntries, user]
  );

  // Handle tag selection
  const handleTagSelect = (newTag) => {
    window.location.href = `/tag/${newTag.toLowerCase()}?contentType=${contentType}`;
  };

  // Load more entries
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchEntries(page + 1, true);
    }
  }, [hasMore, loadingMore, page, fetchEntries]);

  // Initial load
  useEffect(() => {
    fetchEntries(1, false);
  }, [tag, contentType, fetchEntries]);

  // Dynamic SEO content
  const seo = {
    title: `${
      contentType === "stories" ? "Stories" : "Journals"
    } Tagged "${tag}" | Starlit Journals`,
    description: `Discover ${
      contentType === "stories"
        ? "creative stories"
        : "personal journal entries"
    } tagged with "${tag}". Find meaningful content from our community of writers.`,
    keywords: `${tag.toLowerCase()}, ${contentType}, creative writing, ${
      contentType === "stories"
        ? "short stories, fiction"
        : "personal journal, daily writing"
    }, starlit journals`,
    canonicalUrl: `https://starlitjournals.com/tag/${tag.toLowerCase()}`,
  };

  if (loading && !loadingMore) {
    return (
      <>
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta name="keywords" content={seo.keywords} />
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={seo.canonicalUrl} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={seo.canonicalUrl} />
        </Helmet>

        <Navbar name="New Entry" link="/journaling-alt" />

        <div className="min-h-screen bg-gray-50">
          <TagHeroSection tag={tag} totalCount={0} contentType={contentType} />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <JournalCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
        {modals}
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>{seo.title}</title>
          <meta name="description" content={seo.description} />
          <meta name="keywords" content={seo.keywords} />
          <meta property="og:title" content={seo.title} />
          <meta property="og:description" content={seo.description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={seo.canonicalUrl} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={seo.canonicalUrl} />
        </Helmet>

        <Navbar name="New Entry" link="/journaling-alt" />

        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchEntries(1, false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        {modals}
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seo.canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={seo.canonicalUrl} />
      </Helmet>

      <Navbar name="New Entry" link="/journaling-alt" />

      <div className="min-h-screen">
        <div className="p-6">
          <TagHeroSection
            tag={tag}
            totalCount={totalCount}
            contentType={contentType}
          />
          <RelatedTags
            currentTag={tag}
            contentType={contentType}
            onTagSelect={handleTagSelect}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {contentType} found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any {contentType} tagged with "{tag}". Try
                  exploring other tags or check back later.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {entries.map((entry) => (
                  <JournalCard
                    key={entry._id}
                    journal={entry}
                    onLike={handleLike}
                    onSave={handleSave}
                    isLiked={likedEntries.has(entry._id)}
                    isSaved={savedEntries.has(entry._id)}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loadingMore ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {modals}
    </>
  );
};

export default TagEntries;
