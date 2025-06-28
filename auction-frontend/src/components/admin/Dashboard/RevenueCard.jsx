import React from "react";
import { Row, Col, Card, Badge, ButtonGroup, Button } from "react-bootstrap";

const RevenueCard = ({ dashboardData, revenueTimeFrame, setRevenueTimeFrame }) => {
  return (
    <Card className="revenue-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Revenue</h5>
            <small className="text-muted">Fees collected from successful payments</small>
          </div>
          <div className="time-selector">
            <ButtonGroup size="sm">
              <Button 
                variant={revenueTimeFrame === "Day" ? "primary" : "outline-secondary"}
                onClick={() => setRevenueTimeFrame("Day")}
              >
                Day
              </Button>
              <Button 
                variant={revenueTimeFrame === "Month" ? "primary" : "outline-secondary"}
                onClick={() => setRevenueTimeFrame("Month")}
              >
                Month
              </Button>
              <Button 
                variant={revenueTimeFrame === "Quarter" ? "primary" : "outline-secondary"}
                onClick={() => setRevenueTimeFrame("Quarter")}
              >
                Quarter
              </Button>
              <Button 
                variant={revenueTimeFrame === "Year" ? "primary" : "outline-secondary"}
                onClick={() => setRevenueTimeFrame("Year")}
              >
                Year
              </Button>
            </ButtonGroup>
          </div>
        </div>
        
        <Row className="mt-4">
          <Col md={6}>
            <div className="revenue-stats">
              <h2 className="revenue-amount">{dashboardData.revenue.current} VND</h2>
              <Badge bg="success" className="revenue-badge">
                +{dashboardData.revenue.percentage}%
              </Badge>
              <p className="text-muted">Earned this month</p>
            </div>
          </Col>
          <Col md={6}>
            <div className="revenue-stats">
              <h2 className="revenue-amount">{dashboardData.revenue.successfulPayments.count}</h2>
              <Badge bg="success" className="revenue-badge">
                +{dashboardData.revenue.successfulPayments.percentage}%
              </Badge>
              <p className="text-muted">Successful payments</p>
            </div>
          </Col>
        </Row>
        
        {/* Simple Revenue Chart Placeholder */}
        <div className="revenue-chart mt-3 text-center py-4">
          <p className="text-muted">Revenue chart will be updated when payment service is available</p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default RevenueCard;