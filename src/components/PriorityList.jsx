
import {
  calculatePriority,
  getPriorityLevel
} from "../utils/priorityScore";

function PriorityList({ issues = [] }) {
  const sortedIssues = [...issues].sort(
    (a, b) => calculatePriority(b) - calculatePriority(a)
  );

  return (
    <div className="priority-list">
      <h2>Issue Priority List</h2>

      {sortedIssues.length === 0 ? (
        <p>No civic issues available.</p>
      ) : (
        sortedIssues.map((issue) => {
          const score = calculatePriority(issue);
          const level = getPriorityLevel(score);

          return (
            <div
              key={issue.id}
              className={`priority-card ${level.toLowerCase()}`}
            >
              <div className="priority-card-header">
                <h3>{issue.title || issue.category || "Civic Issue"}</h3>
                <span className={`priority-badge ${level.toLowerCase()}`}>
                  {level} Priority
                </span>
              </div>

              <p>Category: {issue.category || "Not specified"}</p>
              <p>Location: {issue.location || "Not specified"}</p>
              <p>Status: {issue.status || "Reported"}</p>

              <div className="priority-score">
                Priority Score: <strong>{score}/100</strong>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default PriorityList;