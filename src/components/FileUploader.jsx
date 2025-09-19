import React, { useState } from 'react';

const FileUploader = ({ onFileProcessed }) => {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          // Assuming GeoJSON for now, will need to handle other formats
          const parsedData = JSON.parse(content);
          onFileProcessed(parsedData);
        } catch (error) {
          console.error("Error reading or parsing file:", error);
          alert("Failed to read or parse file. Please ensure it's a valid JSON/GeoJSON file.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="file-uploader-container">
      <input type="file" id="fileInput" onChange={handleFileChange} accept=".geojson,.json" />
      <label htmlFor="fileInput" className="file-upload-button">
        Choose File
      </label>
      {fileName && <span className="file-name">Selected: {fileName}</span>}
    </div>
  );
};

export default FileUploader;
