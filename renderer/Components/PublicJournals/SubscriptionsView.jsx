"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Calendar,
  Flame,
  BookOpen,
  Loader2,
  AlertCircle,
  Bell,
  UserPlus,
  Check,
  BellOff,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../Dashboard/Navbar";
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

const SubscriptionsView = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useDarkMode();

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

  const currentUser = useMemo(() => getCurrentUser(), []);

  const isLoggedIn = !!currentUser;

  const { modals, openLoginModal, openSignupModal } = AuthModals({ darkMode });

  const fetchSubscriptions = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await API.get(`/subscriptions/${currentUser._id}`);
      setSubscriptions(response.data.subscriptions || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const markNotificationsAsChecked = useCallback(async () => {
    if (!currentUser) return;

    try {
      await API.post(`/notifications/mark-checked/${currentUser._id}`);
      setSubscriptions((prev) =>
        prev.map((sub) => ({
          ...sub,
          hasNewContent: false,
          newJournalsCount: 0,
        }))
      );
    } catch (error) {
      console.error("Error marking notifications as checked:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const hasNotifications = subscriptions.some((sub) => sub.hasNewContent);

  const handleBack = () => {
    navigate("/public-journals");
  };

  if (loading) {
    return (
      <>
        <Navbar name="New Entry" link="/journaling-alt" />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">
              Loading your subscriptions...
            </span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar name="New Entry" link="/journaling-alt" />

        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-apple shadow-lg border border-gray-200 dark:border-gray-700 max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchSubscriptions}
              className="px-6 py-2 bg-blue-500 text-white rounded-apple hover:bg-blue-600 transition-colors min-h-10"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar name="New Entry" link="/journaling-alt" />

      <div className="min-h-screen bg-[var(--bg-primary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 sticky top-0 bg-[var(--bg-primary)] z-10 pt-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium mb-4 transition-colors"
              aria-label="Back to journals"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Journals
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Following
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Writers you follow • {subscriptions.length}{" "}
                  {subscriptions.length === 1
                    ? "subscription"
                    : "subscriptions"}
                </p>
              </div>

              {hasNotifications && (
                <button
                  onClick={markNotificationsAsChecked}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-apple hover:bg-blue-600 transition-colors min-h-10"
                  aria-label="Mark all notifications as read"
                >
                  <Bell className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-apple flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <UserPlus size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                No subscriptions yet
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4 sm:mb-6">
                Start following writers to see their profiles here and get
                notified when they publish new journals.
              </p>
              <button
                onClick={handleBack}
                className="px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-apple hover:bg-blue-600 transition-colors font-medium min-h-12"
              >
                Discover Writers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {subscriptions.map((subscription) => (
                <Link
                  key={subscription._id}
                  to={`/profile/${subscription.anonymousName}`}
                  className="group bg-white dark:bg-slate-800 rounded-apple p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 min-h-12 active:scale-[0.98]"
                  aria-label={`View ${subscription.anonymousName}'s profile`}
                >
                  {/* Notification indicator */}
                  {subscription.hasNewContent && (
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-500 font-medium">
                        {subscription.newJournalsCount} new{" "}
                        {subscription.newJournalsCount === 1 ? "post" : "posts"}
                      </span>
                    </div>
                  )}

                  {/* Avatar and basic info */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="relative">
                      <img
                        src={getAvatarSvg(
                          subscription.profileTheme?.avatarStyle || "avataaars",
                          subscription.anonymousName
                        )}
                        alt={subscription.anonymousName}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-apple shadow-lg group-hover:scale-105 transition-transform"
                        draggable="false"
                      />
                      {subscription.hasNewContent && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-apple flex items-center justify-center shadow-sm">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-apple" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {subscription.anonymousName}
                      </h3>
                      {subscription.bio && (
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-3">
                          {subscription.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        {subscription.subscriberCount || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Followers
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                        <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        {subscription.currentStreak || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Streak
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                        <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        {subscription.totalJournals || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Posts
                      </p>
                    </div>
                  </div>

                  {/* Join date */}
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-xs mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>
                      Joined{" "}
                      {new Date(subscription.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                        }
                      )}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Write FAB (Mobile) */}
          {isLoggedIn && (
            <Link
              to="/journaling-alt"
              className="sm:hidden fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all"
              aria-label="Write a new journal"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">Write</span>
            </Link>
          )}
        </div>
        {modals}
      </div>
    </>
  );
};

export default SubscriptionsView;
