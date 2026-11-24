
import {
  calculatePriority,
  getPriorityLevel
} from "../utils/priorityScore";

function DashboardStats({ issues = [] }) {
  const totalIssues = issues.length;

  const highPriority = issues.filter((issue) => {
    const score = calculatePriority(issue);
    return getPriorityLevel(score) === "High";
  }).length;

  const unresolvedIssues = issues.filter(
    (issue) => issue.status?.toLowerCase() !== "resolved"
  ).length;

  const resolvedIssues = issues.filter(
    (issue) => issue.status?.toLowerCase() === "resolved"
  ).length;

  const stats = [
    {
      title: "Total Issues",
      value: totalIssues
    },
    {
      title: "High Priority",
      value: highPriority
    },
    {
      title: "Unresolved",
      value: unresolvedIssues
    },
    {
      title: "Resolved",
      value: resolvedIssues
    }
  ];

  return (
    <div className="dashboard-stats">
      {stats.map((stat) => (
        <div className="stat-card" key={stat.title}>
          <h3>{stat.title}</h3>
          <p>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export default DashboardStats;
