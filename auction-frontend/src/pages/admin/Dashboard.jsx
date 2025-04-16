import React from "react";
import {
  FaSearch,
  FaBell,
  FaEnvelope,
  FaUser,
  FaCogs,
  FaList,
  FaSignOutAlt,
} from "react-icons/fa";
import "../../assets/styles/admin/Dashboard.css";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Dashboard = () => {
  return (
    <div id="wrapper">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div
        id="content-wrapper"
        className="d-flex flex-column"
        style={{ flex: 1 }}
      >
        <Topbar />
      </div>
    </div>
  );
};

export default Dashboard;
