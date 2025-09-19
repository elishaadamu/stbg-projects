import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ResultsTable from "./components/ResultsTable";
import Navbar from "./components/Navbar";
import ScoringResultsPage from "./components/ScoringResultsPage"; // Import the new component
import "./App.css"; // Import the CSS file

const stbgProjects = [
  "crashes.geojson",
  "hopewell_fhz.geojson",
  "hopewell_frsk.geojson",
  "hopewell_wet.geojson",
  "nw.geojson",
  "pop_emp_df.geojson",
  "projects.geojson",
  "stbg_aadt.geojson",
  "t6.geojson",
];

function HomePage() {
  const [fullTableData, setFullTableData] = useState({ headers: [], rows: [] });
  const [processedData, setProcessedData] = useState({ headers: [], rows: [] });
  const [selectedFile, setSelectedFile] = useState("nw.geojson");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  useEffect(() => {
    if (selectedFile) {
      fetch(`/stbg_projects_test/${selectedFile}`)
        .then((response) => response.json())
        .then((data) => {
          handleFileProcessed(data);
          setCurrentPage(1); // Reset to first page on new file selection
        })
        .catch((error) => console.error("Error fetching file:", error));
    }
  }, [selectedFile]);

  useEffect(() => {
    const { headers, rows } = fullTableData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRows = rows.slice(startIndex, endIndex);
    setProcessedData({ headers, rows: currentRows });
  }, [fullTableData, currentPage]);

  const handleFileProcessed = (data) => {
    let headers = [];
    let tableRows = [];

    if (data && data.type === "FeatureCollection" && data.features) {
      const allKeys = new Set();
      allKeys.add("geometry_type");
      allKeys.add("coordinates");

      data.features.forEach((feature) => {
        Object.keys(feature.properties).forEach((key) => allKeys.add(key));
      });
      headers = Array.from(allKeys);
      tableRows = data.features.map((feature) => ({
        ...feature.properties,
        geometry_type: feature.geometry.type,
        coordinates: JSON.stringify(feature.geometry.coordinates),
      }));
    } else if (Array.isArray(data)) {
      headers = data.length > 0 ? Object.keys(data[0]) : [];
      tableRows = data;
    } else {
      headers = Object.keys(data || {});
      tableRows = [data];
    }
    setFullTableData({ headers, rows: tableRows });
  };

  const totalPages = Math.ceil(fullTableData.rows.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="home-page-content">
      <h1>File Processor and Data Analyzer</h1>
      <div className="select-container">
        <select
          className="file-select"
          onChange={(e) => setSelectedFile(e.target.value)}
          value={selectedFile}
        >
          <option value="" disabled>
            Select a file
          </option>
          {stbgProjects.map((file) => (
            <option key={file} value={file}>
              {file}
            </option>
          ))}
        </select>
      </div>

      {fullTableData.rows.length > 0 && (
        <div className="pagination-controls">
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {processedData.rows && processedData.rows.length > 0 && (
        <ResultsTable data={processedData} />
      )}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scoring-results" element={<ScoringResultsPage />} />
      </Routes>
    </div>
  );
}

export default App;
