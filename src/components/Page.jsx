import React, { forwardRef } from 'react';

const Page = forwardRef(({
  pageNumber,
  imageData,
  fitMode = 'cover'
}, ref) => {
  return (
    <div className="page" ref={ref}>
      <div className="page-content">
        {imageData ? (
          <div className="image-container">
            <img
              src={imageData}
              alt={`Page ${pageNumber}`}
              className={`page-image ${fitMode === 'contain' ? 'fit-contain' : 'fit-cover'}`}
            />
          </div>
        ) : (
          <div className="blank-page-canvas" />
        )}
      </div>
    </div>
  );
});

Page.displayName = 'Page';

export default Page;
