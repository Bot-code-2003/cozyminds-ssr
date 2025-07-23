import React, { useState } from 'react';

const JOURNAL_TAGS = [
  'Life', 'Relationships', 'Career', 'Health & Wellness', 'Travel',
  'Personal Growth', 'Reflections', 'Gratitude', 'Family', 'Dreams',
];
const STORY_TAGS = [
  'Fantasy', 'Science Fiction', 'Horror', 'Mystery', 'Historical',
  'Romance', 'Adventure', 'Drama', 'Thriller', 'Comedy',
];

export default function Final({
  thumbnail,
  tags,
  collection,
  onCollectionChange,
  onTagToggle,
  onThumbnailUpload,
  onPublish,
  selectedType,
  onBack,
  content,
  setType,
  setThumbnail,
  setMetaDescription: setMetaDescriptionProp,
}) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageLink, setImageLink] = useState('');
  const [metaDescription, setMetaDescription] = useState("");

  // Extract first image from content if no thumbnail
  const getFirstImage = (content) => {
    if (!content) return null;
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const img = tempDiv.querySelector('img');
      return img ? img.src : null;
    } catch {
      return null;
    }
  };

  const allTags = selectedType === 'story' ? STORY_TAGS : JOURNAL_TAGS;
  const displayThumbnail = thumbnail || getFirstImage(content);

  // Handle image link input
  const handleImageLinkSubmit = (e) => {
    e.preventDefault();
    if (imageLink.trim()) {
      setThumbnail(imageLink.trim());
      setShowLinkInput(false);
      setImageLink('');
    }
  };

  // Handle Imgur upload
  const handleImgurUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: 'Client-ID 137e1e6e7e1b1e7', // Demo client ID, replace with your own for production
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data.link) {
        setThumbnail(data.data.link);
      } else {
        alert('Failed to upload image to Imgur.');
      }
    } catch {
      alert('Failed to upload image to Imgur.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8">
      {/* Back Button */}
      <button
        className="mb-8 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium"
        onClick={onBack}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column - Thumbnail */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cover Image</h3>
            <div className="w-full aspect-[16/10] bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
              {displayThumbnail ? (
                <img src={displayThumbnail} alt="Cover" className="object-cover w-full h-full" />
              ) : (
                <div className="text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No cover image</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Options */}
          <div className="space-y-4">
            <button
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowLinkInput(!showLinkInput)}
            >
              {showLinkInput ? 'Cancel' : 'Add Image from URL'}
            </button>

            {showLinkInput && (
              <div className="space-y-3">
                <input
                  type="url"
                  placeholder="Paste image URL here..."
                  value={imageLink}
                  onChange={e => setImageLink(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (imageLink.trim()) {
                        setThumbnail(imageLink.trim());
                        setShowLinkInput(false);
                        setImageLink('');
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (imageLink.trim()) {
                      setThumbnail(imageLink.trim());
                      setShowLinkInput(false);
                      setImageLink('');
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Set Cover Image
                </button>
              </div>
            )}

            {/* Upload Options */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Free image sites</p>
              <div className="flex gap-3">
                <a 
                  href="https://unsplash.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                >
                  Unsplash
                </a>
                <a 
                  href="https://www.pexels.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                >
                  Pexels
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tags and Collections */}
        <div className="space-y-8">
          {/* Type Toggle */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Content Type</h3>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <label className="flex-1">
                <input
                  type="radio"
                  name="contentType"
                  value="journal"
                  checked={selectedType === 'journal'}
                  onChange={() => setType('journal')}
                  className="hidden"
                />
                <span className={`block w-full px-4 py-2 rounded-md text-sm font-medium text-center cursor-pointer transition-all ${
                  selectedType === 'journal'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}>
                  Journal
                </span>
              </label>
              <label className="flex-1">
                <input
                  type="radio"
                  name="contentType"
                  value="story"
                  checked={selectedType === 'story'}
                  onChange={() => setType('story')}
                  className="hidden"
                />
                <span className={`block w-full px-4 py-2 rounded-md text-sm font-medium text-center cursor-pointer transition-all ${
                  selectedType === 'story'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}>
                  Story
                </span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    tags.includes(tag)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => onTagToggle(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Collection</label>
            <input
              type="text"
              value={collection}
              onChange={onCollectionChange}
              placeholder="Add to collection..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Group your content with others in a collection
            </p>
          </div>

          {/* Meta Description for Story */}
          {selectedType === 'story' && (
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Meta Description <span className="text-gray-400 text-sm">(Optional, for SEO)</span></label>
              <textarea
                value={metaDescription}
                onChange={e => {
                  setMetaDescription(e.target.value);
                  if (typeof window !== 'undefined' && typeof setMetaDescriptionProp === 'function') setMetaDescriptionProp(e.target.value);
                }}
                placeholder="Write a short description for search engines..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[60px]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Recommended: 140-160 characters</p>
            </div>
          )}

          {/* Publish Buttons */}
          <div className="space-y-3 pt-4">
            <button
              className="w-full px-6 py-3 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              onClick={() => onPublish(false)}
            >
              Save as Draft
            </button>
            <button
              className="w-full px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              onClick={() => onPublish(true)}
            >
              Publish Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}