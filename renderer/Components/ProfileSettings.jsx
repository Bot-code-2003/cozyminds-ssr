import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  Check,
  X,
  User,
  Eye,
  EyeOff,
  Shield,
  BookOpen,
  Edit3,
  Plus,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Dashboard/Navbar";
import { getWithExpiry, setWithExpiry, logout } from "../utils/anonymousName";
import JournalCard, {
  JournalCardSkeleton,
} from "./PublicJournals/PublicStoryCard";
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

// Real collection objects for avatar rendering
const avatarCollections = {
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

// Friendly display names for UI
const avatarLabels = {
  avataaars: "Avataaars",
  bottts: "Bottts",
  funEmoji: "Fun Emoji",
  miniavs: "Miniavs",
  croodles: "Croodles",
  micah: "Micah",
  pixelArt: "Pixel Art",
  adventurer: "Adventurer",
  bigEars: "Big Ears",
  bigSmile: "Big Smile",
  lorelei: "Lorelei",
  openPeeps: "Open Peeps",
  personas: "Personas",
  rings: "Rings",
  shapes: "Shapes",
  thumbs: "Thumbs",
};

// Actual avatar SVG generator
const getAvatarSvg = (style, seed) => {
  const collection = avatarCollections[style] || avataaars;
  const svg = createAvatar(collection, { seed }).toString();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Helper to pick a deterministic avatar style
const getDeterministicAvatarStyle = (seed) => {
  const styles = Object.keys(avatarCollections);
  if (!seed) return styles[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return styles[Math.abs(hash) % styles.length];
};

const getDefaultProfileTheme = (anonymousName) => ({
  type: "color",
  value: "#000000",
  avatarStyle: getDeterministicAvatarStyle(anonymousName),
});

const ProfileSettings = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [form, setForm] = useState({
    nickname: "",
    email: "",
    age: "",
    gender: "",
    bio: "",
    anonymousName: "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [journals, setJournals] = useState([]);
  const [journalsLoading, setJournalsLoading] = useState(false);
  const [profileTheme, setProfileTheme] = useState(null);
  const [savedCard, setSavedCard] = useState(null);
  const [editingCard, setEditingCard] = useState(false);
  const [likedJournals, setLikedJournals] = useState(new Set());
  const [savedJournals, setSavedJournals] = useState(new Set());

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = getWithExpiry("user");
        if (!user) return navigate("/login");

        setUserData(user);
        setForm({
          nickname: user.nickname || "",
          email: user.email || "",
          age: user.age || "",
          gender: user.gender || "",
          bio: user.bio || "",
          anonymousName: user.anonymousName || "",
        });

        // Initialize profile theme from user data
        if (user.profileTheme) {
          setProfileTheme(user.profileTheme);
          setSavedCard(user.profileTheme);
        } else {
          const defaultTheme = getDefaultProfileTheme(user.anonymousName);
          setProfileTheme(defaultTheme);
          setSavedCard(defaultTheme);
        }

        // Fetch journals if on journals tab
        if (activeSection === "journals") {
          fetchJournals(user._id);
        }
      } catch (e) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, activeSection]);

  const fetchJournals = async (userId) => {
    setJournalsLoading(true);
    try {
      const response = await API.get(`/journals/${userId}`);
      const journalsData = response.data.journals || [];
      setJournals(journalsData);

      // Initialize liked and saved states
      if (userData) {
        const liked = new Set();
        const saved = new Set(userData.savedEntries || []);

        journalsData.forEach((journal) => {
          if (journal.likes && journal.likes.includes(userData._id)) {
            liked.add(journal._id);
          }
        });

        setLikedJournals(liked);
        setSavedJournals(saved);
      }
    } catch (error) {
      console.error("Failed to fetch journals:", error);
      setError("Failed to load journals");
    } finally {
      setJournalsLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...userData,
        ...form,
        age: form.age ? Number.parseInt(form.age) : null,
      };

      await API.put(`/user/${userData._id}`, updated);
      setWithExpiry("user", updated, 2 * 60 * 60 * 1000);
      setUserData(updated);
      setSuccess("Profile updated successfully");
    } catch (e) {
      setError("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (passwords.new !== passwords.confirm) {
      setSaving(false);
      return setError("Passwords do not match");
    }
    try {
      const res = await API.post("/verify-password", {
        userId: userData._id,
        password: passwords.current,
      });
      if (!res.data.valid) {
        setSaving(false);
        return setError("Incorrect current password");
      }
      await API.put(`/user/${userData._id}/password`, {
        newPassword: passwords.new,
      });
      setSuccess("Password changed successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (e) {
      setError("Password update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/user/${userData._id}`);
      logout();
      setSuccess("Account deleted successfully");
      setTimeout(() => navigate("/"), 1500);
    } catch {
      setError("Delete failed");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSaveProfileCard = async () => {
    try {
      setSaving(true);
      const updated = {
        ...userData,
        profileTheme,
      };
      await API.put(`/user/${userData._id}`, { profileTheme });
      setWithExpiry("user", updated, 2 * 60 * 60 * 1000);
      setUserData(updated);
      setSavedCard(profileTheme);
      setSuccess("Profile card updated successfully");
      setEditingCard(false);
    } catch (e) {
      setError("Failed to update profile card");
    } finally {
      setSaving(false);
    }
  };

  const handleLike = async (journal) => {
    try {
      const response = await API.post(`/journals/${journal._id}/like`, {
        userId: userData._id,
      });

      // Update the journal in the list
      setJournals((prev) =>
        prev.map((j) =>
          j._id === journal._id
            ? { ...j, likeCount: response.data.likeCount }
            : j
        )
      );

      // Update liked state
      setLikedJournals((prev) => {
        const newSet = new Set(prev);
        if (response.data.isLiked) {
          newSet.add(journal._id);
        } else {
          newSet.delete(journal._id);
        }
        return newSet;
      });
    } catch (error) {
      console.error("Error liking journal:", error);
      setError("Failed to like journal");
    }
  };

  const handleSave = async (journalId, shouldSave) => {
    try {
      await API.post(`/journals/${journalId}/save`, {
        userId: userData._id,
      });

      // Update saved state
      setSavedJournals((prev) => {
        const newSet = new Set(prev);
        if (shouldSave) {
          newSet.add(journalId);
        } else {
          newSet.delete(journalId);
        }
        return newSet;
      });

      // Update user data in localStorage
      const updatedUser = { ...userData };
      if (shouldSave) {
        updatedUser.savedEntries = [
          ...(updatedUser.savedEntries || []),
          journalId,
        ];
      } else {
        updatedUser.savedEntries = (updatedUser.savedEntries || []).filter(
          (id) => id !== journalId
        );
      }
      setWithExpiry("user", updatedUser, 2 * 60 * 60 * 1000);
      setUserData(updatedUser);
    } catch (error) {
      console.error("Error saving journal:", error);
      setError("Failed to save journal");
    }
  };

  const getBannerStyle = () => {
    if (!profileTheme) return { backgroundColor: "#000000" };
    if (profileTheme.type === "color")
      return { backgroundColor: profileTheme.value };
    if (profileTheme.type === "gradient")
      return { background: profileTheme.value };
    return { backgroundColor: "#000000" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Public Profile Card Preview
  const PublicProfileCardPreview = () => {
    if (!profileTheme) return null;

    return (
      <div className="space-y-12">
        <div className="bg-white border border-gray-100 overflow-hidden">
          {/* Cover/Header Background */}
          <div className="h-24 relative" style={getBannerStyle()} />

          <div className="px-8 pb-8">
            {/* Avatar and Basic Info */}
            <div className="flex items-end gap-6 -mt-12 relative z-10">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-sm border-2 border-white flex-shrink-0 bg-white overflow-hidden">
                <img
                  src={getAvatarSvg(
                    profileTheme.avatarStyle ||
                      userData?.profileTheme?.avatarStyle ||
                      "avataaars",
                    form.anonymousName || userData?.anonymousName || "Anonymous"
                  )}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name and Info */}
              <div className="flex-1 min-w-0 pt-2">
                <h1 className="text-2xl font-normal text-black mb-1">
                  {form.anonymousName || userData?.anonymousName || "Anonymous"}
                </h1>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    Joined{" "}
                    {new Date(
                      userData?.createdAt || new Date()
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {form.bio && (
              <div className="mt-6">
                <p className="text-gray-700 leading-relaxed text-sm">
                  {form.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Customization Controls */}
        {!editingCard ? (
          <div>
            <button
              onClick={() => {
                setSavedCard(profileTheme);
                setEditingCard(true);
              }}
              className="text-sm text-black hover:text-gray-600 transition-colors underline"
            >
              Customize profile
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-normal text-black mb-6">
                Customize Profile
              </h3>

              {/* Avatar Style Selection */}
              <div className="mb-8">
                <label className="block text-sm text-gray-600 mb-4">
                  Avatar Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(avatarCollections).map((key) => (
                    <button
                      key={key}
                      className={`px-3 py-2 text-xs transition-colors ${
                        profileTheme.avatarStyle === key
                          ? "bg-black text-white"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() =>
                        setProfileTheme({ ...profileTheme, avatarStyle: key })
                      }
                    >
                      {avatarLabels[key]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Style Selection */}
              <div className="mb-8">
                <label className="block text-sm text-gray-600 mb-4">
                  Banner
                </label>
                <div className="flex gap-3 mb-4">
                  <button
                    className={`px-4 py-2 text-sm transition-colors ${
                      profileTheme.type === "color"
                        ? "bg-black text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setProfileTheme({
                        ...profileTheme,
                        type: "color",
                        value:
                          profileTheme.type === "color"
                            ? profileTheme.value
                            : "#000000",
                      })
                    }
                  >
                    Color
                  </button>
                  <button
                    className={`px-4 py-2 text-sm transition-colors ${
                      profileTheme.type === "gradient"
                        ? "bg-black text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setProfileTheme({
                        ...profileTheme,
                        type: "gradient",
                        value:
                          profileTheme.type === "gradient"
                            ? profileTheme.value
                            : "linear-gradient(90deg, #000000 0%, #666666 100%)",
                      })
                    }
                  >
                    Gradient
                  </button>
                </div>

                {profileTheme.type === "color" && (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={profileTheme.value}
                      onChange={(e) =>
                        setProfileTheme({
                          ...profileTheme,
                          value: e.target.value,
                        })
                      }
                      className="w-8 h-8 border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={profileTheme.value}
                      onChange={(e) =>
                        setProfileTheme({
                          ...profileTheme,
                          value: e.target.value,
                        })
                      }
                      className="flex-1 px-0 py-2 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none text-sm"
                      placeholder="#000000"
                    />
                  </div>
                )}

                {profileTheme.type === "gradient" && (
                  <input
                    type="text"
                    value={profileTheme.value}
                    onChange={(e) =>
                      setProfileTheme({
                        ...profileTheme,
                        value: e.target.value,
                      })
                    }
                    className="w-full px-0 py-2 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none text-sm"
                    placeholder="linear-gradient(90deg, #000000 0%, #666666 100%)"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setProfileTheme(savedCard);
                    setEditingCard(false);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfileCard}
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-6 w-6 border border-gray-200 border-t-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-3xl font-normal text-black mb-2">Settings</h1>
          <p className="text-gray-500 text-sm">
            Manage your account and preferences
          </p>
        </div>

        {/* Alert Messages */}
        {(error || success) && (
          <div className="mb-8 p-4 bg-gray-50 border-l-2 border-black">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-800">{error || success}</span>
              <button
                onClick={() => (error ? setError(null) : setSuccess(null))}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-8 mb-12 border-b border-gray-100">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "security", label: "Security", icon: Shield },
            { id: "publicProfile", label: "Public Profile", icon: Users },
            { id: "journals", label: "Journals", icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 pb-4 border-b-2 transition-colors text-sm ${
                activeSection === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-black"
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="space-y-8">
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Display Name
                </label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) =>
                    setForm({ ...form, nickname: e.target.value })
                  }
                  className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Anonymous Name
                </label>
                <input
                  type="text"
                  value={form.anonymousName}
                  onChange={(e) =>
                    setForm({ ...form, anonymousName: e.target.value })
                  }
                  className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none"
                  placeholder="Enter your anonymous name"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none resize-none"
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                    Age
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8">
                <button
                  onClick={() =>
                    setForm({
                      nickname: userData?.nickname || "",
                      email: userData?.email || "",
                      age: userData?.age || "",
                      gender: userData?.gender || "",
                      bio: userData?.bio || "",
                      anonymousName: userData?.anonymousName || "",
                    })
                  }
                  className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="space-y-8">
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current: e.target.value })
                    }
                    className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    className="w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-black focus:border-black focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-8">
                <button
                  onClick={() =>
                    setPasswords({ current: "", new: "", confirm: "" })
                  }
                  className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePwdChange}
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                >
                  {saving ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          )}

          {/* Public Profile Section */}
          {activeSection === "publicProfile" && <PublicProfileCardPreview />}

          {/* Journals Section */}
          {activeSection === "journals" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-normal text-black mb-1">
                    Your Journals
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {journals.length}{" "}
                    {journals.length === 1 ? "entry" : "entries"}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/journaling-alt")}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm"
                >
                  <Plus size={14} />
                  New Journal
                </button>
              </div>

              {journalsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-full space-y-0">
                    {[...Array(3)].map((_, i) => (
                      <JournalCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : journals.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen size={32} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-normal text-black mb-2">
                    No journals yet
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm">
                    Start writing your first journal entry
                  </p>
                  <button
                    onClick={() => navigate("/dashboard/create")}
                    className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm"
                  >
                    Create Your First Journal
                  </button>
                </div>
              ) : (
                <div className="space-y-0">
                  {journals.map((journal) => (
                    <JournalCard
                      key={journal._id}
                      journal={journal}
                      onLike={handleLike}
                      isLiked={likedJournals.has(journal._id)}
                      isSaved={savedJournals.has(journal._id)}
                      onSave={handleSave}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="mt-20 pt-8 border-t border-gray-100">
          <h3 className="text-sm font-normal text-black mb-2">
            Delete Account
          </h3>
          <p className="text-gray-500 mb-4 text-xs">
            This action cannot be undone. All your journals and data will be
            permanently deleted.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 transition-colors text-xs"
          >
            <Trash2 size={12} />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-sm w-full mx-4 border border-gray-100">
            <h3 className="text-lg font-normal text-black mb-4">
              Delete Account
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
