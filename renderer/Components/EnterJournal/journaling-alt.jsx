import { useState } from 'react';
import JournalEditor from './JournalEditor';
import Final from './final';
import axios from 'axios';
import { getWithExpiry } from '../../utils/anonymousName';
import Navbar from '../Dashboard/Navbar';

const JOURNAL_TAGS = [
  'Life', 'Relationships', 'Career', 'Health & Wellness', 'Travel',
  'Personal Growth', 'Reflections', 'Gratitude', 'Family', 'Dreams',
];
const STORY_TAGS = [
  'Fantasy', 'Science Fiction', 'Horror', 'Mystery', 'Historical',
  'Romance', 'Adventure', 'Drama', 'Thriller', 'Comedy',
];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = axios.create({ baseURL: API_BASE_URL });

export default function JournalingAlt() {
  const [type, setType] = useState('journal');
  const [selectedTags, setSelectedTags] = useState([]);
  const [collection, setCollection] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [journalTitle, setJournalTitle] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Extract first image from editor content
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

  const handleEditorChange = (content) => {
    setEditorContent(content);
    if (!thumbnail) {
      const firstImg = getFirstImage(content);
      if (firstImg) setThumbnail(firstImg);
    }
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setThumbnail(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePublish = async (isPublic) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      // Use getWithExpiry to get user
      const user = getWithExpiry('user');
      const userId = user?._id;
      const authorName = user?.anonymousName || user?.nickname || undefined;
      if (!userId) throw new Error("User not found");
      const payload = {
        userId,
        title: journalTitle,
        content: editorContent,
        tags: selectedTags,
        collections: [collection || "All"],
        theme: null,
        isPublic,
        authorName: isPublic ? authorName : undefined,
        thumbnail,
        category: type,
      };
      if (type === 'story' && metaDescription) {
        payload.metaDescription = metaDescription;
      }
      const res = await API.post("/saveJournal", payload);
      setSuccess(true);
      // Optionally redirect or reset state here
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  const tags = type === 'journal' ? JOURNAL_TAGS : STORY_TAGS;

  if (step === 1) {
    return (
      <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafbfc] dark:bg-[#181a1b] p-4">
        <div className="w-full max-w-4xl rounded-2xl ">
          <JournalEditor
            journalTitle={journalTitle}
            setJournalTitle={setJournalTitle}
            journalText={editorContent}
            setJournalText={setEditorContent}
            showDraftRestore={false}
            thumbnail={thumbnail}
          />
          <div className="flex justify-end">
            <button
              className="px-6 py-2 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-all"
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Step 2: Final
  return (
    <>
      <Navbar />
      <Final
        thumbnail={thumbnail}
        tags={selectedTags}
        collection={collection}
        onCollectionChange={e => setCollection(e.target.value)}
        onTagToggle={handleTagToggle}
        onThumbnailUpload={handleThumbnailUpload}
        onPublish={handlePublish}
        selectedType={type}
        onBack={() => setStep(1)}
        content={editorContent}
        setType={setType}
        setThumbnail={setThumbnail}
        setMetaDescription={setMetaDescription}
        metaDescription={metaDescription}
      />
      {loading && <div className="text-center mt-4 text-sm text-gray-500">Publishing...</div>}
      {success && <div className="text-center mt-4 text-green-600 font-semibold">Published successfully!</div>}
      {error && <div className="text-center mt-4 text-red-600 font-semibold">{error}</div>}
    </>
  );
} 