// src/components/admin/Topbar.jsx
import { useState, useRef, useEffect, useContext } from "react";
import {
  FaSearch,
  FaBell,
  FaEnvelope,
  FaUser,
  FaCogs,
  FaList,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext.jsx";
import "../../assets/styles/admin/Topbar.css";

const Topbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const alertsRef = useRef(null);
  const messagesRef = useRef(null);
  const userMenuRef = useRef(null);
  const { user, logoutUser } = useContext(UserContext);
  const navigate = useNavigate();

  const toggleDropdown = (dropdown) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown === "alerts" &&
        alertsRef.current &&
        !alertsRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
      if (
        activeDropdown === "messages" &&
        messagesRef.current &&
        !messagesRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
      if (
        activeDropdown === "userMenu" &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow topbar-fixed">
      <div className="search-form">
        <input type="text" placeholder="Search for..." />
        <button>
          <FaSearch size={14} />
        </button>
      </div>

      <ul>
        {/* User Info */}
        <li ref={userMenuRef} className="dropdown-item">
          <button
            onClick={() => toggleDropdown("userMenu")}
            className="d-flex align-items-center gap-2"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="rounded-circle"
                style={{ width: 32, height: 32 }}
              />
            ) : (
              <div
                className="user-initial bg-primary text-white rounded-circle d-flex justify-content-center align-items-center"
                style={{ width: 32, height: 32 }}
              >
                {user?.firstName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="fw-medium">{user?.firstName || "User"}</span>
          </button>
          <div
            className={`dropdown-wrapper ${
              activeDropdown === "userMenu" ? "dropdown-visible" : ""
            }`}
          >
            <div className="absolute dropdown-content">
              <a href="#">
                <FaUser size={14} className="me-2" /> Profile
              </a>
              <a href="#">
                <FaCogs size={14} className="me-2" /> Settings
              </a>
              <a href="#">
                <FaList size={14} className="me-2" /> Activity Log
              </a>
              <div className="border-t my-1"></div>
              <a onClick={handleLogout} className="logout-link">
                <FaSignOutAlt size={14} className="me-2" /> Logout
              </a>
            </div>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Topbar;
