import React from "react";
import "../../assets/styles/client/HowItWork.css";

const HowItWork = () => {
  return (
    <div className="how-it-works-container">
      <div className="hero-section">
        <h1>How It Work</h1>
      </div>

      <div className="process-section">
        <div className="process-item">
          <div className="process-image-placeholder"></div>
          <div className="process-content">
            <h2>Registration and Account</h2>
          </div>
        </div>

        <div className="process-item reverse gray-background">
          <div className="process-image-placeholder"></div>
          <div className="process-content">
            <h2>Browsing Products</h2>
          </div>
        </div>

        <div className="process-item">
          <div className="process-image-placeholder"></div>
          <div className="process-content">
            <h2>Place Bids and Monitor</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWork;
