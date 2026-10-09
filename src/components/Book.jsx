import React, { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import Page from './Page';
import { INITIAL_PAGE_IMAGES } from '../data/pagesData';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  BookOpen,
  Layers,
  Maximize,
  Minimize
} from 'lucide-react';

const TOTAL_PAGES = 20;

// Book dimensions matching 18 * 12 landscape ratio (3:2 aspect ratio per page)
const PAGE_WIDTH = 600;  // 18 units wide
const PAGE_HEIGHT = 400; // 12 units high

function Book() {
  const flipBookRef = useRef(null);
  const bookWrapperRef = useRef(null);

  const [showCover, setShowCover] = useState(true);
  const [pagesData] = useState(() => {
    const initial = {};
    for (let i = 1; i <= TOTAL_PAGES; i++) {
      initial[i] = INITIAL_PAGE_IMAGES[i] || { image: null, fitMode: 'cover' };
    }
    return initial;
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Synchronize browser full screen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (bookWrapperRef.current?.requestFullscreen) {
          await bookWrapperRef.current.requestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsFullScreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullScreen(false);
      }
    } catch (e) {
      console.warn('Fullscreen toggle error:', e);
      setIsFullScreen(prev => !prev);
    }
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

  // Count of populated pages
  const filledCount = Object.values(pagesData).filter(p => p?.image).length;

  // Formatted page indicator display
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
    <div
      className={`book-wrapper ${isFullScreen ? 'fullscreen-mode' : ''}`}
      ref={bookWrapperRef}
    >
      {/* Clean Header: Icon, Title, and Size Badge Only */}
      <header className="book-header">
        <div className="header-info">
          <BookOpen className="header-icon" size={22} />
          <div>
            <h1 className="app-title">18 × 12 Photo Book</h1>
            <span className="badge">18×12 Ratio • 20 Pages</span>
          </div>
        </div>
      </header>

      {/* Main FlipBook Area: 18 x 12 Landscape Spread with Cover Flipping */}
      <div className="flipbook-container">
        <HTMLFlipBook
          key={showCover ? 'cover-enabled' : 'cover-disabled'}
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          size="stretch"
          minWidth={360}
          maxWidth={840}
          minHeight={240}
          maxHeight={560}
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
                imageData={pageInfo.image}
                fitMode={pageInfo.fitMode}
              />
            );
          })}
        </HTMLFlipBook>
      </div>

      {/* Bottom Navigation & Controls Bar */}
      <footer className="book-controls">
        <div className="nav-controls">
          <button
            className="nav-btn"
            onClick={flipToFirst}
            disabled={currentPage === 0}
            title="First Page / Cover"
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
            title="Last Page / Back Cover"
          >
            <ChevronsRight size={18} />
          </button>

          <button
            className={`nav-btn cover-btn ${showCover ? 'active' : ''}`}
            onClick={() => setShowCover(prev => !prev)}
            title={showCover ? "Cover Mode: Active (Page 1 as Cover)" : "Spread Mode: Active (Facing Spreads)"}
          >
            <Layers size={18} />
          </button>

          <button
            className={`nav-btn expand-btn ${isFullScreen ? 'active' : ''}`}
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit Fullscreen" : "Expand Fullscreen"}
          >
            {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
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
