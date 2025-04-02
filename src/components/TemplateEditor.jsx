import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Trash2, Plus, Image as ImageIcon, Share2, Square, Circle, Triangle } from 'lucide-react';

const TemplateEditor = ({ template, onBack }) => {
  const [backgroundColor, setBackgroundColor] = useState(template.backgroundColor);
  const [templateWidth, setTemplateWidth] = useState(template.width);
  const [templateHeight, setTemplateHeight] = useState(template.height);
  const [backgroundImage, setBackgroundImage] = useState(template.imageUrl || null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState(template.previewElements || [
    {
      id: Date.now(),
      type: 'text',
      text: template.defaultText,
      color: '#000000',
      fontSize: 36,
      position: { x: 0, y: 0 }
    }
  ]);
  
  const [draggedElement, setDraggedElement] = useState(null);
  const [resizingElement, setResizingElement] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const templateRef = useRef(null);
  const fileInputRef = useRef(null);
  const backgroundFileInputRef = useRef(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Retrieve email from localStorage (simulating login context)
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const handleDownload = () => {
    if (templateRef.current) {
      toPng(templateRef.current, { 
        cacheBust: true,
        width: templateWidth,
        height: templateHeight 
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${template.name}_template.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Download failed', err);
        });
    }
  };

  const handleShareViaEmail = async () => {
    setShareError('');
    setShareSuccess('');

    
    if (!userEmail) {
      setShareError('No email found. Please log in.');
      return;
    }

    
    if (isSharing) return;

    setIsSharing(true);

    try {
      const dataUrl = await toPng(templateRef.current, { 
        cacheBust: true,
        width: templateWidth,
        height: templateHeight 
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, `${template.name}_template.png`);
      formData.append('email', userEmail);
      const emailResponse = await fetch('http://localhost:5055/sendemail', {
        method: 'POST',
        body: formData
      });

      const result = await emailResponse.json();
      if (result.success) {
        setShareSuccess(result.message);
      } else {
        setShareError(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Share failed', error);
      setShareError('Failed to share template: ' + error.message);
    } finally {
      setIsSharing(false);
    }
  };
  const addTextElement = () => {
    const newTextElement = {
      id: Date.now(),
      type: 'text',
      text: 'New Text',
      color: '#000000',
      fontSize: 36,
      position: { x: 50, y: 50 }
    };
    setElements([...elements, newTextElement]);
  };

  const addShapeElement = (shapeType) => {
    const newShapeElement = {
      id: Date.now(),
      type: 'shape',
      shapeType: shapeType, // 'rectangle', 'circle', 'triangle'
      width: 100,
      height: 100,
      backgroundColor: '#e2e2e2',
      borderColor: '#000000',
      borderWidth: 1,
      borderRadius: shapeType === 'circle' ? 50 : 0,
      position: { x: 50, y: 50 },
      rotation: 0
    };
    setElements([...elements, newShapeElement]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImageElement = {
          id: Date.now(),
          type: 'image',
          src: event.target.result,
          width: 200,
          height: 200,
          position: { x: 50, y: 50 }
        };
        setElements([...elements, newImageElement]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    setBackgroundImage(null);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(element => 
      element.id === id ? { ...element, ...updates } : element
    ));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(element => element.id !== id));
  };

  
  const handleMouseDown = (e, element) => {
    e.preventDefault();
    
    const templateRect = templateRef.current.getBoundingClientRect();
    const offsetX = e.clientX - (element.position.x + templateRect.left);
    const offsetY = e.clientY - (element.position.y + templateRect.top);
  
    setDraggedElement({
      ...element,
      offsetX,
      offsetY
    });
    
    // Set this as the selected element
    setSelectedElement(element.id);
  };
  const handleResizeStart = (e, element, direction) => {
    e.preventDefault();
    e.stopPropagation();
    
    const templateRect = templateRef.current.getBoundingClientRect();
    
    setResizingElement({
      ...element,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: element.width || 200,
      startHeight: element.height || 200,
      startLeft: element.position.x,
      startTop: element.position.y
    });
    
    setResizeDirection(direction);
  };

  const handleMouseMove = (e) => {
    if (draggedElement) {
      const templateRect = templateRef.current.getBoundingClientRect();
      const newX = e.clientX - draggedElement.offsetX - templateRect.left;
      const newY = e.clientY - draggedElement.offsetY - templateRect.top;
      let elementWidth = 200;
      let elementHeight = 50;
  
      if (draggedElement.type === 'image' || draggedElement.type === 'shape') {
        elementWidth = draggedElement.width;
        elementHeight = draggedElement.height;
      } else if (draggedElement.type === 'text') {
        // Approximate width for text
        elementWidth = draggedElement.text.length * (draggedElement.fontSize * 0.6);
        elementHeight = draggedElement.fontSize * 1.2;
      }
  
      updateElement(draggedElement.id, {
        position: {
          x: Math.max(0, Math.min(newX, templateWidth - elementWidth)),
          y: Math.max(0, Math.min(newY, templateHeight - elementHeight))
        }
      });
    }
    
  
    if (resizingElement && resizeDirection) {
      const dx = e.clientX - resizingElement.startX;
      const dy = e.clientY - resizingElement.startY;
      
      let newWidth = resizingElement.startWidth;
      let newHeight = resizingElement.startHeight;
      let newX = resizingElement.startLeft;
      let newY = resizingElement.startTop;
      
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(50, resizingElement.startWidth + dx);
      }
      if (resizeDirection.includes('w')) {
        const calculatedWidth = Math.max(50, resizingElement.startWidth - dx);
        newX = resizingElement.startLeft + (resizingElement.startWidth - calculatedWidth);
        newWidth = calculatedWidth;
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(50, resizingElement.startHeight + dy);
      }
      if (resizeDirection.includes('n')) {
        const calculatedHeight = Math.max(50, resizingElement.startHeight - dy);
        newY = resizingElement.startTop + (resizingElement.startHeight - calculatedHeight);
        newHeight = calculatedHeight;
      }
      
      // Ensure element stays within template boundaries
      newX = Math.max(0, Math.min(newX, templateWidth - newWidth));
      newY = Math.max(0, Math.min(newY, templateHeight - newHeight));
      
      // Update element with new dimensions and position
      updateElement(resizingElement.id, {
        width: newWidth,
        height: newHeight,
        position: { x: newX, y: newY }
      });
    }
  };
  
  const handleMouseUp = () => {
    setDraggedElement(null);
    setResizingElement(null);
    setResizeDirection(null);
  };

const handleTemplateClick = (e) => {
  // If clicking directly on the template (not on an element)
  if (e.target === templateRef.current) {
    setSelectedElement(null);
  }
};

const ResizeHandles = ({ element }) => {
  // Only show resize handles if this element is selected
  if (selectedElement !== element.id) {
    return null;
  }
  
  const handlePositions = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
  
  return (
    <>
      {handlePositions.map(position => (
        <div
          key={position}
          className={`resize-handle resize-handle-${position}`}
          style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #000000',
            position: 'absolute',
            cursor: `${position}-resize`,
            ...(position.includes('n') ? { top: '-5px' } : {}),
            ...(position.includes('s') ? { bottom: '-5px' } : {}),
            ...(position.includes('e') ? { right: '-5px' } : {}),
            ...(position.includes('w') ? { left: '-5px' } : {}),
            ...(position === 'n' || position === 's' ? { left: 'calc(50% - 5px)' } : {}),
            ...(position === 'e' || position === 'w' ? { top: 'calc(50% - 5px)' } : {}),
            ...(position === 'ne' ? { top: '-5px', right: '-5px' } : {}),
            ...(position === 'se' ? { bottom: '-5px', right: '-5px' } : {}),
            ...(position === 'sw' ? { bottom: '-5px', left: '-5px' } : {}),
            ...(position === 'nw' ? { top: '-5px', left: '-5px' } : {}),
            zIndex: 10
          }}
          onMouseDown={(e) => handleResizeStart(e, element, position)}
        />
      ))}
    </>
  );
};
  
  const renderShape = (element) => {
    const commonStyles = {
      position: 'absolute',
      cursor: 'move',
      userSelect: 'none',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      backgroundColor: element.backgroundColor,
      border: `${element.borderWidth}px solid ${element.borderColor}`,
      borderRadius: element.shapeType === 'circle' ? '50%' : `${element.borderRadius}px`,
      transform: `rotate(${element.rotation || 0}deg)`
    };
    
    switch (element.shapeType) {
      case 'triangle':
       
        return (
          <div
            style={{
              ...commonStyles,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              borderRadius: 0 
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <ResizeHandles element={element} />
          </div>
        );
      case 'rectangle':
      case 'circle':
      default:
        return (
          <div 
            style={commonStyles}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <ResizeHandles element={element} />
          </div>
        );
    }
  };

  useEffect(() => {
   
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedElement, resizingElement, resizeDirection]);

  return (
    <div className="template-editor">
      <div className="editor-controls">
        <button onClick={onBack} className="back-button">← Back to Gallery</button>
        
        <div className="control-section">
          <h3>Template Size</h3>
          <div className="size-controls">
            <label>
              Width:
              <input 
                type="number" 
                value={templateWidth}
                onChange={(e) => setTemplateWidth(parseInt(e.target.value))}
                min="100"
                max="2000"
              />
            </label>
            <label>
              Height:
              <input 
                type="number" 
                value={templateHeight}
                onChange={(e) => setTemplateHeight(parseInt(e.target.value))}
                min="100"
                max="2000"
              />
            </label>
          </div>
        </div>

        <div className="control-section">
          <h3>Background</h3>
          <div className="background-controls">
            <div className="color-picker">
              <input 
                type="color" 
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
              <label>Background Color</label>
            </div>
            
            <div className="background-image-controls">
              <button 
                onClick={() => backgroundFileInputRef.current.click()}
                className="add-element-button"
                title="Upload Background Image"
              >
                <ImageIcon size={16} /> Upload Background
              </button>
              <input 
                type="file" 
                ref={backgroundFileInputRef}
                onChange={handleBackgroundImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              {backgroundImage && (
                <button 
                  onClick={removeBackgroundImage}
                  className="delete-element-button"
                  title="Remove Background Image"
                >
                  <Trash2 size={16} /> Remove Image
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>Add Elements</h3>
          <div className="element-buttons">
            <button 
              onClick={addTextElement} 
              className="add-element-button"
              title="Add Text"
            >
              <Plus size={16} /> Text
            </button>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="add-element-button"
              title="Upload Image"
            >
              <ImageIcon size={16} /> Image
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            
            {/* Shape Buttons */}
            <button 
              onClick={() => addShapeElement('rectangle')} 
              className="add-element-button"
              title="Add Rectangle"
            >
              <Square size={16} /> Rectangle
            </button>
            <button 
              onClick={() => addShapeElement('circle')} 
              className="add-element-button"
              title="Add Circle"
            >
              <Circle size={16} /> Circle
            </button>
            <button 
              onClick={() => addShapeElement('triangle')} 
              className="add-element-button"
              title="Add Triangle"
            >
              <Triangle size={16} /> Triangle
            </button>
          </div>
        </div>

        <div className="control-section">
          <h3>Element Properties</h3>
          {elements.map((element) => (
            <div key={element.id} className="element-controls">
              {element.type === 'text' ? (
                <>
                  <input 
                    type="text" 
                    value={element.text}
                    onChange={(e) => updateElement(element.id, { text: e.target.value })}
                    placeholder="Enter text"
                  />
                  <div className="text-styling-controls">
                    <input 
                      type="color" 
                      value={element.color}
                      onChange={(e) => updateElement(element.id, { color: e.target.value })}
                    />
                    <input 
                      type="range" 
                      min="12" 
                      max="72" 
                      value={element.fontSize}
                      onChange={(e) => updateElement(element.id, { fontSize: parseInt(e.target.value) })}
                    />
                    <span>{element.fontSize}px</span>
                  </div>
                </>
              ) : element.type === 'image' ? (
                <div className="image-controls">
                  <input 
                    type="number"
                    value={element.width}
                    onChange={(e) => updateElement(element.id, { width: parseInt(e.target.value) })}
                    placeholder="Width"
                    min="50"
                    max="500"
                  />
                  <input 
                    type="number"
                    value={element.height}
                    onChange={(e) => updateElement(element.id, { height: parseInt(e.target.value) })}
                    placeholder="Height"
                    min="50"
                    max="500"
                  />
                </div>
              ) : element.type === 'shape' && (
                <div className="shape-controls">
                  <div className="shape-size-controls">
                    <label>
                      W:
                      <input 
                        type="number"
                        value={element.width}
                        onChange={(e) => updateElement(element.id, { width: parseInt(e.target.value) })}
                        min="20"
                        max="500"
                      />
                    </label>
                    <label>
                      H:
                      <input 
                        type="number"
                        value={element.height}
                        onChange={(e) => updateElement(element.id, { height: parseInt(e.target.value) })}
                        min="20"
                        max="500"
                      />
                    </label>
                  </div>
                  <div className="shape-style-controls">
                    <label>
                      Fill:
                      <input 
                        type="color"
                        value={element.backgroundColor}
                        onChange={(e) => updateElement(element.id, { backgroundColor: e.target.value })}
                      />
                    </label>
                    <label>
                      Border:
                      <input 
                        type="color"
                        value={element.borderColor}
                        onChange={(e) => updateElement(element.id, { borderColor: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="shape-border-controls">
                    <label>
                      Border Width:
                      <input 
                        type="range"
                        min="0"
                        max="10"
                        value={element.borderWidth}
                        onChange={(e) => updateElement(element.id, { borderWidth: parseInt(e.target.value) })}
                      />
                      <span>{element.borderWidth}px</span>
                    </label>
                    {element.shapeType !== 'circle' && element.shapeType !== 'triangle' && (
                      <label>
                        Border Radius:
                        <input 
                          type="range"
                          min="0"
                          max="50"
                          value={element.borderRadius}
                          onChange={(e) => updateElement(element.id, { borderRadius: parseInt(e.target.value) })}
                        />
                        <span>{element.borderRadius}px</span>
                      </label>
                    )}
                  </div>
                  <div className="shape-rotation-control">
                    <label>
                      Rotation:
                      <input 
                        type="range"
                        min="0"
                        max="360"
                        value={element.rotation || 0}
                        onChange={(e) => updateElement(element.id, { rotation: parseInt(e.target.value) })}
                      />
                      <span>{element.rotation || 0}°</span>
                    </label>
                  </div>
                </div>
              )}
              <button 
                onClick={() => deleteElement(element.id)}
                className="delete-element-button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="share-section">
          {/* Error and Success Messages */}
          {shareError && (
            <div className="alert alert-error">
              {shareError}
            </div>
          )}
          {shareSuccess && (
            <div className="alert alert-success">
              {shareSuccess}
            </div>
          )}

          <div className="download-share-buttons">
            <button 
              onClick={handleDownload} 
              className="download-button"
              disabled={isSharing}
            >
              Download Template
            </button>
            <div className="email-display">
              <span>Sharing to: {userEmail || 'No email configured'}</span>
            </div>
            <button 
              onClick={handleShareViaEmail} 
              className="download-button"
              disabled={isSharing || !userEmail}
            >
              <Share2 size={16} /> Share Email
            </button>
          </div>
        </div>
      </div>

      <div 
      ref={templateRef}
      className="template-preview-editor"
      style={{
        backgroundColor,
        width: `${templateWidth}px`,
        height: `${templateHeight}px`,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      onClick={handleTemplateClick}
    >
        {elements.map((element) => {
          if (element.type === 'text') {
            return (
              <h1 
                key={element.id}
                style={{
                  color: element.color,
                  fontSize: `${element.fontSize}px`,
                  position: 'absolute',
                  cursor: 'move',
                  userSelect: 'none',
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                  textShadow: backgroundImage ? '0px 0px 5px rgba(255,255,255,0.7)' : 'none'
                }}
                onMouseDown={(e) => handleMouseDown(e, element)}
              >
                {element.text}
              </h1>
            );
          } else if (element.type === 'image') {
            return (
              <div
                key={element.id}
                style={{
                  position: 'absolute',
                  cursor: 'move',
                  userSelect: 'none',
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`
                }}
                onMouseDown={(e) => handleMouseDown(e, element)}
              >
                <img 
                  src={element.src} 
                  alt="Uploaded" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <ResizeHandles element={element} />
              </div>
            );
          } else if (element.type === 'shape') {
            return renderShape(element);
          }
          return null;
        })}
      </div>
      <style jsx>{`
        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: white;
          border: 1px solid black;
          z-index: 100;
        }
        .element-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-bottom: 10px;
        }
        .shape-controls {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .shape-size-controls,
        .shape-style-controls,
        .shape-border-controls {
          display: flex;
          gap: 10px;
        }
        label {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        input[type="number"] {
          width: 60px;
        }
      `}</style>
    </div>
  );
};

export default TemplateEditor;
