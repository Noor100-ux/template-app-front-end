// Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TemplateGallery from './TemplateGallery';
import TemplateEditor from './TemplateEditor';
import './Dashboard.css';

import birthdayImage from '../assets/rm222batch3-mind-06 01.03.21.jpg';
import weddingImage from '../assets/rm222batch5-kul-18 01.03.21.jpg'

const Dashboard = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Updated templates with image URLs
  const templates = [
    {
      id: 1,
      name: 'Birthday Invitation',
      width: 800,
      height: 600,
      backgroundColor: '#F0F4F8',
      defaultText: 'Birthday Celebration',
      aspectRatio: 4/3,
      imageUrl: birthdayImage, // Add a default image URL
      previewElements: [
        {
          id: 1,
          type: 'text',
          text: 'Birthday Celebration',
          color: '#FF5757',
          fontSize: 36,
          position: { x: 300, y: 100 }
        },
        {
          id: 2,
          type: 'text',
          text: 'Join us for the party!',
          color: '#333333',
          fontSize: 24,
          position: { x: 320, y: 200 }
        }
      ]
    },
    {
      id: 2,
      name: 'Wedding Invitation',
      width: 1000,
      height: 700,
      backgroundColor: '#FFFFFF',
      defaultText: 'Wedding Invitation',
      aspectRatio: 10/7,
      imageUrl: weddingImage, // Add a default image URL
      previewElements: [
        {
          id: 1,
          type: 'text',
          text: 'Wedding Invitation',
          color: '#8B5A2B',
          fontSize: 42,
          position: { x: 350, y: 150 }
        },
        {
          id: 2,
          type: 'text',
          text: 'We invite you to celebrate with us',
          color: '#333333',
          fontSize: 24,
          position: { x: 320, y: 250 }
        }
      ]
    }
  ];

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if no token
      navigate('/login');
    } else {
      // You might want to validate the token with your backend
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleBackToGallery = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Clear token and redirect to login
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome, User!</h1>
            <p>Create and customize your perfect template</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </div>

      {!isEditing ? (
        <TemplateGallery 
          templates={templates} 
          onTemplateSelect={handleTemplateSelect} 
        />
      ) : (
        <TemplateEditor 
          template={selectedTemplate} 
          onBack={handleBackToGallery} 
        />
      )}
    </div>
  );
};

export default Dashboard;