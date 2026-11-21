
import "./ResolutionVerification.css";

function ResolutionVerification({ complaint, onDecision }) {
  const verification = complaint.citizenVerification;

  const handleDecision = (decision) => {
    if (decision === "confirmed") {
      onDecision(complaint.id, "Community Verified", "confirmed");
    } else {
      onDecision(complaint.id, "Under Review", "reopen_requested");
    }
  };

  return (
    <section className="resolution-verification">
      <div className="resolution-verification-heading">
        <span className="resolution-verification-icon">✓</span>

        <div>
          <span className="resolution-eyebrow">AUTHORITY UPDATE</span>
          <h3>Has this issue been resolved?</h3>
        </div>
      </div>

      <p className="resolution-description">
        The authority has marked this complaint as resolved.
        Please review the update and let us know whether the issue
        has actually been fixed.
      </p>

      <div className="authority-resolution-details">
        <h4>Resolution remarks</h4>
        <p>
          {complaint.resolutionRemarks ||
            "No resolution remarks have been provided yet."}
        </p>
      </div>

      {complaint.resolutionPhotoUrl ? (
        <div className="authority-resolution-photo">
          <h4>Resolution proof</h4>

          <img
            src={complaint.resolutionPhotoUrl}
            alt="Photo uploaded by the authority as resolution proof"
          />
        </div>
      ) : (
        <p className="resolution-no-photo">
          No resolution photo has been uploaded.
        </p>
      )}

      {verification === "confirmed" ? (
        <div className="verification-result success">
          <strong>✓ Resolution confirmed</strong>
          <p>
            You confirmed that this issue has been fixed. Thank you
            for helping keep your community accountable.
          </p>
        </div>
      ) : verification === "reopen_requested" ? (
        <div className="verification-result reopen">
          <strong>↻ Reopening requested</strong>
          <p>
            Your feedback has been recorded. The complaint has
            been moved back to Under Review.
          </p>
        </div>
      ) : (
        <div className="verification-actions">
          <p>Is the issue actually fixed?</p>

          <button
            type="button"
            className="verify-fixed-btn"
            onClick={() => handleDecision("confirmed")}
          >
            ✓ Yes, the issue is fixed
          </button>

          <button
            type="button"
            className="verify-reopen-btn"
            onClick={() => handleDecision("reopen")}
          >
            The issue still exists
          </button>
        </div>
      )}

      <p className="verification-note">
        Your confirmation is separate from the authority's resolution
        update.
      </p>
    </section>
  );
}

export default ResolutionVerification;
