
import { useState } from "react";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import ReportIssue from "./pages/ReportIssue.jsx";
import TrackIssues from "./pages/TrackIssues.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { CivicPulseProvider } from "./context/CivicPulseContext.jsx";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (currentPage) {
      case "report":
        return <ReportIssue navigate={navigate} />;

      case "track":
        return <TrackIssues navigate={navigate} />;

      case "login":
        return <Login navigate={navigate} />;

      case "signup":
        return <Signup navigate={navigate} />;

      case "authority":
        return <Dashboard navigate={navigate} />;

      default:
        return <Home navigate={navigate} />;
    }
  };

  const isAuthority = currentPage === "authority";

  return (
    <>
      {!isAuthority && (
        <Navbar currentPage={currentPage} navigate={navigate} />
      )}

      {renderPage()}

      {!isAuthority && (
        <button
          type="button"
          onClick={() => navigate("authority")}
          style={{
            position: "fixed",
            bottom: "18px",
            right: "18px",
            zIndex: 999,
            padding: "10px 15px",
            border: "none",
            borderRadius: "9px",
            background: "#174B38",
            color: "#ffffff",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 3px 12px rgba(0,0,0,0.18)",
          }}
        >
          Authority Preview →
        </button>
      )}
    </>
  );
}

function App() {
  return (
    <CivicPulseProvider>
      <AppContent />
    </CivicPulseProvider>
  );
}

export default App;
