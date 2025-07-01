import React from "react";
import { Card, ButtonGroup, Button } from "react-bootstrap";

const CategoryCard = ({ dashboardData, categoryTimeFrame, setCategoryTimeFrame }) => {
  return (
    <Card className="category-card">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Top Categories</h5>
            <small className="text-muted">Categories that generate the most revenue</small>
          </div>
        </div>
        
        <div className="category-filter mt-3 mb-4">
          <ButtonGroup size="sm" className="w-100">
            <Button 
              variant={categoryTimeFrame === "All" ? "danger" : "light"}
              className="flex-fill"
              onClick={() => setCategoryTimeFrame("All")}
            >
              All
            </Button>
            <Button 
              variant={categoryTimeFrame === "Year" ? "danger" : "light"}
              className="flex-fill"
              onClick={() => setCategoryTimeFrame("Year")}
            >
              Year
            </Button>
            <Button 
              variant={categoryTimeFrame === "Quarter" ? "danger" : "light"}
              className="flex-fill"
              onClick={() => setCategoryTimeFrame("Quarter")}
            >
              Quarter
            </Button>
            <Button 
              variant={categoryTimeFrame === "Month" ? "danger" : "light"}
              className="flex-fill"
              onClick={() => setCategoryTimeFrame("Month")}
            >
              Month
            </Button>
          </ButtonGroup>
        </div>
        
        <div className="categories-chart">
          {dashboardData.categories.map((category, index) => (
            <div key={index} className="category-item mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="category-name">{category.name}</div>
                <div className="category-revenue">{category.revenue.toLocaleString()} USD</div>
              </div>
              <div className="progress" style={{ height: "8px" }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ 
                    width: dashboardData.categories[0]?.revenue > 0 
                      ? `${(category.revenue / dashboardData.categories[0].revenue) * 100}%`
                      : '10%',
                    backgroundColor: ['#ff6b8a', '#36b9cc', '#1cc88a', '#f6c23e', '#e74a3b'][index % 5]
                  }}
                  aria-valuenow={dashboardData.categories[0]?.revenue > 0 
                    ? (category.revenue / dashboardData.categories[0].revenue) * 100 
                    : 10} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default CategoryCard;