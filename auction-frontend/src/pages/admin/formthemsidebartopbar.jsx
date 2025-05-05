import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Auctions = () => {
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

export default Auctions;