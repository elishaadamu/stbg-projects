import React, { useState, useEffect } from "react";
import ResultsTable from "./ResultsTable";
import ScoringMap from "./ScoringMap"; // Import the new map component
import "../App.css"; // Import the CSS file

const scoringResultsData = {
  headers: [
    "project_id",
    "safety_freq",
    "safety_rate",
    "cong_demand",
    "cong_los",
    "jobs_pc",
    "jobs_pc_ej",
    "access_nw_norm",
    "access_nw_ej_norm",
    "type",
    "county",
    "benefit",
    "cost_mil",
    "bcr",
    "rank",
  ],
  rows: [
    {
      project_id: 1,
      safety_freq: 50.000000,
      safety_rate: 50.000000,
      cong_demand: 10.00000,
      cong_los: 0.0,
      jobs_pc: 5.000000,
      jobs_pc_ej: 4.497950,
      access_nw_norm: 5.000000,
      access_nw_ej_norm: 4.677155,
      type: "Highway",
      county: "Hopewell, VA",
      benefit: 129.175105,
      cost_mil: 14.3,
      bcr: 9.033224,
      rank: 1,
    },
    {
      project_id: 3,
      safety_freq: 3.189896,
      safety_rate: 0.119414,
      cong_demand: 3.37701,
      cong_los: 0.0,
      jobs_pc: 0.289369,
      jobs_pc_ej: 4.666751,
      access_nw_norm: 2.886672,
      access_nw_ej_norm: 3.464419,
      type: "Intersection",
      county: "Hopewell, VA",
      benefit: 17.993531,
      cost_mil: 6.7,
      bcr: 2.685602,
      rank: 2,
    },
    {
      project_id: 2,
      safety_freq: 0.000000,
      safety_rate: 0.000000,
      cong_demand: 0.00000,
      cong_los: 0.0,
      jobs_pc: 0.283142,
      jobs_pc_ej: 5.000000,
      access_nw_norm: 3.889575,
      access_nw_ej_norm: 5.000000,
      type: "Intersection",
      county: "Hopewell, VA",
      benefit: 14.172718,
      cost_mil: 5.8,
      bcr: 2.443572,
      rank: 3,
    },
  ],
};

function ScoringResultsPage() {
  const [fullTableData, setFullTableData] = useState({ headers: [], rows: [] });
  const [processedData, setProcessedData] = useState({ headers: [], rows: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'map'
  const itemsPerPage = 100;

  useEffect(() => {
    // Load scoring data directly
    setFullTableData(scoringResultsData);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const { headers, rows } = fullTableData;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRows = rows.slice(startIndex, endIndex);
    setProcessedData({ headers, rows: currentRows });
  }, [fullTableData, currentPage]);

  const totalPages = Math.ceil(fullTableData.rows.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="scoring-results-page">
      <h1>Scoring Results</h1>

      <div className="view-mode-toggle">
        <button
          className={viewMode === "table" ? "active" : ""}
          onClick={() => setViewMode("table")}
        >
          Table View
        </button>
        <button
          className={viewMode === "map" ? "active" : ""}
          onClick={() => setViewMode("map")}
        >
          Map View
        </button>
      </div>

      {viewMode === "table" && (
        <>
          {fullTableData.rows.length > 0 && (
            <div className="pagination-controls">
              <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}

          {processedData.rows && processedData.rows.length > 0 ? (
            <ResultsTable data={processedData} />
          ) : (
            <p>No scoring data to display.</p>
          )}
        </>
      )}

      {viewMode === "map" && (
        <div className="map-container">
          {fullTableData.rows.length > 0 ? (
            <ScoringMap scoringResults={scoringResultsData} />
          ) : (
            <p>Loading map data...</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ScoringResultsPage;
