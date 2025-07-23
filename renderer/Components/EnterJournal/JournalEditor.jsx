"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  ArrowRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  Quote,
  Undo,
  Redo,
  Type,
  X,
  AlertCircle,
  Lightbulb,
  Check,
  Sparkles,
} from "lucide-react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import "../styles/JournalContent.css";

// Enhanced Full-Width Image Extension
const FullWidthImageExtension = ImageExtension.extend({
  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      const container = document.createElement("div");
      container.className = "full-width-image-container";
      container.style.cssText = `
        position: relative;
        display: block;
        width: 100%;
        margin: 2rem 0;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: var(--shadow-md);
        border: 1px solid var(--border-light);
        background: transparent;
        transition: all 0.2s ease;
      `;

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      img.style.cssText = `
        width: 100%;
        max-width: 100%;
        height: auto;
        display: block;
        margin: 2.5rem auto;
        border-radius: 12px;
        background: transparent;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      `;

      img.onerror = () => {
        container.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: var(--text-secondary);
            text-align: center;
            min-height: 200px;
            background: var(--bg-tertiary);
          ">
            <div style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.6;">📷</div>
            <div style="font-size: 0.875rem; font-weight: 500;">Image failed to load</div>
            <div style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.7;">Please check the URL and try again</div>
          </div>
        `;
      };

      container.appendChild(img);

      return {
        dom: container,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "image") return false;
          try {
            img.src = updatedNode.attrs.src;
            img.alt = updatedNode.attrs.alt || "";
            return true;
          } catch (error) {
            console.error("Error updating image node:", error);
            return false;
          }
        },
      };
    };
  },
});

const JournalEditor = ({
  journalTitle,
  setJournalTitle,
  journalText,
  setJournalText,
  wordCount,
  onNext,
  thumbnail, // add thumbnail prop
}) => {
  const titleRef = useRef(null);
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validate URL helper
  const isValidUrl = useCallback((string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, []);

  // Validate image URL
  const validateImageUrl = useCallback(
    (url) => {
      if (!url.trim()) return "Please enter an image URL";
      if (!isValidUrl(url)) return "Please enter a valid URL";

      // const imageExtensions = [
      //   ".jpg",
      //   ".jpeg",
      //   ".png",
      //   ".gif",
      //   ".webp",
      //   ".svg",
      //   ".bmp",
      // ];
      // const hasImageExtension = imageExtensions.some((ext) =>
      //   url.toLowerCase().includes(ext)
      // );

      // if (!hasImageExtension) {
      //   return "URL should point to an image file";
      // }

      return null;
    },
    [isValidUrl]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            class: "editor-paragraph",
          },
        },
      }),
      UnderlineExtension,
      CharacterCount.configure({
        limit: null,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      LinkExtension.configure({
        openOnClick: false,
        linkOnPaste: true,
        autolink: true,
        protocols: ["http", "https"],
        validate: (href) => /^https?:\/\//.test(href),
      }),
      FullWidthImageExtension.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "full-width-image",
        },
      }),
      Placeholder.configure({
        placeholder: "Start journaling here...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: journalText || "",
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML();
        setJournalText(html);
      } catch (error) {
        console.error("Error updating journal text:", error);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[300px]",
      },
    },
  });

  // Focus title on mount
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update editor content when journalText changes externally
  useEffect(() => {
    if (editor && journalText !== editor.getHTML()) {
      try {
        editor.commands.setContent(journalText || "");
      } catch (error) {
        console.error("Error setting editor content:", error);
      }
    }
  }, [editor, journalText]);

  const setLink = useCallback(() => {
    if (!editor) return;

    try {
      if (linkUrl.trim()) {
        const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
        if (isValidUrl(url)) {
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        } else {
          alert("Please enter a valid URL");
          return;
        }
      } else {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
      }

      setIsLinkMenuOpen(false);
      setLinkUrl("");
    } catch (error) {
      console.error("Error setting link:", error);
      alert("Failed to add link. Please try again.");
    }
  }, [editor, linkUrl, isValidUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    try {
      editor.chain().focus().unsetLink().run();
      setIsLinkMenuOpen(false);
    } catch (error) {
      console.error("Error removing link:", error);
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;

    const validationError = validateImageUrl(imageUrl);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    setIsLoading(true);
    setImageError("");

    try {
      editor
        .chain()
        .focus()
        .setImage({
          src: imageUrl,
        })
        .run();

      setTimeout(() => {
        editor.chain().focus().createParagraphNear().focus().run();
      }, 100);

      setIsImageMenuOpen(false);
      setImageUrl("");
      setImageError("");
    } catch (error) {
      console.error("Error adding image:", error);
      setImageError("Failed to add image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [editor, imageUrl, validateImageUrl]);

  const handleOpenLinkMenu = () => {
    setIsLinkMenuOpen((prev) => {
      if (!prev) setIsImageMenuOpen(false);
      return !prev;
    });
  };
  const handleOpenImageMenu = () => {
    setIsImageMenuOpen((prev) => {
      if (!prev) setIsLinkMenuOpen(false);
      return !prev;
    });
  };

  const ToolbarButton = ({ onClick, active, disabled, children, title }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={title}
      className={`
        relative p-2 rounded-lg transition-all duration-200 
        ${active
          ? "bg-[var(--accent)] text-white shadow-sm"
          : "text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[var(--accent)] dark:hover:text-white"
        } 
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
        group
      `}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 mx-1 bg-gray-200 dark:bg-gray-700" />
  );

  if (!editor) {
    return (
      <div className=" bg-gray-50 dark:bg-gray-900 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-apple-lg border border-gray-200 dark:border-gray-700 p-8 shadow-apple">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4"></div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get word and character counts safely
  const characterCount = editor.storage.characterCount || {};
  const words = characterCount.words ? characterCount.words() : 0;
  const characters = characterCount.characters ? characterCount.characters() : 0;
  const hasContent = journalTitle.trim() || !editor.isEmpty;

  return (
    <div className="journal-editor-container">
      {thumbnail && (
        <div className="mb-4 flex justify-center">
          <img src={thumbnail} alt="Journal thumbnail" className="max-h-64 rounded-xl shadow-md object-cover" />
        </div>
      )}
      <div className="mx-auto space-y-6">
        {/* Header */}
      

        {/* Main Editor Card */}
        <div className=" overflow-hidden">
          {/* Toolbar */}
          <div className="border-[var(--border)] px-2 py-2 sm:px-4 sm:py-4">
            <div className="flex flex-wrap items-center gap-2">
              {/* Text Formatting Group */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  active={editor.isActive("bold")}
                  title="Bold (⌘B)"
                >
                  <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  active={editor.isActive("italic")}
                  title="Italic (⌘I)"
                >
                  <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  active={editor.isActive("underline")}
                  title="Underline (⌘U)"
                >
                  <Underline size={16} />
                </ToolbarButton>
              </div>

              {/* Headings Group */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  active={editor.isActive("heading", { level: 1 })}
                  title="Heading 1"
                >
                  <Heading1 size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  active={editor.isActive("heading", { level: 2 })}
                  title="Heading 2"
                >
                  <Heading2 size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  active={editor.isActive("heading", { level: 3 })}
                  title="Heading 3"
                >
                  <Heading3 size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  active={editor.isActive("paragraph")}
                  title="Paragraph"
                >
                  <Type size={16} />
                </ToolbarButton>
              </div>

              {/* Lists Group */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  active={editor.isActive("bulletList")}
                  title="Bullet List"
                >
                  <List size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  active={editor.isActive("orderedList")}
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  active={editor.isActive("blockquote")}
                  title="Quote"
                >
                  <Quote size={16} />
                </ToolbarButton>
              </div>

              {/* Media Group */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <ToolbarButton
                  onClick={handleOpenLinkMenu}
                  active={editor.isActive("link") || isLinkMenuOpen}
                  title="Add Link"
                >
                  <LinkIcon size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={handleOpenImageMenu}
                  active={isImageMenuOpen}
                  title="Add Image"
                >
                  <ImageIcon size={16} />
                </ToolbarButton>
              </div>

              {/* History Group */}
              <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <ToolbarButton
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  title="Undo (⌘Z)"
                >
                  <Undo size={16} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  title="Redo (⌘⇧Z)"
                >
                  <Redo size={16} />
                </ToolbarButton>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <input
              ref={titleRef}
              type="text"
              value={journalTitle}
              onChange={(e) => setJournalTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="w-full text-3xl font-bold bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              maxLength={200}
            />
          </div>

          {/* Link Menu */}
          {isLinkMenuOpen && (
            <div className="px-6 py-4 border-b border-[var(--border)] bg-blue-50 dark:bg-blue-900/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL (e.g., https://example.com)"
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setLink();
                    } else if (e.key === "Escape") {
                      setIsLinkMenuOpen(false);
                      setLinkUrl("");
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={setLink}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Link
                  </button>
                  {editor.isActive("link") && (
                    <button
                      onClick={removeLink}
                      className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsLinkMenuOpen(false);
                      setLinkUrl("");
                    }}
                    className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

{isImageMenuOpen && (
  <div className="p-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
    <div className="space-y-3">
      {/* Input and Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setImageError("");
          }}
          placeholder="Enter image URL"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-600"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addImage();
            } else if (e.key === "Escape") {
              setIsImageMenuOpen(false);
              setImageUrl("");
              setImageError("");
            }
          }}
        />
        <div className="flex gap-2">
          <button
            onClick={addImage}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-200 dark:text-gray-900 rounded-md hover:bg-gray-700 dark:hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Adding..." : "Add Image"}
          </button>
          <button
            onClick={() => {
              setIsImageMenuOpen(false);
              setImageUrl("");
              setImageError("");
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {imageError && (
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{imageError}</span>
        </div>
      )}

      {/* Image Resources */}
      <div className="text-sm text-gray-900 dark:text-white">
        <p>
          Free Stock Photos: 
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Unsplash
          </a>
          , 
          <a
            href="https://www.pexels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Pexels
          </a>
        </p>
        <p>
          Upload Your Own: 
          <a
            href="https://imgur.com/upload"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Imgur
          </a>
        </p>
      </div>
    </div>
  </div>
)}

          {/* Editor Content */}
          <div className="journal-content">
            <EditorContent
              editor={editor}
              className="min-h-[500px] sm:min-h-[400px] px-6 py-6 text-gray-900 dark:text-gray-100 leading-relaxed focus-within:outline-none"
            />

            {/* Bubble Menu */}
            {editor && (
              <BubbleMenu
                editor={editor}
                tippyOptions={{
                  duration: 100,
                  placement: "top",
                }}
                className="flex items-center gap-1 p-2 rounded-lg shadow-lg bg-gray-900 dark:bg-gray-700 border border-gray-700 dark:border-gray-600"
              >
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBold().run();
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive("bold")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-600"
                  }`}
                  title="Bold"
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleItalic().run();
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive("italic")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-600"
                  }`}
                  title="Italic"
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleUnderline().run();
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive("underline")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-600"
                  }`}
                  title="Underline"
                >
                  <Underline size={14} />
                </button>
                <div className="w-px h-6 mx-1 bg-gray-600" />
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsLinkMenuOpen(true);
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    editor.isActive("link")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-600"
                  }`}
                  title="Add Link"
                >
                  <LinkIcon size={14} />
                </button>
              </BubbleMenu>
            )}
          </div>

          {/* Footer */}
<div className="w-full border-t border-[var(--border)] px-4 sm:px-6 py-4">
  <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {words} words • {characters} characters
      </div>
    </div>
  </div>
</div>

        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .journal-editor-content .ProseMirror {
          outline: none;
          font-size: 1.125rem;
          line-height: 1.8;
        }

        .journal-editor-content .ProseMirror.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #b0b6be;
          pointer-events: none;
          height: 0;
          font-style: italic;
          font-size: 1.25rem;
          opacity: 0.7;
          font-weight: 400;
        }

        .journal-editor-content .ProseMirror p {
          margin: 1.5rem 0 !important;
          color: var(--text-primary);
        }

        .journal-editor-content .ProseMirror p:first-child {
          margin-top: 0 !important;
        }

        .journal-editor-content .ProseMirror p:last-child {
          margin-bottom: 0 !important;
        }

        .full-width-image-container {
          margin: 2.5rem 0 !important;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .full-width-image-container:hover {
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        .journal-editor-content .ProseMirror blockquote {
          border-left: 4px solid #000;
          padding: 1rem 1.5rem;
          margin: 2rem 0;
          background: #f8fafc;
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: #64748b;
        }

        .dark .journal-editor-content .ProseMirror blockquote {
          background: #1e293b;
          color: #94a3b8;
        }

        .journal-editor-content .ProseMirror h1,
        .journal-editor-content .ProseMirror h2,
        .journal-editor-content .ProseMirror h3 {
          margin: 2.5rem 0 1.5rem 0;
          font-weight: 700;
          line-height: 1.3;
          color: var(--text-primary);
        }

        .journal-editor-content .ProseMirror h1 {
          font-size: 2.25rem;
        }

        .journal-editor-content .ProseMirror h2 {
          font-size: 1.875rem;
        }

        .journal-editor-content .ProseMirror h3 {
          font-size: 1.5rem;
        }

        .journal-editor-content .ProseMirror ul,
        .journal-editor-content .ProseMirror ol {
          padding-left: 1.75rem !important;
          margin: 1.5rem 0 !important;
        }

        .journal-editor-content .ProseMirror li {
          margin: 0.5rem 0 !important;
          display: list-item !important;
        }

        .journal-editor-content .ProseMirror li p {
          margin: 0 !important;
        }

        /* BOLD TEXT: Ensure visible in both modes */
        .journal-editor-content .ProseMirror strong {
          color: #111827;
          font-weight: 700;
        }
        .dark .journal-editor-content .ProseMirror strong {
          color: #fff;
        }

        /* BULLET POINTS: Ensure marker is visible in both modes */
        .journal-editor-content .ProseMirror ul li::marker {
          color: #3b82f6;
        }
        .dark .journal-editor-content .ProseMirror ul li::marker {
          color: #60a5fa;
        }

        .journal-editor-content .ProseMirror a {
          color: #3b82f6;
          text-decoration: none;
          border-bottom: 1px solid #3b82f6;
          transition: all 0.2s ease;
        }

        .journal-editor-content .ProseMirror a:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .journal-editor-content .ProseMirror code {
          background: #f1f5f9;
          color: #334155;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
        }

        .dark .journal-editor-content .ProseMirror code {
          background: #374151;
          color: #d1d5db;
        }

        .journal-editor-content .ProseMirror ::selection {
          background: rgba(59, 130, 246, 0.2);
        }

        @media (max-width: 768px) {
          .journal-editor-content .ProseMirror h1 {
            font-size: 1.875rem;
          }
          
          .journal-editor-content .ProseMirror h2 {
            font-size: 1.5rem;
          }
          
          .journal-editor-content .ProseMirror h3 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default JournalEditor;