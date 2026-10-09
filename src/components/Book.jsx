import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Page from './Page';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Upload,
  Trash2,
  Sparkles,
  BookOpen,
  Layers
} from 'lucide-react';

const TOTAL_PAGES = 20;
const STORAGE_KEY = 'react_page_flip_12x18_book_data';

// Book dimensions matching exact 12 * 18 ratio (2:3 aspect ratio)
const PAGE_WIDTH = 400;  // 12 units
const PAGE_HEIGHT = 600; // 18 units

function Book() {
  const flipBookRef = useRef(null);
  const batchFileInputRef = useRef(null);
  const [showCover, setShowCover] = useState(true);

  // Initialize pages state from localStorage if available
  const [pagesData, setPagesData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved book data:', e);
    }
    // Default: 20 empty pages
    const initial = {};
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      initial[i] = { image: null, fitMode: 'cover' };
    }
    return initial;
  });

  const [currentPage, setCurrentPage] = useState(0);

  // Save to localStorage when pagesData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pagesData));
    } catch (e) {
      console.error('Failed to save book data to localStorage:', e);
    }
  }, [pagesData]);

  // Handler for setting image on a page
  const handleImageChange = (pageNumber, imageData) => {
    setPagesData(prev => ({
      ...prev,
      [pageNumber]: {
        ...prev[pageNumber],
        image: imageData
      }
    }));
  };

  // Handler for removing image from a page
  const handleImageRemove = (pageNumber) => {
    setPagesData(prev => ({
      ...prev,
      [pageNumber]: {
        ...prev[pageNumber],
        image: null
      }
    }));
  };

  // Handler for toggling image fit mode (cover vs contain)
  const handleToggleFitMode = (pageNumber) => {
    setPagesData(prev => {
      const currentFit = prev[pageNumber]?.fitMode || 'cover';
      return {
        ...prev,
        [pageNumber]: {
          ...prev[pageNumber],
          fitMode: currentFit === 'cover' ? 'contain' : 'cover'
        }
      };
    });
  };

  // Clear all images
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all images from all 20 pages?')) {
      const cleared = {};
      for (let i = 1; i <= TOTAL_PAGES; i++) {
        cleared[i] = { image: null, fitMode: 'cover' };
      }
      setPagesData(cleared);
    }
  };

  // Batch upload multiple images at once to populate pages sequentially
  const handleBatchUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let targetPageIndex = 1;
    // Find the first blank page or start at 1
    while (targetPageIndex <= TOTAL_PAGES && pagesData[targetPageIndex]?.image) {
      targetPageIndex++;
    }
    if (targetPageIndex > TOTAL_PAGES) targetPageIndex = 1;

    files.slice(0, TOTAL_PAGES - targetPageIndex + 1).forEach((file, idx) => {
      const pageNum = targetPageIndex + idx;
      if (pageNum <= TOTAL_PAGES) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            handleImageChange(pageNum, event.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    if (batchFileInputRef.current) batchFileInputRef.current.value = '';
  };

  // Navigation handlers
  const flipPrev = () => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const flipNext = () => {
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const flipToFirst = () => {
    flipBookRef.current?.pageFlip()?.flip(0);
  };

  const flipToLast = () => {
    flipBookRef.current?.pageFlip()?.flip(TOTAL_PAGES - 1);
  };

  const onPageChange = (e) => {
    setCurrentPage(e.data);
  };

  // Calculate count of pages with images
  const filledCount = Object.values(pagesData).filter(p => p?.image).length;

  // Format page display text
  const getPageDisplayText = () => {
    if (showCover) {
      if (currentPage === 0) return 'Page 1 (Cover)';
      if (currentPage === TOTAL_PAGES - 1) return `Page ${TOTAL_PAGES} (Back Cover)`;
      const left = currentPage + 1;
      const right = Math.min(currentPage + 2, TOTAL_PAGES);
      return `Pages ${left} – ${right}`;
    } else {
      const left = currentPage + 1;
      const right = Math.min(currentPage + 2, TOTAL_PAGES);
      return `Pages ${left} – ${right}`;
    }
  };

  return (
    <div className="book-wrapper">
      {/* Top Header / Stats Bar */}
      <header className="book-header">
        <div className="header-info">
          <BookOpen className="header-icon" size={22} />
          <div>
            <h1 className="app-title">12 × 18 Photo Book</h1>
            <span className="badge">12:18 Ratio • 20 Pages</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="action-btn toggle-btn"
            onClick={() => setShowCover(!showCover)}
            title="Toggle Front/Back Cover View"
          >
            <Layers size={15} /> {showCover ? 'Cover View: ON' : 'Cover View: OFF'}
          </button>

          <button
            className="action-btn secondary"
            onClick={() => batchFileInputRef.current?.click()}
            title="Upload multiple photos at once to fill empty pages"
          >
            <Upload size={15} /> Batch Upload
          </button>
          <input
            type="file"
            ref={batchFileInputRef}
            onChange={handleBatchUpload}
            multiple
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            className="action-btn danger-outline"
            onClick={handleClearAll}
            title="Clear all images"
          >
            <Trash2 size={15} /> Clear All
          </button>
        </div>
      </header>

      {/* Main FlipBook Area */}
      <div className="flipbook-container">
        <HTMLFlipBook
          key={showCover ? 'cover-on' : 'cover-off'}
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          size="stretch"
          minWidth={280}
          maxWidth={450}
          minHeight={420}
          maxHeight={675}
          maxShadowOpacity={0.5}
          drawShadow={true}
          showCover={showCover}
          mobileScrollSupport={true}
          onFlip={onPageChange}
          className="flipbook-canvas"
          ref={flipBookRef}
        >
          {Array.from({ length: TOTAL_PAGES }, (_, index) => {
            const pageNum = index + 1;
            const pageInfo = pagesData[pageNum] || { image: null, fitMode: 'cover' };
            return (
              <Page
                key={pageNum}
                pageNumber={pageNum}
                totalPages={TOTAL_PAGES}
                imageData={pageInfo.image}
                fitMode={pageInfo.fitMode}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                onToggleFitMode={handleToggleFitMode}
              />
            );
          })}
        </HTMLFlipBook>
      </div>

      {/* Navigation & Controls Bar */}
      <footer className="book-controls">
        <div className="nav-controls">
          <button
            className="nav-btn"
            onClick={flipToFirst}
            disabled={currentPage === 0}
            title="First Page"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            className="nav-btn"
            onClick={flipPrev}
            disabled={currentPage === 0}
            title="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="page-indicator">
            <span className="highlight">{getPageDisplayText()}</span> of {TOTAL_PAGES}
          </div>

          <button
            className="nav-btn"
            onClick={flipNext}
            disabled={currentPage >= TOTAL_PAGES - 1}
            title="Next Page"
          >
            <ChevronRight size={18} />
          </button>
          <button
            className="nav-btn"
            onClick={flipToLast}
            disabled={currentPage >= TOTAL_PAGES - 1}
            title="Last Page"
          >
            <ChevronsRight size={18} />
          </button>
        </div>

        <div className="book-status">
          <Sparkles size={14} className="sparkle-icon" />
          <span>{filledCount} of {TOTAL_PAGES} pages populated</span>
        </div>
      </footer>
    </div>
  );
}

export default Book;
