import React, { useState } from 'react';
import '../../assets/styles/client/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý logic gửi form ở đây
    console.log('Form submitted:', formData);
    // Reset form sau khi gửi
    setFormData({
      fullName: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className="contact-section">
      <div className="contact-content">
        <div className="contact-form-container">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Your full name..."
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Type here..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="send-button">Send</button>
          </form>
        </div>
        
        <div className="contact-info">
          <div className="info-item">
            <h3>Email Address</h3>
            <p>bidit@autobit.system.com</p>
          </div>
          
          <div className="info-item">
            <h3>Phone number</h3>
            <p>+091345678</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;