import React from 'react';

const ResultsTable = ({ data: { headers, rows } }) => {
  if (!rows || rows.length === 0) {
    return <p>No data to display.</p>;
  }

  return (
    <div className="results-table-container">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={`${rowIndex}-${colIndex}`}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
