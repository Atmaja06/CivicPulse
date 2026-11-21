
import { useState } from "react";
import { useCivicPulse } from "../context/CivicPulseContext.jsx";
import "./Navbar.css";

function Navbar({ currentPage, navigate }) {
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useCivicPulse();

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleNotificationClick = (notification) => {
    markNotificationRead(notification.id);
    setShowNotifications(false);

    if (notification.complaintId) {
      navigate("track");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div
          className="navbar-brand"
          onClick={() => navigate("home")}
          role="button"
          tabIndex={0}
        >
          <div className="navbar-logo">C</div>

          <div className="navbar-brand-text">
            <h2>CivicPulse</h2>
            <span>Your City. Your Voice.</span>
          </div>
        </div>

        <nav className="navbar-links">
          <button
            className={currentPage === "home" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("home")}
          >
            Home
          </button>

          <button
            className={currentPage === "report" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("report")}
          >
            Report an Issue
          </button>

          <button
            className={currentPage === "track" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("track")}
          >
            Track Issues
          </button>
        </nav>

        <div className="navbar-auth">
          <div className="notification-wrapper">
            <button
              type="button"
              className="notification-bell"
              aria-label="Notifications"
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((previous) => !previous)}
            >
              <span className="bell-icon">♧</span>

              {unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <div>
                    <h3>Notifications</h3>
                    <span>
                      {unreadCount} unread
                    </span>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={`notification-item ${
                          notification.read ? "read" : "unread"
                        }`}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                      >
                        <span className="notification-item-icon">
                          {notification.icon || "●"}
                        </span>

                        <span className="notification-item-content">
                          <strong>{notification.title}</strong>
                          <span>{notification.message}</span>
                          <small>
                            {new Date(
                              notification.createdAt
                            ).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </span>

                        {!notification.read && (
                          <span className="notification-unread-dot" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="notification-empty">
                      <span>♧</span>
                      <strong>You're all caught up!</strong>
                      <p>
                        Updates about your complaints will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className={`navbar-login ${
              currentPage === "login" ? "auth-active" : ""
            }`}
            onClick={() => navigate("login")}
          >
            Login
          </button>

          <button
            className="navbar-signup"
            onClick={() => navigate("signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
