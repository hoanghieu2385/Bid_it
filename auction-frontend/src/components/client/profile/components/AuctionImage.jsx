// AuctionImage using background-image to avoid Bootstrap conflicts
import React, { useState, useEffect, memo } from 'react';

const AuctionImage = ({ auction }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageKey, setImageKey] = useState(0);

  // Force image reload when auction changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setImageKey(prev => prev + 1);
  }, [auction?.id]);

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

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  // Test if image loads by creating a hidden img element
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = `${imageUrl}?v=${imageKey}`;
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  }, [imageUrl, imageKey]);

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
      <div
        className="auction-image-background"
        style={{
          backgroundImage: imageLoading ? 'none' : `url("${imageUrl}?v=${imageKey}")`,
          opacity: imageLoading ? 0 : 1
        }}
      />
    </div>
  );
};

export default memo(AuctionImage);