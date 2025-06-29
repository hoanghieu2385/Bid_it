// src/components/client/profile/components/AuctionImage.jsx
import React, { useState, memo } from 'react';

const AuctionImage = ({ auction }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `http://localhost:8080${url}`;
    return `http://localhost:8080/${url}`;
  };

  const getFirstImage = () => {
    // Try different possible image sources
    if (auction.mediaUrls && Array.isArray(auction.mediaUrls) && auction.mediaUrls.length > 0) {
      return getImageUrl(auction.mediaUrls[0]);
    }
    
    if (auction.media && Array.isArray(auction.media) && auction.media.length > 0) {
      const media = auction.media[0];
      return getImageUrl(media.url || media.mediaUrl || media.imageUrl);
    }
    
    // Check for direct image properties
    if (auction.imageUrl) {
      return getImageUrl(auction.imageUrl);
    }
    
    if (auction.image) {
      return getImageUrl(auction.image);
    }
    
    // Check for thumbnail
    if (auction.thumbnail) {
      return getImageUrl(auction.thumbnail);
    }
    
    return null;
  };

  const imageUrl = getFirstImage();

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    setImageLoading(false);
    setImageError(true);
  };

  if (!imageUrl || imageError) {
    return (
      <div className="auction-image-placeholder">
        <i className="fas fa-image"></i>
        <span>No Image Available</span>
      </div>
    );
  }

  return (
    <div className="auction-image-container">
      {imageLoading && (
        <div className="image-loading">
          <div className="spinner-border spinner-border-sm text-primary"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={auction.title || 'Auction item'}
        className="auction-image"
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: imageLoading ? 'none' : 'block' }}
        loading="lazy"
      />
    </div>
  );
};

export default memo(AuctionImage);