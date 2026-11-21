
import { useState } from "react";
import IssueCard from "../components/IssueCard.jsx";
import ResolutionVerification from "../components/ResolutionVerification.jsx";
import { useCivicPulse } from "../context/CivicPulseContext.jsx";
import "./TrackIssues.css";

function TrackIssues({ navigate }) {
  const { complaints, updateComplaint, addNotification } = useCivicPulse();

  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchMessage, setSearchMessage] = useState("");

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch = String(complaint.id || "")
      .toLowerCase()
      .includes(searchId.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "All" || complaint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchId.trim()) {
      setSearchMessage("Please enter a complaint reference ID.");
      return;
    }

    const matchingComplaint = complaints.some((complaint) =>
      String(complaint.id || "")
        .toLowerCase()
        .includes(searchId.trim().toLowerCase())
    );

    setSearchMessage(
      matchingComplaint
        ? "Matching complaint found below."
        : "No matching complaint found. Please check your reference ID."
    );
  };

  const handleResolutionDecision = (complaintId, newStatus, decision) => {
    const timestamp = new Date().toISOString();

    const existingComplaint = complaints.find(
      (complaint) => complaint.id === complaintId
    );

    if (!existingComplaint) return;

    const isConfirmed = decision === "confirmed";

    const decisionMessage = isConfirmed
      ? "Citizen confirmed that the issue has been resolved."
      : "Citizen requested a review because the issue is not fully resolved.";

    updateComplaint(complaintId, {
      status: newStatus,
      citizenVerification: decision,
      activity: [
        ...(existingComplaint.activity || []),
        {
          id: `${Date.now()}-${Math.random()}`,
          title: isConfirmed
            ? "Resolution confirmed by citizen"
            : "Resolution review requested by citizen",
          message: decisionMessage,
          description: decisionMessage,
          actor: "Citizen",
          date: timestamp,
        },
      ],
    });

    addNotification({
      recipient: "authority",
      type: "resolution_decision",
      title: isConfirmed
        ? "Citizen confirmed resolution"
        : "Citizen requested complaint reopening",
      message: isConfirmed
        ? `The citizen has confirmed that complaint ${complaintId} has been resolved.`
        : `The citizen has reported that complaint ${complaintId} is not fully resolved. Please review the complaint and take further action.`,
      complaintId,
    });
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setSearchMessage("");
  };

  return (
    <div className="track-page">
      <section className="track-heading">
        <span className="track-eyebrow">CITIZEN SERVICES</span>

        <h1>Track Your Reports</h1>

        <p>
          Stay informed about the progress of civic issues you've
          reported. Every update brings us closer to a better community.
        </p>

        <button
          type="button"
          className="track-report-btn"
          onClick={() => navigate("report")}
        >
          + Report a New Issue
        </button>
      </section>

      <section className="track-search-card">
        <div>
          <h2>Find a Complaint</h2>
          <p>Enter your complaint reference ID to find a report.</p>
        </div>

        <form className="track-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter complaint ID..."
            value={searchId}
            onChange={(event) => {
              setSearchId(event.target.value);
              setSearchMessage("");
            }}
          />

          <button type="submit">Search</button>
        </form>

        {searchMessage && (
          <p className="track-search-message" role="status">
            {searchMessage}
          </p>
        )}
      </section>

      <section className="track-list-section">
        <div className="track-list-heading">
          <div>
            <span className="track-eyebrow">YOUR CONTRIBUTION</span>
            <h2>My Complaints</h2>
          </div>

          <select
            value={statusFilter}
            onChange={handleFilterChange}
            aria-label="Filter complaints by status"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Reported">Reported</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Community Verified">Community Verified</option>
          </select>
        </div>

        {filteredComplaints.length > 0 ? (
          <div className="track-complaints-list">
            {filteredComplaints.map((complaint) => (
              <div key={complaint.id}>
                <IssueCard
                  issueId={complaint.id}
                  title={complaint.title}
                  category={complaint.category}
                  location={
                    complaint.location?.label ||
                    complaint.location ||
                    "Location selected"
                  }
                  date={
                    complaint.date ||
                    complaint.submittedAt ||
                    complaint.createdAt
                  }
                  status={complaint.status}
                  description={complaint.description}
                  imageUrl={complaint.photoUrl || complaint.imageUrl}
                />

                {complaint.status === "Resolved" && (
                  <ResolutionVerification
                    complaint={complaint}
                    onDecision={handleResolutionDecision}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="track-empty-state">
            <div className="track-empty-icon">📋</div>

            <h3>
              {searchId || statusFilter !== "All"
                ? "No matching complaints"
                : "No reports submitted yet"}
            </h3>

            <p>
              {searchId || statusFilter !== "All"
                ? "Try another reference ID or change your status filter."
                : "Once you submit a civic issue, its details and progress updates will appear here."}
            </p>

            {!searchId && statusFilter === "All" && (
              <button
                type="button"
                className="track-empty-btn"
                onClick={() => navigate("report")}
              >
                Report Your First Issue
              </button>
            )}
          </div>
        )}
      </section>

      <section className="track-status-guide">
        <div className="status-guide-heading">
          <span className="track-eyebrow">UNDERSTAND THE PROCESS</span>
          <h2>How complaint tracking works</h2>
          <p>Follow your complaint through these stages.</p>
        </div>

        <div className="status-timeline">
          <div className="status-step">
            <div className="status-step-icon">📝</div>
            <div>
              <strong>Submitted</strong>
              <span>Your complaint has been submitted.</span>
            </div>
          </div>

          <div className="status-connector" />

          <div className="status-step">
            <div className="status-step-icon">🔍</div>
            <div>
              <strong>Under Review</strong>
              <span>The concerned authority is reviewing it.</span>
            </div>
          </div>

          <div className="status-connector" />

          <div className="status-step">
            <div className="status-step-icon">🛠️</div>
            <div>
              <strong>In Progress</strong>
              <span>Action is being taken to resolve the issue.</span>
            </div>
          </div>

          <div className="status-connector" />

          <div className="status-step">
            <div className="status-step-icon">✓</div>
            <div>
              <strong>Resolved</strong>
              <span>The authority has marked the issue resolved.</span>
            </div>
          </div>

          <div className="status-connector" />

          <div className="status-step">
            <div className="status-step-icon">🤝</div>
            <div>
              <strong>Community Verified</strong>
              <span>You have confirmed that the issue is resolved.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TrackIssues;
