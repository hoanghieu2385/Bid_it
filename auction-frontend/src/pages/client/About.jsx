import React from 'react';
import '../../assets/styles/client/About.css';

const About = () => {
  const teamMembers = [
    { name: 'Le Hoang Hai Dang', description: 'Description...' },
    { name: 'Hoang Minh Hieu', description: 'Description...' },
    { name: 'Luong Thanh Tung', description: 'Description...' },
    { name: 'Nguyen Phuc Lam', description: 'Description...' },
    { name: 'Nguyen Thanh Mai', description: 'Description...' },
  ];

  return (
    <div className="about-us-container">
      {/* Banner */}
      <div className="banner">
        <h1>About Us</h1>
      </div>

      {/* Mission Statement */}
      <div className="mission-section">
        <h2>Our Mission in the Company</h2>
        <p>
          We aim to create a transparent and exciting platform for online auctions, 
          connecting buyers and sellers worldwide. Our mission is to make auctions 
          accessible to everyone, ensuring fairness and trust in every transaction
        </p>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <h2>Our team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <div className="member-photo"></div>
              <h3>{member.name}</h3>
              <p>{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;