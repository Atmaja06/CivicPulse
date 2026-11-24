
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import {
  calculatePriority,
  getPriorityLevel
} from "../utils/priorityScore";

function IssueMap({ issues = [] }) {
  const [selectedIssue, setSelectedIssue] = useState(null);

  const getMarkerColor = (level) => {
    if (level === "High") return "#dc2626";
    if (level === "Medium") return "#f59e0b";
    return "#16a34a";
  };

  const validIssues = issues.filter(
    (issue) =>
      Number.isFinite(Number(issue.latitude)) &&
      Number.isFinite(Number(issue.longitude)) &&
      issue.latitude !== null &&
      issue.longitude !== null
  );

  return (
    <div className="issue-map">
      <h2>Geographical Issue Map</h2>

      <MapContainer
        center={[15.35, 74.0]}
        zoom={9}
        style={{ height: "450px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validIssues.map((issue) => {
          const score = calculatePriority(issue);
          const level = getPriorityLevel(score);

          return (
            <CircleMarker
              key={issue.id}
              center={[
                Number(issue.latitude),
                Number(issue.longitude)
              ]}
              radius={9}
              pathOptions={{
                color: getMarkerColor(level),
                fillColor: getMarkerColor(level),
                fillOpacity: 0.8
              }}
              eventHandlers={{
                click: () => setSelectedIssue(issue)
              }}
            >
              <Popup>
                <strong>
                  {issue.title || issue.category || "Civic Issue"}
                </strong>
                <p>Priority: {level}</p>
                <p>Score: {score}/100</p>
                <p>Status: {issue.status || "Reported"}</p>
                <p>Location: {issue.location || "Not specified"}</p>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="map-legend">
        <span style={{ color: "#dc2626" }}>● High Priority</span>
        <span style={{ color: "#f59e0b" }}>● Medium Priority</span>
        <span style={{ color: "#16a34a" }}>● Low Priority</span>
      </div>

      {validIssues.length === 0 && (
        <p>No issues with valid coordinates are available.</p>
      )}
    </div>
  );
}

export default IssueMap;
