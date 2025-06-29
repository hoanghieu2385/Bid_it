/**
 * Format price with proper currency symbol and locale
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return 'N/A';
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numericPrice);
};

/**
 * Format date and time for display
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date only (no time)
 */
export const formatDate = (dateString) => {
  return formatDateTime(dateString, {
    hour: undefined,
    minute: undefined
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(dateString);
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Calculate time remaining until a future date
 */
export const getTimeRemaining = (endTime) => {
  if (!endTime) return null;
  
  try {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    if (minutes > 0) return `${minutes}m remaining`;
    
    return 'Less than 1m remaining';
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return 'Invalid Date';
  }
};

/**
 * Format large numbers with appropriate suffixes (K, M, B)
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (absNum >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (absNum >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Mask email for privacy (e.g., jo***@example.com)
 */
export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email || 'N/A';
  
  const [username, domain] = email.split('@');
  if (!username || !domain) return email;
  
  const visibleChars = Math.min(2, Math.floor(username.length / 2));
  const maskedUsername = username.substring(0, visibleChars) + 
    '*'.repeat(Math.max(1, username.length - visibleChars));
  
  return `${maskedUsername}@${domain}`;
};

/**
 * Get status display configuration
 */
export const getStatusConfig = (status) => {
  const statusConfigs = {
    'UPCOMING': {
      color: 'info',
      icon: 'clock',
      text: 'Upcoming'
    },
    'OPENED': {
      color: 'success',
      icon: 'play-circle',
      text: 'Live Auction'
    },
    'CANCELLED': {
      color: 'danger',
      icon: 'times-circle',
      text: 'Cancelled'
    },
    'CLOSED': {
      color: 'warning',
      icon: 'lock',
      text: 'Closed'
    },
    'SOLD': {
      color: 'success',
      icon: 'check-circle',
      text: 'Sold'
    },
    'EXPIRED_PAYMENT': {
      color: 'danger',
      icon: 'exclamation-triangle',
      text: 'Payment Expired'
    },
    'FAILED': {
      color: 'secondary',
      icon: 'times',
      text: 'Failed'
    },
    'SHIPPING': {
      color: 'info',
      icon: 'truck',
      text: 'Shipping'
    },
    'DELIVERED': {
      color: 'primary',
      icon: 'box',
      text: 'Delivered'
    },
    'DISPUTED': {
      color: 'danger',
      icon: 'exclamation-circle',
      text: 'Disputed'
    },
    'PENDING_RETURN': {
      color: 'warning',
      icon: 'undo',
      text: 'Pending Return'
    },
    'RETURNING': {
      color: 'warning',
      icon: 'undo-alt',
      text: 'Returning'
    },
    'COMPLETED': {
      color: 'success',
      icon: 'check-double',
      text: 'Completed'
    }
  };
  
  return statusConfigs[status] || {
    color: 'secondary',
    icon: 'question-circle',
    text: status || 'Unknown'
  };
};

/**
 * Check if date is within specified days
 */
export const isWithinDays = (dateString, days = 1) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
    return diffInDays <= days;
  } catch (error) {
    return false;
  }
};