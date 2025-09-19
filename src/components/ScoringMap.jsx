import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function ScoringMap({ scoringResults }) {
  const [projectGeoJSON, setProjectGeoJSON] = useState(null);
  const [mergedGeoJSON, setMergedGeoJSON] = useState(null);

  useEffect(() => {
    // Fetch projects.geojson
    fetch("/stbg_projects_test/projects.geojson")
      .then((response) => response.json())
      .then((data) => {
        setProjectGeoJSON(data);
      })
      .catch((error) =>
        console.error("Error fetching projects.geojson:", error)
      );
  }, []);

  useEffect(() => {
    if (projectGeoJSON && scoringResults && scoringResults.rows.length > 0) {
      const mergedFeatures = projectGeoJSON.features.map((feature) => {
        const projectId = feature.properties.project_id;
        const score = scoringResults.rows.find(
          (row) => Number(row.project_id) === projectId
        );

        // Use geometry_x and geometry_y if available, otherwise use existing geometry
        const geometry = {
          type: "Point",
          coordinates: [
            score?.geometry_y
              ? parseFloat(score.geometry_y)
              : feature.geometry.coordinates[0],
            score?.geometry_x
              ? parseFloat(score.geometry_x)
              : feature.geometry.coordinates[1],
          ],
        };

        const mergedProperties = {
          ...feature.properties,
          safety_freq: score?.safety_freq || 0,
          safety_rate: score?.safety_rate || 0,
          cong_demand: score?.cong_demand || 0,
          cong_los: score?.cong_los || 0,
          jobs_pc: score?.jobs_pc || 0,
          jobs_pc_ej: score?.jobs_pc_ej || 0,
          access_nw_norm: score?.access_nw_norm || 0,
          access_nw_ej_norm: score?.access_nw_ej_norm || 0,
          benefit: score
            ? score.safety_freq +
              score.safety_rate +
              score.cong_demand +
              score.cong_los +
              score.jobs_pc +
              score.jobs_pc_ej +
              score.access_nw_norm +
              score.access_nw_ej_norm
            : 0,
          bcr: score?.bcr || 0,
          rank: score?.rank || 0,
        };
        return {
          ...feature,
          geometry: geometry,
          properties: mergedProperties,
        };
      });
      setMergedGeoJSON({ ...projectGeoJSON, features: mergedFeatures });
    }
  }, [projectGeoJSON, scoringResults]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      let popupContent = `
        <b>Project ID:</b> ${feature.properties.project_id}<br/>
        <b>Type:</b> ${feature.properties.type || "N/A"}<br/>
        <b>County:</b> ${feature.properties.county || "N/A"}<br/>
        <br/>
        <b>Scores:</b><br/>
        • Safety Frequency: ${
          feature.properties.safety_freq?.toFixed(2) || "0.00"
        }<br/>
        • Safety Rate: ${
          feature.properties.safety_rate?.toFixed(2) || "0.00"
        }<br/>
        • Congestion Demand: ${
          feature.properties.cong_demand?.toFixed(2) || "0.00"
        }<br/>
        • Congestion LOS: ${
          feature.properties.cong_los?.toFixed(2) || "0.00"
        }<br/>
        • Jobs Access: ${feature.properties.jobs_pc?.toFixed(2) || "0.00"}<br/>
        • Jobs Access (EJ): ${
          feature.properties.jobs_pc_ej?.toFixed(2) || "0.00"
        }<br/>
        • Non-work Access: ${
          feature.properties.access_nw_norm?.toFixed(2) || "0.00"
        }<br/>
        • Non-work Access (EJ): ${
          feature.properties.access_nw_ej_norm?.toFixed(2) || "0.00"
        }<br/>
        <br/>
        <b>Rankings:</b><br/>
        • Total Benefit Score: ${
          feature.properties.benefit?.toFixed(2) || "0.00"
        }<br/>
        • Benefit-Cost Ratio: ${
          feature.properties.bcr?.toFixed(2) || "0.00"
        }<br/>
        • Rank: ${feature.properties.rank || "N/A"}<br/>
        <br/>
        <b>Location:</b><br/>
        • Coordinates: [${
          feature.geometry.coordinates[1]?.toFixed(5) || "N/A"
        }, 
                       ${feature.geometry.coordinates[0]?.toFixed(5) || "N/A"}]
        }<br/>
        <b>Cost (Millions):</b> $${
          feature.properties.cost_mil?.toFixed(2) || "0.00"
        }<br/>
      `;
      layer.bindPopup(popupContent);
    }
  };

  // Determine map center and zoom based on mergedGeoJSON bounds
  const getMapBounds = () => {
    if (mergedGeoJSON) {
      const latLngs = mergedGeoJSON.features.flatMap((feature) => {
        if (feature.geometry.type === "Point") {
          return [
            [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
          ];
        } else if (
          feature.geometry.type === "LineString" ||
          feature.geometry.type === "MultiPoint"
        ) {
          return feature.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]);
        } else if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiLineString"
        ) {
          return feature.geometry.coordinates.flatMap((ring) =>
            ring.map((coord) => [coord[1], coord[0]])
          );
        } else if (feature.geometry.type === "MultiPolygon") {
          return feature.geometry.coordinates.flatMap((polygon) =>
            polygon.flatMap((ring) => ring.map((coord) => [coord[1], coord[0]]))
          );
        }
        return [];
      });
      if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        return bounds;
      }
    }
    return [
      [37.0, -77.0],
      [37.5, -77.5],
    ]; // Default bounds if no data
  };

  const bounds = getMapBounds();

  return (
    <div className="map-container" style={{ height: "500px", width: "100%" }}>
      {mergedGeoJSON ? (
        <MapContainer
          bounds={bounds}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <GeoJSON data={mergedGeoJSON} onEachFeature={onEachFeature} />
        </MapContainer>
      ) : (
        <p>Loading map data...</p>
      )}
    </div>
  );
}

export default ScoringMap;
