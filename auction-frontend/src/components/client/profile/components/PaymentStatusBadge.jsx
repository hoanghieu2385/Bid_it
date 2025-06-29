import React, { memo } from 'react';

const PaymentStatusBadge = ({ paymentStatus, isPaid, isWinner, isPaymentCritical }) => {
  if (!isWinner || !paymentStatus) return null;

  const getBadgeConfig = () => {
    if (isPaid) {
      return { class: 'success', text: 'Paid', icon: 'check-circle' };
    }

    const statusMap = {
      'PENDING': { class: 'warning', text: 'Pending', icon: 'clock' },
      'COMPLETED': { class: 'success', text: 'Paid', icon: 'check-circle' },
      'FAILED': { class: 'danger', text: 'Payment Failed', icon: 'times-circle' },
      'CANCELLED': { class: 'secondary', text: 'Cancelled', icon: 'ban' }
    };

    return statusMap[paymentStatus] || { 
      class: 'secondary', 
      text: paymentStatus, 
      icon: 'info-circle' 
    };
  };

  const config = getBadgeConfig();

  return (
    <span className={`payment-badge badge-${config.class} ${isPaymentCritical ? 'critical' : ''}`}>
      <i className={`fas fa-${config.icon} me-1`}></i>
      {config.text}
    </span>
  );
};

export default memo(PaymentStatusBadge);