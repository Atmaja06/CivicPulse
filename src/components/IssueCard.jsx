
import "./IssueCard.css";

const statusStyles = {
  Reported: "reported",
  "Under Review": "under-review",
  "In Progress": "in-progress",
  Resolved: "resolved",
  "Community Verified": "community-verified",
};

function IssueCard({
  issueId,
  title,
  category,
  location,
  date,
  status,
  description,
  imageUrl,
  onClick,
}) {
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const statusClass =
    statusStyles[status] || "reported";

  return (
    <article className="issue-card">
      {imageUrl && (
        <div className="issue-card-image">
          <img src={imageUrl} alt={title || "Reported civic issue"} />
        </div>
      )}

      <div className="issue-card-content">
        <div className="issue-card-top">
          <span className="issue-category">
            {category || "Civic Issue"}
          </span>

          {status && (
            <span className={`issue-status ${statusClass}`}>
              {status}
            </span>
          )}
        </div>

        <h3 className="issue-title">
          {title || "Untitled Issue"}
        </h3>

        {description && (
          <p className="issue-description">
            {description}
          </p>
        )}

        <div className="issue-card-details">
          {location && (
            <span>
              <span className="detail-icon">⌖</span>
              {location}
            </span>
          )}

          {formattedDate && (
            <span>
              <span className="detail-icon">◷</span>
              {formattedDate}
            </span>
          )}
        </div>

        {issueId && (
          <p className="issue-reference">
            Reference ID: {issueId}
          </p>
        )}

        {onClick && (
          <button
            type="button"
            className="issue-view-button"
            onClick={onClick}
          >
            View Details <span>→</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default IssueCard;
