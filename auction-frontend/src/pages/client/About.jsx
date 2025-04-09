import React from "react";
import "../../assets/styles/client/About.css";
import {
  FaHeadset,
  FaShippingFast,
  FaGlobeAmericas,
  FaUsers,
} from "react-icons/fa";
import {
  BsClockHistory,
  BsArrowReturnLeft,
  BsCreditCard2Front,
  BsBox,
} from "react-icons/bs";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaVimeoV } from "react-icons/fa";

function About() {
  // Danh sách thành viên với thông tin chi tiết
  const teamMembers = [
    {
      id: 1,
      name: "Le Hoang Hai Dang",
      position: "UI/UX Designer",
      image: "https://placehold.co/100",
      social: {
        facebook: "#",
        twitter: "#",
        linkedin: "#",
        vimeo: "#",
      },
    },
    {
      id: 2,
      name: "Nguyen Thanh Mai",
      position: "Development Lead",
      image: "https://placehold.co/100",
      social: {
        facebook: "#",
        twitter: "#",
        linkedin: "#",
        vimeo: "#",
      },
    },
    {
      id: 3,
      name: "Hoang Minh Hieu",
      position: "Product Manager",
      image: "https://placehold.co/100",
      social: {
        facebook: "#",
        twitter: "#",
        linkedin: "#",
        vimeo: "#",
      },
    },
    {
      id: 4,
      name: "Luong Thanh Tung",
      position: "Development Lead",
      image: "https://placehold.co/100",
      social: {
        facebook: "#",
        twitter: "#",
        linkedin: "#",
        vimeo: "#",
      },
    },
    {
      id: 5,
      name: "Nguyen Phuc Lam",
      position: "UI/UX Designer",
      image: "https://placehold.co/100",
      social: {
        facebook: "#",
        twitter: "#",
        linkedin: "#",
        vimeo: "#",
      },
    },
  ];

  return (
    <>
      {/* Hero Banner - Like Image 1 */}
      <div className="about-hero-banner">
        <div className="about-hero-content">
          <h1>ABOUT US</h1>
          <p>
            Podcasting operational change management inside of workflows to
            establish a framework. Taking seamless key performance indicators
            offline. Quickly maximize timely deliverables for real-time schemas.
          </p>
          <p>
            Dynamically procrastinate B2C users after installed base benefits.
            Dramatically visualize customer directed the start-up mentality to
            derive convergence.
          </p>
          <button className="about-read-more-btn">READ MORE</button>
        </div>
      </div>

      <div className="about-container">
        <div className="about-header">
          <h1 className="about-logo">
            Bid it<span className="about-text-primary">.</span>
          </h1>
          <p className="about-tagline">
            Completely synergize resource taxing relationships via premier niche
            markets. Professionally cultivate one-to-one customer service with
            robust ideas. Dynamically innovate resource-leveling customer
            service for state of the art customer service. Objectively innovate
            empowered manufactured products whereas parallel platforms.
          </p>
        </div>

        {/* Services section */}
        <div className="about-services-grid">
          <div className="about-service-box">
            <div className="about-icon-outline">
              <FaHeadset size={30} className="about-icon-blue" />
            </div>
            <h5>Call Center</h5>
            <p className="about-small-text">Completely synergize</p>
          </div>

          <div className="about-service-box">
            <div className="about-icon-outline">
              <BsClockHistory size={30} className="about-icon-blue" />
            </div>
            <h5>Order Tracking</h5>
            <p className="about-small-text">Objectively empowered</p>
          </div>

          <div className="about-service-box">
            <div className="about-icon-outline">
              <FaShippingFast size={30} className="about-icon-blue" />
            </div>
            <h5>Fastest Delivery</h5>
            <p className="about-small-text">Efficiently unleash media</p>
          </div>

          <div className="about-service-box">
            <div className="about-icon-outline">
              <BsCreditCard2Front size={30} className="about-icon-blue" />
            </div>
            <h5>Instant Buying</h5>
            <p className="about-small-text">Podcasting operational</p>
          </div>

          <div className="about-service-box">
            <div className="about-icon-outline">
              <BsBox size={30} className="about-icon-blue" />
            </div>
            <h5>Verify Purchases</h5>
            <p className="about-small-text">Nanotechnology immersion</p>
          </div>

          <div className="about-service-box">
            <div className="about-icon-outline">
              <FaGlobeAmericas size={30} className="about-icon-blue" />
            </div>
            <h5>More Currencies</h5>
            <p className="about-small-text">Quickly maximize</p>
          </div>

          <div className="about-service-box">
            <div className="about-icon-outline">
              <BsArrowReturnLeft size={30} className="about-icon-blue" />
            </div>
            <h5>Returns Policy</h5>
            <p className="about-small-text">Dynamically innovate</p>
          </div>

          <div className="about-service-box">
            <div className="about-icon-outline">
              <FaShippingFast size={30} className="about-icon-blue" />
            </div>
            <h5>Free Shipping</h5>
            <p className="about-small-text">Dramatically engage</p>
          </div>
        </div>

        {/* Team section */}
        <div className="about-team-section">
          <h2 className="about-section-title">OUR TEAM</h2>
          <div className="about-team-members">
            {teamMembers.map((member) => (
              <div key={member.id} className="about-member">
                <img
                  src={member.image}
                  alt={member.name}
                  className="about-rounded-circle"
                />
                <div className="about-member-hover">
                  <h4>{member.name}</h4>
                  <p>{member.position}</p>
                  <div className="about-social-icons">
                    <a
                      href={member.social.facebook}
                      className="about-social-icon"
                    >
                      <FaFacebookF />
                    </a>
                    <a
                      href={member.social.twitter}
                      className="about-social-icon"
                    >
                      <FaTwitter />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="about-social-icon"
                    >
                      <FaLinkedinIn />
                    </a>
                    <a href={member.social.vimeo} className="about-social-icon">
                      <FaVimeoV />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats and information */}
        <div className="about-stats-container">
          <div className="about-info-side">
            <div className="about-info-box">
              <p>
                Yahoo Inc. is an American multinational Internet corporation
                headquartered in Sunnyvale, California. It is globally known for
                its Web portal, search engine Yahoo Search.
              </p>
            </div>
          </div>

          <div className="about-stats-side">
            <div className="about-stats-grid">
              <div className="about-stats-box">
                <div className="about-icon-blue about-stats-icon">
                  <BsBox size={30} />
                </div>
                <div>
                  <h3>8523</h3>
                  <p className="about-text-muted">AUCTIONS</p>
                </div>
              </div>

              <div className="about-stats-box">
                <div className="about-icon-blue about-stats-icon">
                  <FaUsers size={30} />
                </div>
                <div>
                  <h3>116</h3>
                  <p className="about-text-muted">EMPLOYEES</p>
                </div>
              </div>

              <div className="about-stats-box">
                <div className="about-icon-blue about-stats-icon">
                  <FaUsers size={30} />
                </div>
                <div>
                  <h3>458</h3>
                  <p className="about-text-muted">SELLER ACCOUNTS</p>
                </div>
              </div>

              <div className="about-stats-box">
                <div className="about-icon-blue about-stats-icon">
                  <FaUsers size={30} />
                </div>
                <div>
                  <h3>4523</h3>
                  <p className="about-text-muted">TOTAL ACCOUNTS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
