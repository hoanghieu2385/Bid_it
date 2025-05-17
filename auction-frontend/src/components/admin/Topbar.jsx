import { useState, useRef, useEffect } from "react";
import {
  FaSearch,
  FaBell,
  FaEnvelope,
  FaUser,
  FaCogs,
  FaList,
  FaSignOutAlt,
} from "react-icons/fa";
import "../../assets/styles/admin/Topbar.css";

const Topbar = () => {
  // State để lưu trạng thái của dropdown nào đang mở
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Refs để theo dõi các dropdown
  const alertsRef = useRef(null);
  const messagesRef = useRef(null);
  const userMenuRef = useRef(null);

  // Hàm xử lý việc đóng mở dropdown
  const toggleDropdown = (dropdown) => {
    if (activeDropdown === dropdown) {
      // Nếu click vào dropdown đang mở, đóng nó lại
      setActiveDropdown(null);
    } else {
      // Nếu click vào dropdown khác, mở nó lên và đóng cái đang mở
      setActiveDropdown(dropdown);
    }
  };

  // Xử lý click bên ngoài để đóng dropdown
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

  return (
    <nav className="bg-white shadow topbar-fixed">
      <div className="search-form">
        <input type="text" placeholder="Search for..." />
        <button>
          <FaSearch size={14} />
        </button>
      </div>

      <ul>
        {/* Alerts Icon */}
        <li ref={alertsRef} className="dropdown-item">
          <button onClick={() => toggleDropdown("alerts")}>
            <FaBell size={18} />
            <span className="absolute">3+</span>
          </button>
          <div
            className={`dropdown-wrapper ${
              activeDropdown === "alerts" ? "dropdown-visible" : ""
            }`}
          >
            <div className="absolute dropdown-content">
              <h6>Alerts Center</h6>
              <div className="p-2">
                New monthly report is ready to download!
              </div>
              <div className="p-2">
                $290.29 has been deposited into your account!
              </div>
              <div className="p-2">
                Spending Alert: Unusually high spending detected.
              </div>
              <div className="p-2 text-center text-blue-600">
                Show All Alerts
              </div>
            </div>
          </div>
        </li>

        {/* Messages Icon */}
        <li ref={messagesRef} className="dropdown-item">
          <button onClick={() => toggleDropdown("messages")}>
            <FaEnvelope size={18} />
            <span className="absolute">7</span>
          </button>
          <div
            className={`dropdown-wrapper ${
              activeDropdown === "messages" ? "dropdown-visible" : ""
            }`}
          >
            <div className="absolute dropdown-content">
              <h6>Message Center</h6>
              <div className="p-2">Hi there! I need help with a problem.</div>
              <div className="p-2">Photos ordered last month are ready.</div>
              <div className="p-2">Last month's report looks great!</div>
              <div className="p-2 text-center text-blue-600">
                Read More Messages
              </div>
            </div>
          </div>
        </li>

        {/* User Info */}
        <li ref={userMenuRef} className="dropdown-item">
          <button onClick={() => toggleDropdown("userMenu")}>
            <img src="/img/undraw_profile.svg" alt="Profile" />
          </button>
          <div
            className={`dropdown-wrapper ${
              activeDropdown === "userMenu" ? "dropdown-visible" : ""
            }`}
          >
            <div className="absolute dropdown-content">
              <a href="#">
                <FaUser size={14} style={{ marginRight: "8px" }} />
                Profile
              </a>
              <a href="#">
                <FaCogs size={14} style={{ marginRight: "8px" }} />
                Settings
              </a>
              <a href="#">
                <FaList size={14} style={{ marginRight: "8px" }} />
                Activity Log
              </a>
              <div className="border-t"></div>
              <a href="#">
                <FaSignOutAlt size={14} style={{ marginRight: "8px" }} />
                Logout
              </a>
            </div>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Topbar;
