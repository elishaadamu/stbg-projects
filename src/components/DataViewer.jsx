import React from 'react';

const DataViewer = ({ filePaths }) => {
  const handleFileClick = (filePath) => {
    // In a real application, this would make an API call to a backend
    // to fetch the content of the file and display it.
    alert(`To view the content of ${filePath}, a backend service is required to serve the file.`);
    console.log(`Attempting to view file: ${filePath}`);
  };

  return (
    <div className="data-viewer-container">
      <h2>Available Data Files</h2>
      {filePaths.length > 0 ? (
        <ul>
          {filePaths.map((path, index) => (
            <li key={index}> 
              <button onClick={() => handleFileClick(path)} className="file-view-button">
                {path.split('\\').pop()} {/* Display only the file name */}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No data files found.</p>
      )}
    </div>
  );
};

export default DataViewer;
