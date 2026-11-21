import { useState } from "react";
import "./Dashboard.css";
import ComplaintDetails from "../components/ComplaintDetails.jsx";
import { useCivicPulse } from "../context/CivicPulseContext.jsx";

const departments = [
  {
    id: "public-works",
    icon: "♧",
    name: "Public Works Department",
    shortName: "Public Works",
    description: "Roads, potholes, footpaths and public infrastructure.",
    responsibilities: [
      "Road maintenance",
      "Potholes and damaged roads",
      "Footpaths and pavements",
      "Public infrastructure",
      "Drainage infrastructure",
    ],
  },
  {
    id: "sanitation",
    icon: "♻",
    name: "Sanitation Department",
    shortName: "Sanitation",
    description: "Waste collection, garbage disposal and cleanliness.",
    responsibilities: [
      "Garbage collection",
      "Waste disposal",
      "Public cleanliness",
      "Overflowing garbage bins",
      "Community sanitation",
    ],
  },
  {
    id: "water",
    icon: "♧",
    name: "Water Supply Department",
    shortName: "Water Supply",
    description: "Water leakage, pipelines and water supply concerns.",
    responsibilities: [
      "Water pipeline leakage",
      "Water supply interruptions",
      "Damaged water connections",
      "Public water facilities",
      "Water infrastructure",
    ],
  },
  {
    id: "electricity",
    icon: "☼",
    name: "Electricity Department",
    shortName: "Electricity",
    description: "Streetlights, power infrastructure and electrical issues.",
    responsibilities: [
      "Non-functional streetlights",
      "Electrical infrastructure",
      "Damaged electrical poles",
      "Exposed electrical wiring",
      "Public lighting",
    ],
  },
  {
    id: "public-health",
    icon: "✚",
    name: "Public Health Department",
    shortName: "Public Health",
    description: "Public health hazards and sanitation-related concerns.",
    responsibilities: [
      "Public health hazards",
      "Mosquito breeding concerns",
      "Unsafe public conditions",
      "Health-related civic complaints",
      "Public hygiene concerns",
    ],
  },
  {
    id: "municipal",
    icon: "⌂",
    name: "Municipal Administration",
    shortName: "Municipal Admin",
    description: "General civic services and administrative complaints.",
    responsibilities: [
      "General civic grievances",
      "Municipal services",
      "Administrative concerns",
      "Public facility complaints",
      "Interdepartmental coordination",
    ],
  },
];

function getLocationLabel(location) {
  if (!location) return "Not provided";
  if (typeof location === "string") return location;
  return location.label || location.address || "Location selected";
}

