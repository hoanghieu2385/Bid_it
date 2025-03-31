import { useState } from "react";
import { FaSearch, FaBell, FaEnvelope, FaUser, FaCogs, FaList, FaSignOutAlt } from 'react-icons/fa';
import '../../assets/styles/admin/Topbar.css';

const Topbar = () => {
    const [showAlerts, setShowAlerts] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    return (
      <div id="wrapper"> 
        {/* Main Content */}
        <div id="content-wrapper" className="d-flex flex-column" style={{ flex: 1 }}>
          {/* Topbar */}
          <nav className="bg-white shadow">
            <div className="search-form">
              <input type="text" placeholder="Search for..." />
              <button>
                <FaSearch size={14} />
              </button>
            </div>
            
            <ul>
              {/* Alerts Icon */}
              <li>
                <button onClick={() => setShowAlerts(!showAlerts)}>
                  <FaBell size={18} />
                  <span className="absolute">3+</span>
                </button>
                {showAlerts && (
                  <div className="absolute">
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
                )}
              </li>
              
              {/* Messages Icon */}
              <li>
                <button onClick={() => setShowMessages(!showMessages)}>
                  <FaEnvelope size={18} />
                  <span className="absolute">7</span>
                </button>
                {showMessages && (
                  <div className="absolute">
                    <h6>Message Center</h6>
                    <div className="p-2">
                      Hi there! I need help with a problem.
                    </div>
                    <div className="p-2">
                      Photos ordered last month are ready.
                    </div>
                    <div className="p-2">Last month's report looks great!</div>
                    <div className="p-2 text-center text-blue-600">
                      Read More Messages
                    </div>
                  </div>
                )}
              </li>
              
              {/* User Info */}
              <li>
                <button onClick={() => setShowUserMenu(!showUserMenu)}>
                  <span>Douglas McGee</span>
                  <img
                    src="/img/undraw_profile.svg"
                    alt="Profile"
                  />
                </button>
                {showUserMenu && (
                  <div className="absolute">
                    <a href="#">
                      <FaUser size={14} style={{ marginRight: '8px' }} />
                      Profile
                    </a>
                    <a href="#">
                      <FaCogs size={14} style={{ marginRight: '8px' }} />
                      Settings
                    </a>
                    <a href="#">
                      <FaList size={14} style={{ marginRight: '8px' }} />
                      Activity Log
                    </a>
                    <div className="border-t"></div>
                    <a href="#">
                      <FaSignOutAlt size={14} style={{ marginRight: '8px' }} />
                      Logout
                    </a>
                  </div>
                )}
              </li>
            </ul>
          </nav>
          
          {/* Page Content */}
          <div className="container-fluid p-4">
            {/* Rest of your dashboard content */}
          </div>
        </div>
      </div>
    );
  };
  
  export default Topbar;