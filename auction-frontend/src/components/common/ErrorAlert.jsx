import React from 'react';

const ErrorAlert = ({ message, onRetry, showRetry = false }) => {
  return (
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
  );
};

export default ErrorAlert;