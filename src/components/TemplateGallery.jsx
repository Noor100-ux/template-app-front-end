import React from 'react';

const TemplateGallery = ({ templates, onTemplateSelect }) => {
  return (
    <div className="template-gallery">
      <h2>Select a Template</h2>
      <div className="template-grid">
        {templates.map(template => (
          <div 
            key={template.id} 
            className="template-card"
            onClick={() => onTemplateSelect(template)}
          >
            <div 
              className="template-preview" 
              style={{
                backgroundColor: template.backgroundColor,
                aspectRatio: template.aspectRatio
              }}
            >
              {template.imageUrl ? (
                <div className="template-image-container">
                  <img 
                    src={template.imageUrl} 
                    alt={template.name} 
                    className="template-image"
                  />
                  <div className="template-text-overlay">
                    <h3>{template.name}</h3>
                  </div>
                </div>
              ) : (
                <h3>{template.name}</h3>
              )}
            </div>
            <p>{template.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;
