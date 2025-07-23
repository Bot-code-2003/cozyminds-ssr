import { useEffect, useRef, useCallback } from 'react';

const useAutoSave = (content, title, saveKey = 'journal-draft') => {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef({ content: '', title: '' });

  // Save to localStorage
  const saveToStorage = useCallback((data) => {
    try {
      const draftData = {
        ...data,
        timestamp: Date.now(),
        lastModified: new Date().toISOString()
      };
      localStorage.setItem(saveKey, JSON.stringify(draftData));
      console.log('Draft auto-saved:', draftData);
    } catch (error) {
      console.error('Failed to save draft to localStorage:', error);
    }
  }, [saveKey]);

  // Load from localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(saveKey);
      if (saved) {
        const draftData = JSON.parse(saved);
        console.log('Draft loaded from storage:', draftData);
        return draftData;
      }
    } catch (error) {
      console.error('Failed to load draft from localStorage:', error);
    }
    return null;
  }, [saveKey]);

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(saveKey);
      console.log('Draft cleared from storage');
    } catch (error) {
      console.error('Failed to clear draft from localStorage:', error);
    }
  }, [saveKey]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const currentContent = content || '';
      const currentTitle = title || '';
      
      // Only save if content has actually changed
      if (currentContent !== lastSavedRef.current.content || 
          currentTitle !== lastSavedRef.current.title) {
        
        saveToStorage({
          content: currentContent,
          title: currentTitle
        });
        
        lastSavedRef.current = {
          content: currentContent,
          title: currentTitle
        };
      }
    }, 5000); // 5 second delay
  }, [content, title, saveToStorage]);

  // Auto-save when content changes
  useEffect(() => {
    if (content || title) {
      debouncedSave();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, title, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    loadFromStorage,
    clearDraft,
    saveToStorage: () => saveToStorage({ content, title })
  };
};

export default useAutoSave; 