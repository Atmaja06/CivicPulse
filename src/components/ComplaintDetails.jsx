
import { useEffect, useState } from "react";
import { useCivicPulse } from "../context/CivicPulseContext.jsx";
import "./ComplaintDetails.css";

const departments = [
  "Public Works",
  "Sanitation",
  "Water Supply",
  "Electricity",
  "Public Health",
  "Municipal Administration",
];

const statuses = [
  "Submitted",
  "Under Review",
  "In Progress",
  "Resolved",
];

function getLocationLabel(location) {
  if (!location) return "Not provided";
  if (typeof location === "string") return location;
  return location.label || location.address || "Location selected";
}

function getActivityDetails(item) {
  const title = item.title || item.message || "Complaint updated";
  const description = item.description || item.message || "";
  const normalizedTitle = title.toLowerCase();

  let actor = item.actor;

  if (!actor) {
    if (
      normalizedTitle.includes("citizen") ||
      normalizedTitle.includes("submitted") ||
      normalizedTitle.includes("reopening") ||
      normalizedTitle.includes("confirmed")
    ) {
      actor = "Citizen";
    } else {
      actor = "Authority";
    }
  }

  return {
    title,
    description,
    actor,
    date: item.date || item.timestamp || "",
  };
}

function ComplaintDetails({
  complaint = null,
  onBack = () => {},
  onUpdate = () => {},
}) {
  const { addNotification } = useCivicPulse();

  const [priority, setPriority] = useState(complaint?.priority || "Medium");
  const [priorityReason, setPriorityReason] = useState("");
  const [department, setDepartment] = useState(complaint?.department || "");
  const [status, setStatus] = useState(complaint?.status || "Submitted");
  const [resolutionRemarks, setResolutionRemarks] = useState(
    complaint?.resolutionRemarks || ""
  );
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState(
    complaint?.resolutionPhotoUrl || ""
  );
  const [activity, setActivity] = useState(complaint?.activity || []);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPriority(complaint?.priority || "Medium");
    setPriorityReason("");
    setDepartment(complaint?.department || "");
    setStatus(complaint?.status || "Submitted");
    setResolutionRemarks(complaint?.resolutionRemarks || "");
    setResolutionPhotoUrl(complaint?.resolutionPhotoUrl || "");
    setActivity(complaint?.activity || []);
    setMessage("");
  }, [complaint]);

  if (!complaint) {
    return (
      <div className="complaint-details-page">
        <div className="complaint-details-header">
          <button className="back-button" onClick={onBack}>
            ← Back to All Issues
          </button>
          <span className="workflow-label">COMPLAINT MANAGEMENT</span>
        </div>

        <div className="complaint-empty-state">
          <div className="empty-state-icon">📋</div>
          <h2>No complaint selected</h2>
          <p>
            Select a complaint from All Issues to view its details, assign a
            department, update its priority and manage its resolution.
          </p>
          <button className="primary-action" onClick={onBack}>
            Go to All Issues
          </button>
          <span className="empty-state-note">
            No sample complaints have been added.
          </span>
        </div>
      </div>
    );
  }

  const complaintPhoto = complaint.photoUrl || complaint.photo || "";

  const reportedDate =
    complaint.submittedAt ||
    complaint.createdAt ||
    complaint.date ||
    "Not provided";

  const recordActivity = (title, description) => ({
    id: `${Date.now()}-${Math.random()}`,
    title,
    description,
    actor: "Authority",
    date: new Date().toISOString(),
  });

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setResolutionPhotoUrl(reader.result);
      setMessage("Resolution photo selected. Save your changes to share it.");
    };

    reader.onerror = () => {
      setMessage("Could not read the selected photo. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  const handleSave = (event) => {
    event.preventDefault();

    const previousStatus = complaint.status || "Submitted";
    const statusChanged = status !== previousStatus;

    const updatedActivity = [...activity];

    if (priorityReason.trim()) {
      updatedActivity.unshift(
        recordActivity(
          "Priority decision recorded",
          priorityReason.trim()
        )
      );
    }

    if (resolutionRemarks.trim() !== (complaint.resolutionRemarks || "")) {
      updatedActivity.unshift(
        recordActivity(
          "Resolution remarks updated",
          resolutionRemarks.trim() || "Resolution remarks cleared."
        )
      );
    }

    if (statusChanged) {
      updatedActivity.unshift(
        recordActivity(
          "Complaint status updated",
          `Status changed from ${previousStatus} to ${status}.`
        )
      );
    }

    if (department !== (complaint.department || "")) {
      updatedActivity.unshift(
        recordActivity(
          "Department assignment updated",
          department || "Complaint is now unassigned."
        )
      );
    }

    if (priority !== (complaint.priority || "Medium")) {
      updatedActivity.unshift(
        recordActivity(
          "Priority updated",
          `Priority changed to ${priority}.`
        )
      );
    }

    if (resolutionPhotoUrl !== (complaint.resolutionPhotoUrl || "")) {
      updatedActivity.unshift(
        recordActivity(
          "Resolution photograph updated",
          resolutionPhotoUrl
            ? "A resolution photograph was uploaded."
            : "Resolution photograph was removed."
        )
      );
    }

    const updatedComplaint = {
      priority,
      department,
      status,
      resolutionRemarks,
      resolutionPhotoUrl,
      activity: updatedActivity,
      citizenVerification:
        status === "Resolved"
          ? complaint.citizenVerification || "Pending"
          : null,
    };

    onUpdate(updatedComplaint);

    if (statusChanged) {
      addNotification({
        recipient: "citizen",
        type: "status_update",
        title:
          status === "Resolved"
            ? "Your complaint has been marked as resolved"
            : "Your complaint status has been updated",
        message:
          status === "Resolved"
            ? "The authority has marked your complaint as resolved. Please review the resolution remarks and evidence, then confirm whether the issue has been fixed."
            : `Your complaint status has changed from ${previousStatus} to ${status}.`,
        complaintId: complaint.id,
      });
    }

    setActivity(updatedActivity);
    setPriorityReason("");
    setMessage(
      statusChanged
        ? "Changes saved. The citizen has been notified about the status update."
        : "Changes saved and shared with the citizen tracking page."
    );
  };

  const sortedActivity = activity
    .map((item, index) => ({
      ...item,
      originalIndex: index,
      parsedDate: new Date(item.date || item.timestamp || "").getTime(),
    }))
    .sort((a, b) => {
      const aValid = Number.isFinite(a.parsedDate);
      const bValid = Number.isFinite(b.parsedDate);

      if (aValid && bValid) {
        return b.parsedDate - a.parsedDate;
      }

      return b.originalIndex - a.originalIndex;
    });

  return (
    <div className="complaint-details-page">
      <div className="complaint-details-header">
        <button className="back-button" onClick={onBack}>
          ← Back to All Issues
        </button>
        <span className="workflow-label">COMPLAINT MANAGEMENT</span>
      </div>

      <div className="complaint-page-heading">
        <div>
          <p className="eyebrow">ISSUE MANAGEMENT</p>
          <h1>Complaint Details</h1>
          <p>Review the complaint and manage its progress.</p>
        </div>

        <span className="complaint-id">
          {complaint.id || "Complaint ID unavailable"}
        </span>
      </div>

      <form onSubmit={handleSave} className="complaint-workflow-grid">
        <section className="workflow-card complaint-information">
          <div className="workflow-card-heading">
            <div>
              <span className="section-number">01</span>
              <h2>Complaint Information</h2>
            </div>
          </div>

          <div className="information-grid">
            <div>
              <span className="field-label">CATEGORY</span>
              <p>{complaint.category || "Not provided"}</p>
            </div>

            <div>
              <span className="field-label">DATE REPORTED</span>
              <p>{reportedDate}</p>
            </div>

            <div>
              <span className="field-label">LOCATION</span>
              <p>{getLocationLabel(complaint.location)}</p>
            </div>

            <div>
              <span className="field-label">REPORTED BY</span>
              <p>
                {complaint.anonymous || complaint.isAnonymous
                  ? "Anonymous Citizen"
                  : complaint.reportedBy || "Citizen"}
              </p>
            </div>
          </div>

          <div className="description-block">
            <span className="field-label">DESCRIPTION</span>
            <p>{complaint.description || "No description provided."}</p>
          </div>

          <div className="evidence-block">
            <span className="field-label">SUBMITTED PHOTOGRAPH</span>

            {complaintPhoto ? (
              <img
                src={complaintPhoto}
                alt="Complaint evidence"
                className="complaint-evidence-image"
              />
            ) : (
              <div className="no-evidence">
                <span>▧</span>
                <p>No photograph attached to this complaint.</p>
              </div>
            )}
          </div>
        </section>

        <section className="workflow-card">
          <div className="workflow-card-heading">
            <div>
              <span className="section-number">02</span>
              <h2>Priority Management</h2>
            </div>
          </div>

          <label className="workflow-label-text" htmlFor="priority">
            Complaint priority
          </label>

          <select
            id="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <label className="workflow-label-text" htmlFor="priority-reason">
            Reason for priority decision or override
          </label>

          <textarea
            id="priority-reason"
            value={priorityReason}
            onChange={(event) => setPriorityReason(event.target.value)}
            placeholder="Explain why this priority was selected..."
            rows={4}
          />
        </section>

        <section className="workflow-card">
          <div className="workflow-card-heading">
            <div>
              <span className="section-number">03</span>
              <h2>Department Assignment</h2>
            </div>
          </div>

          <label className="workflow-label-text" htmlFor="department">
            Assign responsible department
          </label>

          <select
            id="department"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            <option value="">Select a department</option>

            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <p className="workflow-helper">
            Choose the department responsible for handling this complaint.
          </p>
        </section>

        <section className="workflow-card">
          <div className="workflow-card-heading">
            <div>
              <span className="section-number">04</span>
              <h2>Status Management</h2>
            </div>
          </div>

          <label className="workflow-label-text" htmlFor="status">
            Current complaint status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <p className="workflow-helper">
            Mark a complaint Resolved only after the work has been completed.
            The citizen can then verify the result.
          </p>
        </section>

        <section className="workflow-card resolution-card">
          <div className="workflow-card-heading">
            <div>
              <span className="section-number">05</span>
              <h2>Resolution Evidence</h2>
            </div>
          </div>

          <label
            className="workflow-label-text"
            htmlFor="resolution-remarks"
          >
            Resolution remarks
          </label>

          <textarea
            id="resolution-remarks"
            value={resolutionRemarks}
            onChange={(event) => setResolutionRemarks(event.target.value)}
            placeholder="Describe the action taken to resolve the issue..."
            rows={4}
          />

          <label
            className="workflow-label-text"
            htmlFor="resolution-photo"
          >
            Upload resolution photograph
          </label>

          <input
            id="resolution-photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />

          {resolutionPhotoUrl && (
            <div className="resolution-preview">
              <img
                src={resolutionPhotoUrl}
                alt="Selected resolution evidence"
              />
              <span>Resolution evidence selected</span>
            </div>
          )}

          <p className="workflow-helper">
            The citizen will be able to view these remarks and the photo after
            you save the complaint.
          </p>
        </section>

        <section className="workflow-card activity-card">
          <div className="workflow-card-heading">
            <div>
              <span className="section-number">06</span>
              <h2>Activity History</h2>
            </div>

            <span className="activity-count">
              {activity.length} Activities
            </span>
          </div>

          {sortedActivity.length > 0 ? (
            <div className="activity-list">
              {sortedActivity.map((item) => {
                const details = getActivityDetails(item);

                return (
                  <div
                    className="activity-item"
                    key={item.id || `${item.originalIndex}-${details.title}`}
                  >
                    <span className="activity-dot" />

                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "6px",
                        }}
                      >
                        <strong>{details.title}</strong>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 9px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "700",
                            background:
                              details.actor === "Citizen"
                                ? "#edf5d9"
                                : "#e4f1e9",
                            color:
                              details.actor === "Citizen"
                                ? "#526c1d"
                                : "#174b38",
                          }}
                        >
                          {details.actor}
                        </span>
                      </div>

                      <p>{details.description}</p>

                      <span>
                        {details.date
                          ? new Date(details.date).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Date unavailable"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-activity">
              <p>No activity history is available yet.</p>
              <span>
                Status, priority, assignment and citizen updates will appear
                here.
              </span>
            </div>
          )}
        </section>

        <div className="workflow-submit-area">
          {message && (
            <p className="workflow-message" role="status">
              {message}
            </p>
          )}

          <button type="submit" className="primary-action">
            Save Changes
          </button>

          <p>
            Frontend preview — changes are shared between both dashboards
            until the page is refreshed.
          </p>
        </div>
      </form>
    </div>
  );
}

export default ComplaintDetails;
