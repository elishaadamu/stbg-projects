import React, { useState } from 'react';

const fileTypes = [
  { id: 'projects', label: 'Projects GeoJSON', accept: '.geojson,.json' },
  { id: 'crashes', label: 'Crashes GeoJSON', accept: '.geojson,.json' },
  { id: 'aadt', label: 'AADT GeoJSON', accept: '.geojson,.json' },
  { id: 'pop_emp_df', label: 'Population/Employment GeoJSON', accept: '.geojson,.json' },
  { id: 't6', label: 'Environmental Justice GeoJSON', accept: '.geojson,.json' },
  { id: 'nw', label: 'Non-Work Destinations GeoJSON', accept: '.geojson,.json' },
];

const MultiFileUploader = ({ onAllFilesProcessed }) => {
  const [files, setFiles] = useState({}); // { fileType: fileContent }
  const [fileNames, setFileNames] = useState({}); // { fileType: fileName }

  const handleFileChange = (fileType, event) => {
    const file = event.target.files[0];
    if (file) {
      setFileNames(prev => ({ ...prev, [fileType.id]: file.name }));
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const parsedData = JSON.parse(content);
          setFiles(prev => {
            const newFiles = { ...prev, [fileType.id]: parsedData };
            // Check if all required files are uploaded and parsed
            const allFilesUploaded = fileTypes.every(type => newFiles[type.id]);
            if (allFilesUploaded) {
              onAllFilesProcessed(newFiles);
            }
            return newFiles;
          });
        } catch (error) {
          console.error(`Error reading or parsing ${fileType.label} file:`, error);
          alert(`Failed to read or parse ${fileType.label} file. Please ensure it's a valid JSON/GeoJSON file.`);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="multi-file-uploader-container">
      <h2>Upload Data Files</h2>
      {fileTypes.map((type) => (
        <div key={type.id} className="file-input-group">
          <label htmlFor={`file-input-${type.id}`}>{type.label}:</label>
          <input
            type="file"
            id={`file-input-${type.id}`}
            onChange={(e) => handleFileChange(type, e)}
            accept={type.accept}
          />
          {fileNames[type.id] && <span className="file-name">Selected: {fileNames[type.id]}</span>}
        </div>
      ))}
    </div>
  );
};

export default MultiFileUploader;
