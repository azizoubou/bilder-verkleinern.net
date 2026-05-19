import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import './DropZone.css';

interface DropZoneProps {
  onFilesSelect: (files: File[]) => void;
  translations: {
    title: string;
    sub: string;
    hint: string;
  };
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesSelect, translations }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        onFilesSelect(files);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
    }
  };

  return (
    <div 
      className={`drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />
      <div className="drop-zone-content">
        {isDragging ? (
          <Upload size={48} className="icon bounce" />
        ) : (
          <ImageIcon size={48} className="icon" />
        )}
        <h3>{translations.title}</h3>
        <p>{translations.sub}</p>
        <span className="hint">{translations.hint}</span>
      </div>
    </div>
  );
};

export default DropZone;
