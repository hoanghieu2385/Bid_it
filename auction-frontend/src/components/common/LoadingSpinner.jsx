import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: ''
  }[size];

  const containerClass = {
    sm: 'py-3',
    md: 'py-4',
    lg: 'py-5'
  }[size];

  return (
    <div className={`loading-container text-center ${containerClass}`}>
      <div className={`spinner-border text-primary ${sizeClass}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && (
        <div className="loading-message mt-2 text-muted">
          {message}
        </div>
      )}
    </div>
  );
};

// src/components/common/ErrorAlert.jsx
const ErrorAlert = ({ message, onRetry, showRetry = false }) => {
  return (
    <div className="error-container">
      <div className="alert alert-danger" role="alert">
        <div className="d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-3 fs-4"></i>
          <div className="flex-grow-1">
            <h6 className="alert-heading mb-1">Something went wrong</h6>
            <p className="mb-0">{message}</p>
          </div>
          {showRetry && onRetry && (
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={onRetry}
            >
              <i className="fas fa-redo me-1"></i>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// src/components/common/EmptyState.jsx
const EmptyState = ({ 
  icon = 'fas fa-inbox', 
  title = 'No data found', 
  description = '', 
  actionText = '', 
  actionLink = '',
  size = 'lg' 
}) => {
  const containerClass = {
    sm: 'py-3',
    md: 'py-4', 
    lg: 'py-5'
  }[size];

  const iconSize = {
    sm: 'fa-2x',
    md: 'fa-3x',
    lg: 'fa-4x'
  }[size];

  return (
    <div className={`empty-state text-center ${containerClass}`}>
      <i className={`${icon} ${iconSize} text-muted mb-3`}></i>
      <h5 className="text-muted mb-2">{title}</h5>
      {description && (
        <p className="text-muted mb-3">{description}</p>
      )}
      {actionText && actionLink && (
        <a href={actionLink} className="btn btn-primary">
          {actionText}
        </a>
      )}
    </div>
  );
};

// Export all components
export default LoadingSpinner;
export { ErrorAlert, EmptyState };