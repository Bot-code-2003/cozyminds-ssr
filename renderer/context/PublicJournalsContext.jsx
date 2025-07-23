"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"
import { useSearchParams } from "react-router-dom"; // Add this at top if not yet



const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000" })

const PublicJournalsContext = createContext()

export function PublicJournalsProvider({ children }) {
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [likedJournals, setLikedJournals] = useState(new Set())
  const [savedJournals, setSavedJournals] = useState(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [feedType, setFeedType] = useState("-createdAt")
  const [showFollowingOnly, setShowFollowingOnly] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [currentCategory, setCurrentCategory] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams();

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

  const fetchJournalsByTag = useCallback(
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
        }

        if (currentCategory) {
          params.category = currentCategory
        }

        const response = await API.get(`/journals/by-tag/${encodeURIComponent(tag)}`, { params })
        const { journals: newJournals, hasMore: moreAvailable } = response.data

        setJournals((prev) => (append ? [...prev, ...newJournals] : newJournals))
        setHasMore(moreAvailable)
        setPage(pageNum)

        const userData = getCurrentUser()
        if (userData) {
          const likedSet = new Set(
            newJournals.filter((journal) => journal.likes?.includes(userData._id)).map((journal) => journal._id)
          )
          setLikedJournals((prev) => (append ? new Set([...prev, ...likedSet]) : likedSet))

          const savedSet = new Set(
            newJournals.filter((journal) => userData.savedEntries?.includes(journal._id)).map((journal) => journal._id)
          )
          setSavedJournals((prev) => (append ? new Set([...prev, ...savedSet]) : savedSet))
        }
      } catch (error) {
        console.error("Error fetching journals by tag:", error)
        setError("Failed to fetch journals for this tag. Please try again.")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [feedType, currentCategory]
  )

  const fetchJournals = useCallback(
    async (pageNum = 1, currentFeedType = feedType, append = false, category = null) => {
      try {
        if (category !== null && category !== currentCategory) {
          setCurrentCategory(category)
          setJournals([])
          setPage(1)
          setHasMore(true)
          setSelectedTag(null)
        }

        setLoading(!append)
        setLoadingMore(append)
        setError(null)

        const userData = getCurrentUser()
        const params = {
          page: pageNum,
          limit: 20,
          sort: currentFeedType,
        }

        if (category) {
          params.category = category
        } else if (currentCategory) {
          params.category = currentCategory
        }

        let response
        if (showFollowingOnly && userData) {
          response = await API.get(`/feed/${userData._id}`, { params })
        } else {
          response = await API.get("/journals/public", { params })
        }

        const { journals: newJournals, hasMore: moreAvailable } = response.data

        setJournals((prev) => (append ? [...prev, ...newJournals] : newJournals))
        setHasMore(moreAvailable)
        setPage(pageNum)
        setFeedType(currentFeedType)

        if (userData) {
          const likedSet = new Set(
            newJournals.filter((journal) => journal.likes?.includes(userData._id)).map((journal) => journal._id)
          )
          setLikedJournals((prev) => (append ? new Set([...prev, ...likedSet]) : likedSet))

          const savedSet = new Set(
            newJournals.filter((journal) => userData.savedEntries?.includes(journal._id)).map((journal) => journal._id)
          )
          setSavedJournals((prev) => (append ? new Set([...prev, ...savedSet]) : savedSet))
        }
      } catch (error) {
        console.error("Error fetching journals:", error)
        setError("Failed to fetch journals. Please try again.")
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [feedType, showFollowingOnly, currentCategory]
  )

  const fetchSingleJournal = useCallback(
    async (anonymousName, slug) => {
      const existingJournal = journals.find(
        (journal) => journal.userId?.anonymousName === anonymousName && journal.slug === slug
      )
      if (existingJournal) {
        return existingJournal
      }

      try {
        setLoading(true)
        setError(null)
        const response = await API.get(`/journals/${anonymousName}/${slug}`)
        const fetchedJournal = response.data.journal

        setJournals((prevJournals) => {
          if (!prevJournals.some((j) => j._id === fetchedJournal._id)) {
            return [...prevJournals, fetchedJournal]
          }
          return prevJournals
        })

        return fetchedJournal
      } catch (error) {
        console.error("Error fetching single journal:", error)
        setError("Failed to fetch journal. Please try again.")
        throw error
      } finally {
        setLoading(false)
      }
    },
    [journals]
  )

  const handleLike = useCallback(
    async (journal) => {
      const userData = getCurrentUser()
      if (!userData) return null

      const journalId = journal._id
      const currentIsLiked = likedJournals.has(journalId)

      setLikedJournals((prev) => {
        const newSet = new Set(prev)
        if (currentIsLiked) {
          newSet.delete(journalId)
        } else {
          newSet.add(journalId)
        }
        return newSet
      })

      setJournals((prevJournals) => {
        const newJournals = prevJournals.map((j) => {
          if (j._id === journalId) {
            return {
              ...j,
              likeCount: j.likeCount + (currentIsLiked ? -1 : 1),
              likes: currentIsLiked
                ? (j.likes || []).filter((id) => id !== userData._id)
                : [...(j.likes || []), userData._id],
            }
          }
          return j
        })
        return newJournals
      })

      try {
        const res = await API.post(`/journals/${journalId}/like`, { userId: userData._id })
        return res.data
      } catch (error) {
        setLikedJournals((prev) => {
          const newSet = new Set(prev)
          if (currentIsLiked) {
            newSet.add(journalId)
          } else {
            newSet.delete(journalId)
          }
          return newSet
        })

        setJournals((prevJournals) =>
          prevJournals.map((j) =>
            j._id === journalId ? { ...j, likeCount: journal.likeCount, likes: journal.likes } : j
          )
        )
        console.error("Error liking journal:", error)
        throw error
      }
    },
    [likedJournals]
  )

  const handleSave = useCallback(
    async (journalId) => {
      const userData = getCurrentUser()
      if (!userData) return

      const currentIsSaved = savedJournals.has(journalId)

      setSavedJournals((prev) => {
        const newSet = new Set(prev)
        if (currentIsSaved) {
          newSet.delete(journalId)
        } else {
          newSet.add(journalId)
        }
        return newSet
      })

      try {
        await API.post(`/journals/${journalId}/save`, { userId: userData._id })
      } catch (error) {
        setSavedJournals((prev) => {
          const newSet = new Set(prev)
          if (currentIsSaved) {
            newSet.add(journalId)
          } else {
            newSet.delete(journalId)
          }
          return newSet
        })
        console.error("Error saving journal:", error)
      }
    },
    [savedJournals]
  )

  const handleFeedTypeChange = useCallback(
    (newFeedType) => {
      if (newFeedType !== feedType) {
        setFeedType(newFeedType)
        fetchJournals(1, newFeedType, false, currentCategory)
      }
    },
    [feedType, fetchJournals, currentCategory]
  )

  const toggleFollowingOnly = useCallback(() => {
    setShowFollowingOnly((prev) => !prev)
    fetchJournals(1, feedType, false, currentCategory)
  }, [feedType, fetchJournals, currentCategory])

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      if (selectedTag) {
        fetchJournalsByTag(selectedTag, page + 1, true)
      } else {
        fetchJournals(page + 1, feedType, true, currentCategory)
      }
    }
  }, [page, hasMore, loadingMore, feedType, fetchJournals, selectedTag, fetchJournalsByTag, currentCategory])

  const handleTagSelect = useCallback((tag) => {
    setSelectedTag(tag);
    fetchJournalsByTag(tag, 1, false);
    window.scrollTo(0, 0);
    navigate(`/journals?tag=${encodeURIComponent(tag)}`); // 👈 Push to new URL
  }, [fetchJournalsByTag, navigate]);

  const handleTagClear = useCallback(() => {
    setSelectedTag(null);
    fetchJournals(1, feedType, false);
    window.scrollTo(0, 0);
    navigate(`/journals`);
  }, [fetchJournals, feedType, navigate]);

  const resetForNewCategory = useCallback((newCategory) => {
    setJournals([])
    setPage(1)
    setHasMore(true)
    setSelectedTag(null)
    setCurrentCategory(newCategory)
  }, [])

  useEffect(() => {
    const tagFromURL = searchParams.get("tag");
  
    if (tagFromURL && tagFromURL !== selectedTag) {
      fetchJournalsByTag(tagFromURL, 1, false);
    }
  
    if (!tagFromURL && selectedTag) {
      fetchJournals(1, feedType, false);
    }
  }, [searchParams, selectedTag, fetchJournalsByTag, fetchJournals, feedType]);
  

  const value = {
    journals,
    loading,
    loadingMore,
    error,
    likedJournals,
    savedJournals,
    hasMore,
    feedType,
    showFollowingOnly,
    currentCategory,
    fetchJournals,
    fetchSingleJournal,
    handleLike,
    handleSave,
    handleFeedTypeChange,
    toggleFollowingOnly,
    loadMore,
    selectedTag,
    handleTagSelect,
    setFeedType,
    setShowFollowingOnly,
    fetchJournalsByTag,
    resetForNewCategory,
    handleTagClear,
  }

  return <PublicJournalsContext.Provider value={value}>{children}</PublicJournalsContext.Provider>
}

export function usePublicJournals() {
  const context = useContext(PublicJournalsContext)
  if (context === undefined) {
    throw new Error("usePublicJournals must be used within a PublicJournalsProvider")
  }
  return context
}