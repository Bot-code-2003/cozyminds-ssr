"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  MoreVertical,
  Edit3,
  Trash2,
  Send,
  Loader2,
  Reply,
} from "lucide-react";
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
import { getWithExpiry } from "../../utils/anonymousName";
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

const Comments = ({ journalId, onLoginRequired }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyingToName, setReplyingToName] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDropdown, setShowDropdown] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL;

  const getCurrentUser = () => getWithExpiry("user");

  // Fetch comments
  const fetchComments = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const response = await fetch(
          `${API_BASE}/comments/${journalId}?page=${pageNum}&limit=10`
        );
        const data = await response.json();

        if (response.ok) {
          if (append) {
            setComments((prev) => [...prev, ...data.comments]);
          } else {
            setComments(data.comments);
          }
          setHasMore(data.hasMore);
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [journalId, API_BASE]
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Fetch user profiles for all unique userIds in comments/replies
  useEffect(() => {
    const uniqueUserIds = Array.from(
      new Set(
        [
          ...comments.map((c) => c.userId),
          ...comments.flatMap((c) => (c.replies || []).map((r) => r.userId)),
        ].filter(Boolean)
      )
    );
    const missingIds = uniqueUserIds.filter((id) => !userProfiles[id]);
    if (missingIds.length === 0) return;
    const fetchProfiles = async () => {
      try {
        const responses = await Promise.all(
          missingIds.map((id) => axios.get(`${API_BASE}/user/${id}`))
        );
        const newProfiles = {};
        responses.forEach((res) => {
          if (res.data && res.data.user) {
            newProfiles[res.data.user._id] = res.data.user;
          }
        });
        setUserProfiles((prev) => ({ ...prev, ...newProfiles }));
      } catch (err) {
        // Ignore errors, fallback will be used
      }
    };
    fetchProfiles();
  }, [comments, API_BASE, userProfiles]);

  // Submit new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      onLoginRequired();
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalId,
          userId: currentUser._id,
          content: newComment.trim(),
          authorName: currentUser.anonymousName || currentUser.username,
          profileTheme: currentUser.profileTheme,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId, replyToName) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      onLoginRequired();
      return;
    }

    let content = replyText.trim();
    if (!content) return;

    // Add @mention if not already included
    if (replyToName && !content.startsWith(`@${replyToName}`)) {
      content = `@${replyToName} ${content}`;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journalId,
          userId: currentUser._id,
          content,
          authorName: currentUser.anonymousName || currentUser.username,
          parentId,
          profileTheme: currentUser.profileTheme,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) => [data.comment, ...prev]);
        setReplyText("");
        setReplyingTo(null);
        setReplyingToName("");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Like comment
  const handleLikeComment = async (commentId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      onLoginRequired();
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser._id }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likeCount: data.likeCount,
                  likes: data.isLiked
                    ? [...(comment.likes || []), currentUser._id]
                    : (comment.likes || []).filter(
                        (id) => id !== currentUser._id
                      ),
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Edit comment
  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    const currentUser = getCurrentUser();
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser._id,
          content: editText.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments((prev) =>
          prev.map((comment) =>
            comment._id === commentId ? data.comment : comment
          )
        );
        setEditingComment(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const currentUser = getCurrentUser();
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser._id }),
      });

      if (response.ok) {
        setComments((prev) =>
          prev.filter(
            (comment) =>
              comment._id !== commentId && comment.parentId !== commentId
          )
        );
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Load more comments
  const handleLoadMore = () => {
    fetchComments(page + 1, true);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Get user avatar
  const getUserAvatar = (authorName) => {
    return authorName?.charAt(0).toUpperCase() || "A";
  };

  // Format comment content to highlight mentions
  const formatCommentContent = (content) => {
    if (!content) return "";

    // Replace @mentions with styled spans
    return content.replace(
      /@(\w+)/g,
      '<span class="text-blue-600 dark:text-blue-400 font-medium">@$1</span>'
    );
  };

  // Separate parent comments and replies
  const parentComments = comments.filter((comment) => !comment.parentId);
  const getReplies = (parentId) =>
    comments.filter((comment) => comment.parentId === parentId);

  // Find comment by ID
  const findCommentById = (id) =>
    comments.find((comment) => comment._id === id);

  if (loading) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            Loading comments...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="comments"
      className="border-t mb-10 border-gray-200 dark:border-gray-700"
    >
      {/* Comments Header */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h3>
      </div>

      {/* Add Comment Form */}
      <div className="">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex gap-3 mt-2 mb-2">
            <div
              className={`w-10 h-10 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
            >
              <img
                src={getAvatarSvg(
                  getCurrentUser()?.profileTheme?.avatarStyle &&
                    avatarStyles[getCurrentUser()?.profileTheme?.avatarStyle]
                    ? getCurrentUser().profileTheme.avatarStyle
                    : "avataaars",
                  getCurrentUser()?.anonymousName || getCurrentUser()?.username
                )}
                alt={
                  getCurrentUser()?.anonymousName || getCurrentUser()?.username
                }
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="flex-1 mb-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  getCurrentUser()
                    ? "Add a comment..."
                    : "Please log in to comment"
                }
                disabled={!getCurrentUser()}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              {newComment.trim() && (
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setNewComment("")}
                    className="py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Comment
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="">
        {parentComments.map((comment) => {
          const replies = getReplies(comment._id);
          const isLiked =
            getCurrentUser() && comment.likes?.includes(getCurrentUser()._id);
          const isOwner =
            getCurrentUser() && comment.userId === getCurrentUser()._id;

          return (
            <div key={comment._id} className="space-y-4">
              {/* Main Comment */}
              <div className="flex gap-3 mb-2 mt-2">
                <div
                  className={`w-10 h-10 bg-gradient-to-br  rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                >
                  <img
                    src={getAvatarSvg(
                      userProfiles[comment.userId]?.profileTheme?.avatarStyle &&
                        avatarStyles[
                          userProfiles[comment.userId]?.profileTheme
                            ?.avatarStyle
                        ]
                        ? userProfiles[comment.userId].profileTheme.avatarStyle
                        : "avataaars",
                      userProfiles[comment.userId]?.anonymousName ||
                        comment.authorName
                    )}
                    alt={comment.authorName}
                    className="w-10 h-10 rounded-full"
                  />
                </div>

                <div className="flex-1 min-w-0 mb-2">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {comment.authorName}
                          </span>
                          {/* <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span> */}
                          {comment.isEdited && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              (edited)
                            </span>
                          )}
                        </div>

                        {editingComment === comment._id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
                              rows="2"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditComment(comment._id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingComment(null);
                                  setEditText("");
                                }}
                                className="px-3 py-1 text-gray-600 dark:text-gray-400 text-xs hover:text-gray-800 dark:hover:text-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatCommentContent(comment.content),
                            }}
                          />
                        )}
                      </div>

                      {isOwner && editingComment !== comment._id && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowDropdown(
                                showDropdown === comment._id
                                  ? null
                                  : comment._id
                              )
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showDropdown === comment._id && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                              <button
                                onClick={() => {
                                  setEditingComment(comment._id);
                                  setEditText(comment.content);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Edit3 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteComment(comment._id);
                                  setShowDropdown(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 mt-2 ml-4">
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                        isLiked
                          ? "text-red-500"
                          : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`}
                      />
                      {comment.likeCount || 0}
                    </button>

                    <button
                      onClick={() => {
                        if (!getCurrentUser()) {
                          onLoginRequired();
                          return;
                        }
                        setReplyingTo(
                          replyingTo === comment._id ? null : comment._id
                        );
                        setReplyingToName(comment.authorName);
                        setReplyText("");
                      }}
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 flex items-center gap-1"
                    >
                      <Reply className="w-3 h-3" />
                      Reply
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment._id && (
                    <div className="mt-3 ml-4">
                      <div className="flex gap-2">
                        <div
                          className={`w-8 h-8 bg-gradient-to-br  rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}
                        >
                          <img
                            src={getAvatarSvg(
                              getCurrentUser()?.profileTheme?.avatarStyle &&
                                avatarStyles[
                                  getCurrentUser()?.profileTheme?.avatarStyle
                                ]
                                ? getCurrentUser().profileTheme.avatarStyle
                                : "avataaars",
                              getCurrentUser()?.anonymousName ||
                                getCurrentUser()?.username
                            )}
                            alt={
                              getCurrentUser()?.anonymousName ||
                              getCurrentUser()?.username
                            }
                            className="w-8 h-8 rounded-full"
                          />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to ${replyingToName}...`}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none"
                            rows="2"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                                setReplyingToName("");
                              }}
                              className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() =>
                                handleSubmitReply(comment._id, replyingToName)
                              }
                              disabled={!replyText.trim() || submitting}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {replies.length > 0 && (
                <div className="ml-12 pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
                  {replies.map((reply) => {
                    const isReplyLiked =
                      getCurrentUser() &&
                      reply.likes?.includes(getCurrentUser()._id);
                    const isReplyOwner =
                      getCurrentUser() && reply.userId === getCurrentUser()._id;

                    return (
                      <div key={reply._id} className="flex gap-3 mb-2 mt-2">
                        <div
                          className={`w-8 h-8 bg-gradient-to-br  rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}
                        >
                          <img
                            src={getAvatarSvg(
                              userProfiles[reply.userId]?.profileTheme
                                ?.avatarStyle &&
                                avatarStyles[
                                  userProfiles[reply.userId]?.profileTheme
                                    ?.avatarStyle
                                ]
                                ? userProfiles[reply.userId].profileTheme
                                    .avatarStyle
                                : "avataaars",
                              userProfiles[reply.userId]?.anonymousName ||
                                reply.authorName
                            )}
                            alt={reply.authorName}
                            className="w-8 h-8 rounded-full"
                          />
                        </div>

                        <div className="flex-1 min-w-0 mb-2">
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                                    {reply.authorName}
                                  </span>
                                  {/* <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(reply.createdAt)}
                                  </span> */}
                                  {reply.isEdited && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      (edited)
                                    </span>
                                  )}
                                </div>
                                <p
                                  className="text-gray-800 dark:text-gray-200 text-xs leading-relaxed"
                                  dangerouslySetInnerHTML={{
                                    __html: formatCommentContent(reply.content),
                                  }}
                                />
                              </div>

                              {isReplyOwner && (
                                <div className="relative">
                                  <button
                                    onClick={() =>
                                      setShowDropdown(
                                        showDropdown === reply._id
                                          ? null
                                          : reply._id
                                      )
                                    }
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </button>

                                  {showDropdown === reply._id && (
                                    <div className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                                      <button
                                        onClick={() => {
                                          handleDeleteComment(reply._id);
                                          setShowDropdown(null);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-1 ml-3">
                            <button
                              onClick={() => handleLikeComment(reply._id)}
                              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                                isReplyLiked
                                  ? "text-red-500"
                                  : "text-gray-500 dark:text-gray-400 hover:text-red-500"
                              }`}
                            >
                              <Heart
                                className={`w-3 h-3 ${
                                  isReplyLiked ? "fill-current" : ""
                                }`}
                              />
                              {reply.likeCount || 0}
                            </button>

                            <button
                              onClick={() => {
                                if (!getCurrentUser()) {
                                  onLoginRequired();
                                  return;
                                }
                                setReplyingTo(
                                  replyingTo === comment._id
                                    ? null
                                    : comment._id
                                );
                                setReplyingToName(reply.authorName);
                                setReplyText("");
                              }}
                              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-500 flex items-center gap-1"
                            >
                              <Reply className="w-3 h-3" />
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="p-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto font-medium"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>Load more comments</>
            )}
          </button>
        </div>
      )}

      {/* No Comments State */}
      {comments.length === 0 && (
        <div className="p-6 text-center">
          <MessageCircle className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
};

export default Comments;
