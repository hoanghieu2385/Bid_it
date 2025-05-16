import {React, useEffect } from 'react';
import '../../assets/styles/client/Contact.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function ContactPage() {
  useEffect(() => {
		document.title = 'Contact | Bid it';
	}, []);

  return (
    <div className="mp-contact-page">
      {/* Contact Content */}
      <div className="mp-contact-content">
        <div className="container position-relative py-5">
          <div className="row">
            {/* Contact Card */}
            <div className="col-md-12">
              <div className="mp-contact-card-wrapper">
                {/* Sidebar */}
                <div className="mp-contact-sidebar">
                  <h2 className="mp-contact-title">Contact Us</h2>
                  
                  <div className="mp-contact-info">
                    <div className="mp-contact-item">
                      <i className="bi bi-geo-alt-fill"></i>
                      <div>
                        <p>211 Ullamcorper St</p>
                        <p>Roseville</p>
                      </div>
                    </div>
                    
                    <div className="mp-contact-item">
                      <i className="bi bi-envelope-fill"></i>
                      <p>sale@modeltheme.com</p>
                    </div>
                    
                    <div className="mp-contact-item">
                      <i className="bi bi-telephone-fill"></i>
                      <p>+40 712 345 678</p>
                    </div>
                  </div>
                </div>

                {/* Form Container */}
                <div className="mp-contact-form-container">
                  <h2 className="mp-get-in-touch">Get in Touch</h2>
                  <p className="mp-contact-subtitle">Feel free to drop us a line below!</p>
                  
                  <div className="mp-contact-form">
                    <div className="row mb-4">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Your Name" 
                        />
                      </div>
                      <div className="col-md-6">
                        <input 
                          type="email" 
                          className="form-control" 
                          placeholder="Email Adress" 
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <textarea 
                        className="form-control" 
                        rows="5" 
                        placeholder="Your Message"
                      ></textarea>
                    </div>
                    
                    <div>
                      <button type="submit" className="mp-send-message-btn">
                        SEND MESSAGE 
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;