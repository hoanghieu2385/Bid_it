import React from 'react';

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
    <div className={`text-center ${containerClass}`}>
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

export default EmptyState;