function Dashboard({ navigate = () => {} }) {
  const {
    complaints,
    updateComplaint,
    notifications,
    markNotificationRead,
  } = useCivicPulse();

  const [activeSection, setActiveSection] = useState("Overview");
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const authorityNotifications = notifications.filter(
    (notification) => notification.recipient === "authority"
  );

  const unreadNotificationCount = authorityNotifications.filter(
    (notification) => !notification.read
  ).length;

  const handleMarkAllNotificationsRead = () => {
    authorityNotifications.forEach((notification) => {
      if (!notification.read) {
        markNotificationRead(notification.id);
      }
    });
  };

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id);
    setShowNotifications(false);

    if (notification.complaintId) {
      const relatedComplaint = complaints.find(
        (complaint) => complaint.id === notification.complaintId
      );

      if (relatedComplaint) {
        openComplaint(relatedComplaint);
      }
    }
  };

  const sections = [
    { name: "Overview", icon: "▦" },
    { name: "All Issues", icon: "▤" },
    { name: "Departments", icon: "⌂" },
    { name: "Map View", icon: "◎" },
    { name: "Reports", icon: "▥" },
  ];

  const priorities = ["All", "Critical", "High", "Medium", "Low"];

  const statuses = [
    "All",
    "Submitted",
    "Reported",
    "Under Review",
    "In Progress",
    "Resolved",
  ];

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter((item) =>
    ["Submitted", "Reported", "Under Review"].includes(item.status)
  ).length;

  const inProgressComplaints = complaints.filter(
    (item) => item.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (item) => item.status === "Resolved"
  ).length;

  const openSection = (section) => {
    setActiveSection(section);
    setSelectedDepartment(null);
    setSelectedComplaint(null);
  };

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedDepartment(null);
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
    setActiveSection("All Issues");
  };

  const handleComplaintUpdate = (updates) => {
    updateComplaint(selectedComplaint.id, updates);

    setSelectedComplaint((previous) =>
      previous ? { ...previous, ...updates } : previous
    );
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      !query ||
      String(complaint.id || "").toLowerCase().includes(query) ||
      String(complaint.title || "").toLowerCase().includes(query) ||
      String(complaint.description || "").toLowerCase().includes(query);

    const matchesPriority =
      activeFilter === "All" || complaint.priority === activeFilter;

    const matchesStatus =
      activeStatus === "All" || complaint.status === activeStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const renderOverview = () => (
    <>
      <div className="authority-stats">
        {[
          {
            title: "Total Complaints",
            icon: "▤",
            color: "green",
            value: totalComplaints,
          },
          {
            title: "Pending Review",
            icon: "◷",
            color: "yellow",
            value: pendingComplaints,
          },
          {
            title: "In Progress",
            icon: "⚑",
            color: "orange",
            value: inProgressComplaints,
          },
          {
            title: "Resolved",
            icon: "✓",
            color: "lime",
            value: resolvedComplaints,
          },
        ].map((stat) => (
          <div className="authority-stat-card" key={stat.title}>
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div>
              <p>{stat.title}</p>
              <h2>{stat.value}</h2>
              <span>Current complaint records</span>
            </div>
          </div>
        ))}
      </div>

      <section className="authority-panel">
        <div className="panel-heading">
          <div>
            <h2>Complaint Management</h2>
            <p>Review, prioritise and manage citizen complaints.</p>
          </div>

          <button
            className="view-all-button"
            onClick={() => openSection("All Issues")}
          >
            View All Issues →
          </button>
        </div>

        {complaints.length > 0 ? (
          <div className="complaint-table-wrapper">
            <table className="complaint-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Issue Details</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {[...complaints].slice(0, 5).map((complaint) => (
                  <tr key={complaint.id}>
                    <td>{complaint.id}</td>
                    <td>{complaint.title || complaint.category}</td>
                    <td>{getLocationLabel(complaint.location)}</td>
                    <td>{complaint.status || "Submitted"}</td>
                    <td>
                      <button
                        className="department-view-button"
                        onClick={() => openComplaint(complaint)}
                      >
                        View Complaint →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="authority-empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No complaints to display</h3>
            <p>
              Citizen reports will appear here after they are submitted.
            </p>
          </div>
        )}
      </section>

      <div className="authority-lower-grid">
        <section className="authority-panel lower-panel">
          <div className="panel-heading">
            <div>
              <h2>Department Overview</h2>
              <p>Monitor department activity and responsibilities.</p>
            </div>
          </div>

          <div className="small-empty-state">
            <span>⌂</span>
            <p>
              {complaints.length > 0
                ? `${complaints.filter((item) => item.department).length} complaints currently have a department assigned.`
                : "Department activity will appear here."}
            </p>
          </div>

          <button
            className="text-action"
            onClick={() => openSection("Departments")}
          >
            Manage Departments →
          </button>
        </section>

        <section className="authority-panel lower-panel">
          <div className="panel-heading">
            <div>
              <h2>Priority Guidelines</h2>
              <p>How reported issues are prioritised.</p>
            </div>
          </div>

          <div className="priority-guidelines">
            {[
              ["Critical", "Immediate public safety concerns.", "critical"],
              ["High", "Serious issues affecting the community.", "high"],
              ["Medium", "Issues requiring timely attention.", "medium"],
              ["Low", "Routine maintenance and minor issues.", "low"],
            ].map(([name, description, color]) => (
              <div key={name}>
                <span className={`priority-dot ${color}`}></span>
                <strong>{name}</strong>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );

  const renderIssues = () => (
    <section className="authority-panel issue-management-panel">
      <div className="panel-heading">
        <div>
          <h2>All Citizen Complaints</h2>
          <p>
            Review citizen reports, monitor their priority and track progress.
          </p>
        </div>

        <span className="issue-count-label">
          {complaints.length} Total Reports
        </span>
      </div>

      <div className="issue-management-toolbar">
        <div className="issue-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search complaint ID or title..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-heading">Priority</span>

        <div className="issue-filters">
          {priorities.map((filter) => (
            <button
              key={filter}
              className={`filter-button ${
                activeFilter === filter ? "active" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-heading">Complaint Status</span>

        <div className="issue-filters status-filters">
          {statuses.map((status) => (
            <button
              key={status}
              className={`filter-button ${
                activeStatus === status ? "active" : ""
              }`}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="complaint-table-wrapper">
        <table className="complaint-table">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Issue Details</th>
              <th>Location</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.length > 0 ? (
              filteredComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td>{complaint.id}</td>
                  <td>{complaint.title || complaint.category}</td>
                  <td>{getLocationLabel(complaint.location)}</td>
                  <td>
                    <span
                      className={`priority-badge ${String(
                        complaint.priority || ""
                      ).toLowerCase()}`}
                    >
                      {complaint.priority || "Pending assessment"}
                    </span>
                  </td>
                  <td>{complaint.status || "Submitted"}</td>
                  <td>
                    <button
                      className="department-view-button"
                      onClick={() => openComplaint(complaint)}
                    >
                      View Complaint →
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="table-empty-cell">
                  <div className="authority-empty-state table-empty-state">
                    <div className="empty-icon">▤</div>
                    <h3>
                      {complaints.length === 0
                        ? "No complaints available yet"
                        : "No matching complaints found"}
                    </h3>
                    <p>
                      {complaints.length === 0
                        ? "Citizen complaints will appear here when submitted."
                        : "Try changing your search or filters."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="table-note">
        Complaint records are currently shared through the frontend session.
        They will reset when the page is refreshed.
      </p>
    </section>
  );

  const renderDepartmentDetails = (department) => {
    const departmentComplaints = complaints.filter(
      (complaint) => complaint.department === department.shortName
    );

    return (
      <div className="department-details">
        <button
          className="department-back-button"
          onClick={() => setSelectedDepartment(null)}
        >
          ← Back to Departments
        </button>

        <div className="department-detail-header">
          <div className="department-detail-icon">{department.icon}</div>
          <div>
            <span className="department-eyebrow">DEPARTMENT PROFILE</span>
            <h2>{department.name}</h2>
            <p>{department.description}</p>
          </div>
        </div>

        <div className="department-detail-stats">
          {[
            ["Assigned Complaints", departmentComplaints.length],
            [
              "Resolved Complaints",
              departmentComplaints.filter(
                (item) => item.status === "Resolved"
              ).length,
            ],
            ["Department Staff", "—"],
          ].map(([label, value]) => (
            <div className="department-detail-stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>
                {label === "Department Staff"
                  ? "Awaiting official accounts"
                  : "Current complaint records"}
              </small>
            </div>
          ))}
        </div>

        <section className="authority-panel department-detail-panel">
          <div className="panel-heading">
            <div>
              <h2>Department Responsibilities</h2>
              <p>
                Illustrative civic issue categories handled by this department.
              </p>
            </div>
          </div>

          <div className="responsibility-list">
            {department.responsibilities.map((item) => (
              <div className="responsibility-item" key={item}>
                <span>✓</span>
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="department-detail-grid">
          <section className="authority-panel department-detail-panel">
            <div className="panel-heading">
              <div>
                <h2>Staff Management</h2>
                <p>Manage officials and department team members.</p>
              </div>
            </div>

            <div className="department-empty-state">
              <div className="empty-icon">♙</div>
              <h3>No staff members added</h3>
              <p>
                Department staff details will appear here after official
                accounts are configured.
              </p>
            </div>
          </section>

          <section className="authority-panel department-detail-panel">
            <div className="panel-heading">
              <div>
                <h2>Assigned Complaints</h2>
                <p>Complaints currently routed to this department.</p>
              </div>
            </div>

            {departmentComplaints.length > 0 ? (
              <div className="responsibility-list">
                {departmentComplaints.map((complaint) => (
                  <div className="responsibility-item" key={complaint.id}>
                    <span>▤</span>
                    <button
                      className="department-view-button"
                      onClick={() => openComplaint(complaint)}
                    >
                      {complaint.id} — {complaint.title || complaint.category}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="department-empty-state">
                <div className="empty-icon">⇄</div>
                <h3>No complaints assigned</h3>
                <p>
                  Complaints assigned to this department will appear here.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="department-workflow-note">
          <strong>How assignment works</strong>
          <p>
            Officials can assign a complaint to this department from its
            Complaint Details page. The assignment is reflected in the citizen
            tracking page.
          </p>
          <span>Frontend preview — official accounts are not connected.</span>
        </div>

        <p className="department-note">
          Department responsibilities shown here are illustrative and must be
          validated against the official municipal department structure.
        </p>
      </div>
    );
  };

  const renderDepartments = () => {
    if (selectedDepartment) {
      return renderDepartmentDetails(selectedDepartment);
    }

    return (
      <>
        <div className="department-intro">
          <div>
            <h2>Department Management</h2>
            <p>
              Organise civic complaints across the responsible government
              departments.
            </p>
          </div>

          <span className="preview-tag">Frontend Preview</span>
        </div>

        <div className="department-grid">
          {departments.map((department) => {
            const assignedCount = complaints.filter(
              (complaint) => complaint.department === department.shortName
            ).length;

            return (
              <div className="department-card" key={department.id}>
                <div className="department-icon">{department.icon}</div>
                <h3>{department.name}</h3>
                <p>{department.description}</p>

                <div className="department-card-footer">
                  <span>Assigned complaints</span>
                  <span>{assignedCount}</span>
                </div>

                <button
                  className="department-view-button"
                  onClick={() => setSelectedDepartment(department)}
                >
                  View Department →
                </button>
              </div>
            );
          })}
        </div>

        <p className="department-note">
          Department categories are illustrative frontend placeholders.
          Official department mapping and staff assignments will be configured
          later.
        </p>
      </>
    );
  };

  const renderComingSoon = (section) => (
    <div className="authority-empty-state coming-soon-state">
      <div className="empty-icon">
        {section === "Map View" ? "◎" : "▥"}
      </div>

      <h3>{section} is being prepared</h3>

      <p>
        {section === "Map View"
          ? "A geographical view of reported civic issues will be available here."
          : "Complaint analytics, resolution performance and department reports will be available here."}
      </p>

      <span className="preview-tag">Planned Feature</span>
    </div>
  );

  const renderContent = () => {
    if (selectedComplaint) {
      return (
        <ComplaintDetails
          complaint={selectedComplaint}
          onBack={closeComplaint}
          onUpdate={handleComplaintUpdate}
        />
      );
    }

    switch (activeSection) {
      case "All Issues":
        return renderIssues();

      case "Departments":
        return renderDepartments();

      case "Map View":
      case "Reports":
        return renderComingSoon(activeSection);

      default:
        return renderOverview();
    }
  };

  return (
    <div className="authority-dashboard">
      <aside className="authority-sidebar">
        <div className="authority-brand">
          <div className="authority-brand-icon">C</div>
          <div>
            <h2>CivicPulse</h2>
            <span>Authority Portal</span>
          </div>
        </div>

        <div className="authority-sidebar-label">WORKSPACE</div>

        <nav className="authority-nav">
          {sections.map((section) => (
            <button
              key={section.name}
              className={`authority-nav-item ${
                activeSection === section.name ? "selected" : ""
              }`}
              onClick={() => openSection(section.name)}
            >
              <span className="nav-symbol">{section.icon}</span>
              <span className="nav-text">{section.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="authority-profile">
            <div className="profile-avatar">A</div>
            <div>
              <strong>Authority User</strong>
              <span>Official Portal</span>
            </div>
          </div>

          <button
            className="back-to-citizen"
            onClick={() => navigate("home")}
          >
            ← Back to Citizen View
          </button>
        </div>
      </aside>

      <main className="authority-main">
        <header className="authority-topbar">
          <div>
            <span className="topbar-label">CIVICPULSE / AUTHORITY</span>

            <h1>
              {selectedComplaint
                ? "Complaint Details"
                : selectedDepartment
                  ? selectedDepartment.shortName
                  : activeSection}
            </h1>
          </div>

          <div className="authority-topbar-right">
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowNotifications((previous) => !previous)}
                aria-label={`Notifications, ${unreadNotificationCount} unread`}
                aria-expanded={showNotifications}
                style={{
                  position: "relative",
                  border: "1px solid #dce8df",
                  background: "#ffffff",
                  color: "#174b38",
                  borderRadius: "12px",
                  width: "42px",
                  height: "42px",
                  cursor: "pointer",
                  fontSize: "19px",
                }}
              >
                🔔

                {unreadNotificationCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      minWidth: "18px",
                      height: "18px",
                      padding: "0 4px",
                      borderRadius: "20px",
                      background: "#d94b43",
                      color: "#ffffff",
                      fontSize: "10px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: "52px",
                    right: 0,
                    width: "min(360px, calc(100vw - 40px))",
                    maxHeight: "420px",
                    overflowY: "auto",
                    background: "#ffffff",
                    border: "1px solid #dce8df",
                    borderRadius: "14px",
                    boxShadow: "0 12px 35px rgba(23, 75, 56, 0.16)",
                    zIndex: 1000,
                    color: "#20342b",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      padding: "15px 16px",
                      borderBottom: "1px solid #edf1ed",
                    }}
                  >
                    <strong>Authority Notifications</strong>

                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      disabled={unreadNotificationCount === 0}
                      style={{
                        border: "none",
                        background: "transparent",
                        color:
                          unreadNotificationCount === 0
                            ? "#9aa69e"
                            : "#27845b",
                        cursor:
                          unreadNotificationCount === 0
                            ? "default"
                            : "pointer",
                        fontSize: "12px",
                        fontWeight: "700",
                      }}
                    >
                      Mark all read
                    </button>
                  </div>

                  {authorityNotifications.length > 0 ? (
                    authorityNotifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "14px 16px",
                          border: "none",
                          borderBottom: "1px solid #f0f3f0",
                          background: notification.read
                            ? "#ffffff"
                            : "#f3f8ed",
                          cursor: "pointer",
                          color: "#20342b",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "700",
                            fontSize: "13px",
                            marginBottom: "5px",
                          }}
                        >
                          {!notification.read && (
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "50%",
                                background: "#27845b",
                                flexShrink: 0,
                              }}
                            />
                          )}

                          {notification.title}
                        </span>

                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            lineHeight: 1.5,
                            color: "#64736a",
                          }}
                        >
                          {notification.message}
                        </span>

                        {notification.complaintId && (
                          <span
                            style={{
                              display: "block",
                              marginTop: "7px",
                              color: "#27845b",
                              fontSize: "11px",
                              fontWeight: "700",
                            }}
                          >
                            Complaint: {notification.complaintId}
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "28px 18px",
                        textAlign: "center",
                        color: "#718077",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                        🔔
                      </div>

                      <strong style={{ color: "#20342b" }}>
                        No notifications yet
                      </strong>

                      <p style={{ margin: "6px 0 0" }}>
                        New complaints and citizen responses will appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="portal-status">
              <span></span>
              Frontend Preview
            </span>

            <div className="topbar-avatar">A</div>
          </div>
        </header>

        <div className="authority-content">
          {!selectedDepartment && !selectedComplaint && (
            <div className="authority-welcome">
              <div>
                <h2>Welcome to the Authority Portal</h2>
                <p>
                  Monitor civic issues, coordinate departments and improve
                  public services.
                </p>
              </div>

              <div className="welcome-decoration">✳</div>
            </div>
          )}

          {renderContent()}

          <footer className="authority-footer">
            <span>CivicPulse Authority Portal</span>
            <span>Frontend preview · Session data only</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;