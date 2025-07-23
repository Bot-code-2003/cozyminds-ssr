"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000" })

const PublicStoriesContext = createContext()

export function PublicStoriesProvider({ children }) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [likedStories, setLikedStories] = useState(new Set())
  const [savedStories, setSavedStories] = useState(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [feedType, setFeedType] = useState("-createdAt")
  const [showFollowingOnly, setShowFollowingOnly] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const getCurrentUser = () => {
    try {
      const itemStr = localStorage.getItem("user")
      if (!itemStr) return null
      const item = JSON.parse(itemStr)
      const now = new Date()
      if (now.getTime() > item.expiry) {
        localStorage.removeItem("user")
        return null
      }
      return item.value
    } catch {
      return null
    }
  }

  const fetchStoriesByTag = useCallback(
    async (tag, pageNum = 1, append = false) => {
      try {
        setLoading(!append)
        setLoadingMore(append)
        setError(null)
        setSelectedTag(tag)

        const params = {
          page: pageNum,
          limit: 20,
          sort: feedType,
          category: "story",
        }

        const response = await API.get(`/journals/by-tag/${encodeURIComponent(tag)}`, { params })
        const { journals: newStories, hasMore: moreAvailable } = response.data

        setStories((prev) => (append ? [...prev, ...newStories] : newStories))
        setHasMore(moreAvailable)
        setPage(pageNum)

        const userData = getCurrentUser()
        if (userData) {
          const likedSet = new Set(
            newStories.filter((story) => story.likes?.includes(userData._id)).map((story) => story._id)
          )
          setLikedStories((prev) => (append ? new Set([...prev, ...likedSet]) : likedSet))

          const savedSet = new Set(
            newStories.filter((story) => userData.savedEntries?.includes(story._id)).map((story) => story._id)
          )
          setSavedStories((prev) => (append ? new Set([...prev, ...savedSet]) : savedSet))
        }
      } catch (error) {
        console.error("Error fetching stories by tag:", error)
        setError("Failed to fetch stories for this tag. Please try again.")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [feedType]
  )

  const fetchStories = useCallback(
    async (pageNum = 1, currentFeedType = feedType, append = false) => {
      try {
        setLoading(!append)
        setLoadingMore(append)
        setError(null)

        const userData = getCurrentUser()
        const params = {
          page: pageNum,
          limit: 20,
          sort: currentFeedType,
          category: "story",
        }

        let response
        if (showFollowingOnly && userData) {
          response = await API.get(`/feed/${userData._id}`, { params })
        } else {
          response = await API.get("/journals/public", { params })
        }

        const { journals: newStories, hasMore: moreAvailable } = response.data

        setStories((prev) => (append ? [...prev, ...newStories] : newStories))
        setHasMore(moreAvailable)
        setPage(pageNum)
        setFeedType(currentFeedType)

        if (userData) {
          const likedSet = new Set(
            newStories.filter((story) => story.likes?.includes(userData._id)).map((story) => story._id)
          )
          setLikedStories((prev) => (append ? new Set([...prev, ...likedSet]) : likedSet))

          const savedSet = new Set(
            newStories.filter((story) => userData.savedEntries?.includes(story._id)).map((story) => story._id)
          )
          setSavedStories((prev) => (append ? new Set([...prev, ...savedSet]) : savedSet))
        }
      } catch (error) {
        console.error("Error fetching stories:", error)
        setError("Failed to fetch stories. Please try again.")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [feedType, showFollowingOnly]
  )

  const fetchSingleStory = useCallback(
    async (anonymousName, slug) => {
      const existingStory = stories.find(
        (story) => story.userId?.anonymousName === anonymousName && story.slug === slug
      )
      if (existingStory) {
        return existingStory
      }

      try {
        setLoading(true)
        setError(null)
        const response = await API.get(`/journals/${anonymousName}/${slug}`)
        const fetchedStory = response.data.journal

        setStories((prevStories) => {
          if (!prevStories.some((s) => s._id === fetchedStory._id)) {
            return [...prevStories, fetchedStory]
          }
          return prevStories
        })

        return fetchedStory
      } catch (error) {
        console.error("Error fetching single story:", error)
        setError("Failed to fetch story. Please try again.")
        throw error
      } finally {
        setLoading(false)
      }
    },
    [stories]
  )

  const handleLike = useCallback(
    async (story) => {
      const userData = getCurrentUser()
      if (!userData) return null

      const storyId = story._id
      const currentIsLiked = likedStories.has(storyId)

      setLikedStories((prev) => {
        const newSet = new Set(prev)
        if (currentIsLiked) {
          newSet.delete(storyId)
        } else {
          newSet.add(storyId)
        }
        return newSet
      })

      setStories((prevStories) => {
        const newStories = prevStories.map((s) => {
          if (s._id === storyId) {
            return {
              ...s,
              likeCount: s.likeCount + (currentIsLiked ? -1 : 1),
              likes: currentIsLiked
                ? (s.likes || []).filter((id) => id !== userData._id)
                : [...(s.likes || []), userData._id],
            }
          }
          return s
        })
        return newStories
      })

      try {
        const res = await API.post(`/journals/${storyId}/like`, { userId: userData._id })
        return res.data
      } catch (error) {
        setLikedStories((prev) => {
          const newSet = new Set(prev)
          if (currentIsLiked) {
            newSet.add(storyId)
          } else {
            newSet.delete(storyId)
          }
          return newSet
        })

        setStories((prevStories) =>
          prevStories.map((s) =>
            s._id === storyId ? { ...s, likeCount: story.likeCount, likes: story.likes } : s
          )
        )
        console.error("Error liking story:", error)
        throw error
      }
    },
    [likedStories]
  )

  const handleSave = useCallback(
    async (storyId) => {
      const userData = getCurrentUser()
      if (!userData) return

      const currentIsSaved = savedStories.has(storyId)

      setSavedStories((prev) => {
        const newSet = new Set(prev)
        if (currentIsSaved) {
          newSet.delete(storyId)
        } else {
          newSet.add(storyId)
        }
        return newSet
      })

      try {
        await API.post(`/journals/${storyId}/save`, { userId: userData._id })
      } catch (error) {
        setSavedStories((prev) => {
          const newSet = new Set(prev)
          if (currentIsSaved) {
            newSet.add(storyId)
          } else {
            newSet.delete(storyId)
          }
          return newSet
        })
        console.error("Error saving story:", error)
      }
    },
    [savedStories]
  )

  const handleFeedTypeChange = useCallback(
    (newFeedType) => {
      if (newFeedType !== feedType) {
        setFeedType(newFeedType)
        fetchStories(1, newFeedType, false)
      }
    },
    [feedType, fetchStories]
  )

  const toggleFollowingOnly = useCallback(() => {
    setShowFollowingOnly((prev) => !prev)
    fetchStories(1, feedType, false)
  }, [feedType, fetchStories])

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      fetchStories(page + 1, feedType, true)
    }
  }, [page, hasMore, loadingMore, feedType, fetchStories])

  const handleTagSelect = useCallback((tag) => {
    setSelectedTag(tag);
    fetchStoriesByTag(tag, 1, false);
    window.scrollTo(0, 0);
    navigate(`/stories?tag=${encodeURIComponent(tag)}`); // 👈 Push to new URL
  }, [fetchStoriesByTag, navigate]);

  const handleTagClear = useCallback(() => {
    setSelectedTag(null);
    fetchStories(1, feedType, false);
    window.scrollTo(0, 0);
    navigate(`/stories`);
  }, [fetchStories, feedType, navigate]);
  

  const resetForNewCategory = useCallback(() => {
    setStories([])
    setPage(1)
    setHasMore(true)
    setSelectedTag(null)
  }, [])

  const value = {
    stories,
    loading,
    loadingMore,
    error,
    likedStories,
    savedStories,
    hasMore,
    feedType,
    showFollowingOnly,
    fetchStories,
    fetchSingleStory,
    handleLike,
    handleSave,
    handleFeedTypeChange,
    toggleFollowingOnly,
    loadMore,
    selectedTag,
    handleTagSelect,
    setFeedType,
    setShowFollowingOnly,
    fetchStoriesByTag,
    resetForNewCategory,
    handleTagClear,
  }

  return <PublicStoriesContext.Provider value={value}>{children}</PublicStoriesContext.Provider>
}

export function usePublicStories() {
  const context = useContext(PublicStoriesContext)
  if (context === undefined) {
    throw new Error("usePublicStories must be used within a PublicStoriesProvider")
  }
  return context
}