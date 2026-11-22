
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./ReportIssue.css";
import { useCivicPulse } from "../context/CivicPulseContext.jsx";

const DEFAULT_CENTER = [15.4909, 73.8278];

const markerIcon = L.divIcon({
  className: "civic-map-marker",
  html: '<div class="map-pin-outer"><div class="map-pin-inner"></div></div>',
  iconSize: [30, 38],
  iconAnchor: [15, 38],
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        label: "Selected map location",
      });
    },
  });

  return null;
}

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 0.8 });
    }
  }, [center, map]);

  return null;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Unable to read the selected image."));

    reader.readAsDataURL(file);
  });
}

// Frontend demo writing assistant.
// It improves the wording without adding new incident details.
function createSuggestedDescription(notes) {
  const cleanedNotes = notes.trim().replace(/\s+/g, " ");

  if (!cleanedNotes) return "";

  const capitalized =
    cleanedNotes.charAt(0).toUpperCase() + cleanedNotes.slice(1);

  const finishedText = /[.!?]$/.test(capitalized)
    ? capitalized
    : `${capitalized}.`;

  return `I would like to report the following civic issue: ${finishedText} Kindly inspect the issue and take the necessary action.`;
}

function ReportIssue({ navigate }) {
  const { setComplaints, addNotification } = useCivicPulse();

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    anonymous: false,
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [location, setLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaintId, setSubmittedComplaintId] = useState("");
  const [aiMessage, setAiMessage] = useState("");

  useEffect(() => {
    if (!photo) {
      setPreview("");
      return;
    }

    const imageUrl = URL.createObjectURL(photo);
    setPreview(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [photo]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");

    if (name === "description") {
      setAiMessage("");
    }
  };

  const handleAIWrite = () => {
    if (!form.description.trim()) {
      setAiMessage(
        "First, enter a few words about the issue. For example: water leaking near the school."
      );
      return;
    }

    const suggestedDescription = createSuggestedDescription(
      form.description
    );

    setForm((previous) => ({
      ...previous,
      description: suggestedDescription,
    }));

    setAiMessage(
      "Your description has been improved. You can edit it before submitting."
    );
    setError("");
  };

  const handlePhoto = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload a valid image.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setPhoto(selectedFile);
    setError("");
  };

  const removePhoto = () => {
    setPhoto(null);

    const input = document.getElementById("issue-photo");
    if (input) input.value = "";

    setError("");
  };

  const handleAnonymousChange = (event) => {
    setForm((previous) => ({
      ...previous,
      anonymous: event.target.checked,
    }));

    setError("");
  };

  const selectLocation = (selectedLocation) => {
    setLocation(selectedLocation);
    setMapCenter([selectedLocation.lat, selectedLocation.lng]);
    setLocationMessage("Issue location selected successfully.");
    setError("");
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Your browser does not support GPS location.");
      return;
    }

    setLocationMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const selectedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Current GPS location",
        };

        selectLocation(selectedLocation);
        setLocationMessage(
          "Your current location has been selected. Move the pin if the issue is elsewhere."
        );
      },
      () => {
        setLocationMessage(
          "Unable to access your location. Please select it manually on the map."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const searchLocation = async () => {
    if (!searchText.trim()) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    setSuggestions([]);
    setLocationMessage("");

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", searchText);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "5");
      url.searchParams.set("countrycodes", "in");

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const results = await response.json();

      setSuggestions(results);

      if (results.length === 0) {
        setLocationMessage("No matching locations found. Try another search.");
      }
    } catch {
      setLocationMessage(
        "Location search is unavailable right now. You can select a location directly on the map."
      );
    } finally {
      setSearching(false);
    }
  };

  const chooseSuggestion = (result) => {
    selectLocation({
      lat: Number(result.lat),
      lng: Number(result.lon),
      label: result.display_name,
    });

    setSearchText(result.display_name);
    setSuggestions([]);
  };

  const handleMarkerDrag = (event) => {
    const coordinates = event.target.getLatLng();

    selectLocation({
      lat: coordinates.lat,
      lng: coordinates.lng,
      label: "Manually adjusted map location",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter an issue title.");
      return;
    }

    if (!form.category) {
      setError("Please select an issue category.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please describe the civic issue.");
      return;
    }

    if (!location) {
      setError("Please select the issue location on the map.");
      return;
    }

    if (form.anonymous && !photo) {
      setError("A photograph is compulsory for Anonymous Voice reports.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const photoUrl = await fileToDataUrl(photo);
      const complaintId = `CP-${Date.now()}`;
      const submittedAt = new Date().toISOString();

      const newComplaint = {
        id: complaintId,
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        anonymous: form.anonymous,
        location: {
          lat: location.lat,
          lng: location.lng,
          label: location.label,
        },
        photoUrl,
        status: "Submitted",
        priority: "Pending assessment",
        department: "Unassigned",
        resolutionRemarks: "",
        resolutionPhotoUrl: "",
        citizenVerification: "Pending",
        createdAt: submittedAt,
        submittedAt,
        activity: [
          {
            message: "Complaint submitted successfully.",
            date: submittedAt,
          },
        ],
      };

      // Add the complaint to the shared CivicPulse data.
      setComplaints((previous) => [...previous, newComplaint]);

      // Notify the authority about the newly submitted complaint.
      addNotification({
        recipient: "authority",
        type: "new_complaint",
        title: "New complaint received",
        message: `${newComplaint.title} has been submitted and is awaiting assessment.`,
        complaintId,
      });

      setSubmittedComplaintId(complaintId);
      setSubmitted(true);
    } catch {
      setError("Your photograph could not be processed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      category: "",
      description: "",
      anonymous: false,
    });

    setPhoto(null);
    setLocation(null);
    setMapCenter(DEFAULT_CENTER);
    setSearchText("");
    setSuggestions([]);
    setLocationMessage("");
    setError("");
    setAiMessage("");
    setSubmitted(false);
    setSubmittedComplaintId("");

    const input = document.getElementById("issue-photo");
    if (input) input.value = "";
  };

  const anonymousPhotoMissing = form.anonymous && !photo;

  return (
    <div className="report-page">
      <div className="report-heading">
        <button
          className="back-link"
          type="button"
          onClick={() => navigate("home")}
        >
          ← Back to Home
        </button>

        <span className="report-eyebrow">CITIZEN SERVICES</span>
        <h1>Report a Civic Issue</h1>

        <p>
          Help improve your neighbourhood by bringing civic problems
          to the attention of the concerned authorities.
        </p>
      </div>

      {submitted ? (
        <div className="report-success">
          <div className="success-icon">✓</div>

          <span className="report-eyebrow">REPORT SUBMITTED</span>
          <h2>Your complaint has been recorded!</h2>

          <p>
            Your report is now available in CivicPulse. You can track
            its status and view updates from the complaint tracking page.
          </p>

          <div className="success-location">
            <strong>Your Complaint ID</strong>
            <span>{submittedComplaintId}</span>
            <strong>Selected issue location</strong>
            <span>Latitude: {location.lat.toFixed(6)}</span>
            <span>Longitude: {location.lng.toFixed(6)}</span>
          </div>

          <div className="success-actions">
            <button
              className="report-submit-btn"
              type="button"
              onClick={() => navigate("track")}
            >
              Track My Complaint
            </button>

            <button
              className="report-outline-btn"
              type="button"
              onClick={resetForm}
            >
              Create Another Report
            </button>

            <button
              className="report-outline-btn"
              type="button"
              onClick={() => navigate("home")}
            >
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        <form className="report-form" onSubmit={handleSubmit}>
          <div
            className={`anonymous-panel ${
              form.anonymous ? "selected" : ""
            }`}
          >
            <div className="anonymous-info">
              <div className="anonymous-icon">🔒</div>

              <div>
                <h3>Anonymous Voice</h3>
                <p>
                  Raise a civic concern without displaying your identity
                  publicly.
                </p>
              </div>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={handleAnonymousChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {form.anonymous && (
            <div className="anonymous-notice">
              <strong>Important:</strong> A photograph is compulsory
              for Anonymous Voice reports. Your identity will not be
              displayed publicly. Platform-level records may still be
              retained for security and accountability.
            </div>
          )}

          <div className="form-section">
            <div className="form-section-heading">
              <span className="form-step">01</span>
              <div>
                <h2>Issue Details</h2>
                <p>Tell us what is happening.</p>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="issue-title">
                Issue Title <span>*</span>
              </label>

              <input
                id="issue-title"
                type="text"
                name="title"
                placeholder="Example: Damaged road near the market"
                value={form.title}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="form-field">
              <label htmlFor="issue-category">
                Issue Category <span>*</span>
              </label>

              <select
                id="issue-category"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select an issue category</option>
                <option value="Roads and Infrastructure">
                  Roads and Infrastructure
                </option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Sanitation and Drainage">
                  Sanitation and Drainage
                </option>
                <option value="Streetlights">Streetlights</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginBottom: "9px",
                }}
              >
                <label
                  htmlFor="issue-description"
                  style={{ marginBottom: 0 }}
                >
                  Description <span>*</span>
                </label>

                <button
                  type="button"
                  onClick={handleAIWrite}
                  style={{
                    border: "1px solid #c9dfb9",
                    borderRadius: "8px",
                    padding: "8px 13px",
                    background: "#edf5e5",
                    color: "#246a45",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  ✦ AI Write
                </button>
              </div>

              <textarea
                id="issue-description"
                name="description"
                placeholder="Not sure what to write? Just enter a few words about the problem. Example: garbage piling up near the bus stop..."
                rows={5}
                value={form.description}
                onChange={handleChange}
                maxLength={1000}
              />

              <small>
                {form.description.length}/1000 characters
              </small>

              {aiMessage && (
                <p
                  role="status"
                  style={{
                    marginTop: "9px",
                    color: "#27845b",
                    fontSize: "11px",
                    lineHeight: 1.6,
                  }}
                >
                  ✦ {aiMessage}
                </p>
              )}

              <small>
                AI Write is currently a frontend demo. Always review the
                suggested description and make sure it accurately describes
                your issue.
              </small>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-heading">
              <span className="form-step">02</span>
              <div>
                <h2>Pinpoint the Issue Location</h2>
                <p>
                  Select where the problem actually exists, not
                  necessarily where you are right now.
                </p>
              </div>
            </div>

            <div className="map-search-form">
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    searchLocation();
                  }
                }}
                placeholder="Search area, street or landmark..."
                aria-label="Search for a location"
              />

              <button
                type="button"
                onClick={searchLocation}
                disabled={searching}
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="location-suggestions">
                {suggestions.map((result) => (
                  <button
                    type="button"
                    key={result.place_id}
                    onClick={() => chooseSuggestion(result)}
                  >
                    <span>📍</span>
                    <span>{result.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className="current-location-btn"
              onClick={useCurrentLocation}
            >
              <span>◎</span> Use My Current Location
            </button>

            <div className="map-instructions">
              <span>📍</span>
              Click anywhere on the map to place the pin. You can
              also drag the pin to adjust its position.
            </div>

            <div className="issue-map">
              <MapContainer
                center={DEFAULT_CENTER}
                zoom={11}
                scrollWheelZoom={true}
                className="leaflet-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onSelect={selectLocation} />
                <MapUpdater center={mapCenter} />

                {location && (
                  <Marker
                    position={[location.lat, location.lng]}
                    icon={markerIcon}
                    draggable={true}
                    eventHandlers={{
                      dragend: handleMarkerDrag,
                    }}
                  />
                )}
              </MapContainer>
            </div>

            {location ? (
              <div className="selected-location">
                <div className="selected-location-icon">✓</div>

                <div>
                  <strong>Issue location selected</strong>
                  <span>
                    Latitude: {location.lat.toFixed(6)} ·
                    Longitude: {location.lng.toFixed(6)}
                  </span>
                  <small>{location.label}</small>
                </div>
              </div>
            ) : (
              <div className="location-not-selected">
                No location selected yet. Click on the map or use
                the search or GPS option.
              </div>
            )}

            {locationMessage && (
              <p className="location-message" role="status">
                {locationMessage}
              </p>
            )}
          </div>

          <div className="form-section">
            <div className="form-section-heading">
              <span className="form-step">03</span>
              <div>
                <h2>Photographic Evidence</h2>
                <p>
                  Upload a photograph that helps explain the issue.
                </p>
              </div>
            </div>

            <div className="photo-requirement">
              {form.anonymous
                ? "A photograph is mandatory for Anonymous Voice."
                : "A photograph is optional for regular reports."}
            </div>

            {preview ? (
              <div className="photo-preview">
                <img src={preview} alt="Selected issue evidence" />

                <div className="photo-preview-info">
                  <strong>{photo.name}</strong>
                  <span>
                    {(photo.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <button
                  type="button"
                  className="remove-photo"
                  onClick={removePhoto}
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <label className="photo-upload-box" htmlFor="issue-photo">
                <div className="upload-icon">📷</div>
                <strong>Click to upload a photograph</strong>
                <span>PNG, JPG or JPEG · Maximum 10 MB</span>
                <span className="upload-browse">Browse Files</span>
              </label>
            )}

            <input
              id="issue-photo"
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhoto}
              hidden
            />
          </div>

          {error && (
            <div className="form-error" role="alert">
              ⚠ {error}
            </div>
          )}

          <div className="form-footer">
            <p>
              <span>*</span> Required fields
            </p>

            <button
              type="submit"
              className="report-submit-btn"
              disabled={anonymousPhotoMissing || submitting}
            >
              {submitting ? "Submitting..." : "Submit Report"}
              <span>→</span>
            </button>
          </div>

          {anonymousPhotoMissing && (
            <p className="photo-required-message">
              Upload a photograph to enable submission of your
              Anonymous Voice report.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default ReportIssue;
