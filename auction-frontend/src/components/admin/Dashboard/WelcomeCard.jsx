import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { FaUsers, FaGavel, FaBoxOpen, FaExclamationTriangle } from "react-icons/fa";

const WelcomeCard = ({ dashboardData }) => {
  return (
    <Card className="welcome-card">
      <Card.Body>
        <h3>Hello, {dashboardData.username}</h3>
        <p>You have {dashboardData.tasks} tasks to handle</p>
        
        <Row className="mt-4">
          <Col md={6} className="mb-3">
            <Card className="stats-card">
              <Card.Body>
                <div className="stats-icon user-icon">
                  <FaUsers />
                </div>
                <h2>{dashboardData.stats.users.count} users</h2>
                <p>{dashboardData.stats.users.status}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="stats-card">
              <Card.Body>
                <div className="stats-icon auction-icon">
                  <FaGavel />
                </div>
                <h2>{dashboardData.stats.auctions.count} auctions</h2>
                <p>{dashboardData.stats.auctions.status}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="stats-card">
              <Card.Body>
                <div className="stats-icon sold-icon">
                  <FaBoxOpen />
                </div>
                <h2>{dashboardData.stats.sold.count} sold</h2>
                <p>{dashboardData.stats.sold.status}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="stats-card">
              <Card.Body>
                <div className="stats-icon dispute-icon">
                  <FaExclamationTriangle />
                </div>
                <h2>{dashboardData.stats.disputes.count} disputes</h2>
                <p>{dashboardData.stats.disputes.status}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default WelcomeCard;