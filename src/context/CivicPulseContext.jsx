
import { createContext, useContext, useState } from "react";

const CivicPulseContext = createContext(null);

export function CivicPulseProvider({ children }) {
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const newNotification = {
      id: `${Date.now()}-${Math.random()}`,
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    };

    setNotifications((previous) => [newNotification, ...previous]);
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const updateComplaint = (complaintId, updates) => {
    setComplaints((previous) =>
      previous.map((complaint) =>
        complaint.id === complaintId
          ? { ...complaint, ...updates }
          : complaint
      )
    );
  };

  return (
    <CivicPulseContext.Provider
      value={{
        complaints,
        setComplaints,
        updateComplaint,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </CivicPulseContext.Provider>
  );
}

export function useCivicPulse() {
  const context = useContext(CivicPulseContext);

  if (!context) {
    throw new Error(
      "useCivicPulse must be used inside CivicPulseProvider"
    );
  }

  return context;
}
