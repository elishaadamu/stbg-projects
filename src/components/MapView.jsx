import React, { useState, useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
import ProjectPopup from "./ProjectPopup";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const projectTypeColors = {
  Roadway: "#FF6B6B", // Coral Red
  Transit: "#4ECDC4", // Teal
  "Bike/Ped": "#ccd145ff", // Sky Blue
};

const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style=\"background-color: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 1px solid #000;\"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

const getPathsForType = (type) => {
  // This data would ideally come from your GeoJSON or API
  // These are example paths - replace with your actual path data
  const paths = {
    Roadway: [
      [
        [21.438926, -158.185005],
        [21.43887, -158.184642],
      ],
      [
        [21.332594, -157.921314],
        [21.331446, -157.920799],
      ],
    ],
    Transit: [
      [
        [21.406389, -157.937775],
        [21.406233, -157.937431],
      ],
      [
        [21.297222, -157.859167],
        [21.296944, -157.858611],
      ],
    ],
    "Bike/Ped": [
      [
        [21.342778, -157.928889],
        [21.3425, -157.928333],
      ],
      [
        [21.285833, -157.833889],
        [21.285556, -157.833333],
      ],
    ],
  };
  return paths[type] || [];
};

function MapView({
  addComment,
  comments,
  selectedProjectType,
  geoData,
  activeProjectLayers = [],
  selectedFundingSource,
  selectedFundingLayer,
  selectedYearProgrammed,
  selectedProjectTitle,
  isAdmin, // Added isAdmin prop
}) {
  const [filteredData, setFilteredData] = useState(null);
  const [openPopupId, setOpenPopupId] = useState(null); // New state to track open popup
  const [bounds, setBounds] = useState(null);
  const [pathData, setPathData] = useState([]);

  const onClosePopup = () => {
    setOpenPopupId(null);
  };

  useEffect(() => {
    if (geoData && geoData.features) {
      // Filter features based on selectedProjectType and activeProjectLayers
      const filtered = {
        ...geoData,
        features: geoData.features.filter((feature) => {
          const matchesProjectType =
            selectedProjectType === "All" ||
            feature.properties.project_type === selectedProjectType;
          const isLayerActive = activeProjectLayers.includes(
            feature.properties.project_type
          );
          const matchesFundingSource =
            selectedFundingSource === "All" ||
            feature.properties.product === selectedFundingSource;
          const matchesFundingLayer =
            selectedFundingLayer === "All" ||
            feature.properties.product === selectedFundingLayer;

          const matchesProjectTitle =
            selectedProjectTitle.length === 0 ||
            selectedProjectTitle.some(
              (selected) => selected.value === "All" || feature.properties.project_title === selected.value
            );

          return (
            matchesProjectType &&
            isLayerActive &&
            matchesFundingSource &&
            matchesFundingLayer &&
            matchesProjectTitle
          );
        }),
      };

      setFilteredData(filtered);

      // Get all visible paths based on active layers
      const paths = activeProjectLayers.flatMap((layer) => {
        const layerPaths = getPathsForType(layer);
        return layerPaths.map((path) => ({
          coordinates: path,
          type: layer,
        }));
      });
      setPathData(paths);

      // Calculate bounds including both points and paths
      if (filtered.features.length > 0) {
        const points = filtered.features.map((f) => [
          f.geometry.coordinates[1],
          f.geometry.coordinates[0],
        ]);

        // Calculate the center of all points
        const center = points.reduce(
          (acc, curr) => [
            acc[0] + curr[0] / points.length,
            acc[1] + curr[1] / points.length,
          ],
          [0, 0]
        );

        // Calculate the spread to add padding
        const spread = points.reduce(
          (acc, curr) => [
            Math.max(acc[0], Math.abs(curr[0] - center[0])),
            Math.max(acc[1], Math.abs(curr[1] - center[1])),
          ],
          [0, 0]
        );

        // Add padding to the bounds
        const padding = 0.02; // Adjust this value to increase/decrease padding
        setBounds([
          [center[0] - spread[0] - padding, center[1] - spread[1] - padding],
          [center[0] + spread[0] + padding, center[1] + spread[1] + padding],
        ]);
      }
    }
  }, [
    geoData,
    selectedProjectType,
    activeProjectLayers,
    selectedFundingSource,
    selectedFundingLayer,
    selectedYearProgrammed,
    selectedProjectTitle,
  ]);

  const downloadAllProjectsData = () => {
    if (!geoData || !geoData.features || geoData.features.length === 0) {
      toast.error("No project data available to download.");
      return;
    }

    const dataToDownload = geoData.features.map(
      (feature) => feature.properties
    );

    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AllProjects");
    XLSX.writeFile(workbook, `all_projects_data.xlsx`);
    toast.success("All project data downloaded successfully!");
  };

  if (!bounds) {
    return <div>Loading map...</div>;
  }

  return (
    <MapContainer
      bounds={bounds}
      style={{ height: "100%", width: "100%" }}
      zoom={12}
      maxZoom={18}
      minZoom={10}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {/* {isAdmin && ( // Conditionally render for admin
        <button
          onClick={downloadAllProjectsData}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            padding: "8px 12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Download All Projects
        </button>
      )} */}
      {/* Render Polylines for paths */}
      {pathData.map((path, i) => (
        <Polyline
          key={`path-${i}`}
          positions={path.coordinates}
          pathOptions={{
            color: projectTypeColors[path.type],
            weight: 4,
            opacity: 0.8,
          }}
        />
      ))}

      {/* Render both pointer and colored circle markers */}
      {filteredData &&
        filteredData.features.map((feature, i) => (
          <React.Fragment key={`marker-group-${i}`}>
            {/* Pointer Marker */}
            <Marker
              key={`pointer-${i}`}
              position={[
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
              ]}
              icon={DefaultIcon}
              zIndexOffset={1000} // Keep pointer on top
              eventHandlers={{
                click: () => {
                  console.log("Marker clicked, opening popup for project_id:", feature.properties.project_id);
                  setOpenPopupId(feature.properties.project_id);
                },
              }}
            >
              <Tooltip>Project ID: {feature.properties.project_id}</Tooltip>
              <Popup onClose={onClosePopup}>
                <ProjectPopup
                  project={feature.properties}
                  addComment={addComment}
                  comments={comments}
                  onClosePopup={onClosePopup}
                />
              </Popup>
            </Marker>
            {/* Colored Circle Marker */}
            <Marker
              key={`circle-${i}`}
              position={[
                feature.geometry.coordinates[1],
                feature.geometry.coordinates[0],
              ]}
              icon={createCustomIcon(
                projectTypeColors[feature.properties.project_type]
              )}
              zIndexOffset={900} // Keep circle below pointer
            />
          </React.Fragment>
        ))}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </MapContainer>
  );
}

export default MapView;
