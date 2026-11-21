
import { useState } from "react";
import "./Home.css";

const officialSchemesUrl = "https://www.goa.gov.in/government/schemes/";
const goaOnlineUrl = "https://goaonline.gov.in/";

const schemes = [
  {
    id: 1,
    name: "Sant Sohirobanath Ambiye Dnyanvruddhi Shishyavrutti",
    shortName: "Goa Bursary Scheme",
    category: "Education",
    department: "Goa Government – Education",
    icon: "🎓",
    featured: true,
    description:
      "A scholarship and financial assistance scheme listed by the Goa Government for eligible students pursuing education.",
    benefits:
      "Provides bursary-related financial assistance to students who meet the conditions specified in the official scheme guidelines.",
    audience:
      "Students pursuing eligible courses and meeting the scheme's prescribed conditions.",
    eligibility:
      "Income limits, academic requirements, course conditions and other eligibility criteria must be checked in the latest official notification.",
    documents:
      "Commonly requested documents may include identity proof, residence proof, income certificate, academic records and bank details. Confirm the exact list before applying.",
    application:
      "Visit the Goa Online portal or the relevant government department to check the current application process and availability.",
  },
  {
    id: 2,
    name: "Chief Minister's Kaushalya Path Scheme (CMKPS)",
    shortName: "Kaushalya Path Scheme",
    category: "Skill Development",
    department: "Goa Government – Skill Development",
    icon: "💼",
    featured: true,
    description:
      "A skill-development initiative offering short-term training and recognition of prior learning.",
    benefits:
      "Provides opportunities for skill-based short-term training and assessment or recognition of existing skills through the scheme.",
    audience:
      "Candidates interested in skill training or recognition of skills acquired through previous work and experience.",
    eligibility:
      "Course availability, candidate requirements and recognition criteria depend on the current scheme guidelines and training programme.",
    documents:
      "Identity proof, educational or experience details and other documents requested by the training provider may be required.",
    application:
      "Check the latest enrolment forms and training information published through the Goa Government schemes directory.",
  },
  {
    id: 3,
    name: "Dayanand Social Security Scheme (DSSS)",
    shortName: "Social Security Scheme",
    category: "Social Welfare",
    department: "Directorate of Social Welfare, Goa",
    icon: "🤝",
    description:
      "A Goa Government social security scheme providing financial assistance to eligible beneficiaries.",
    benefits:
      "Offers financial support under the conditions and beneficiary categories specified in the official scheme guidelines.",
    audience:
      "Eligible individuals belonging to the beneficiary categories covered by the scheme.",
    eligibility:
      "Age, residence, income and other qualifying conditions must be confirmed from the latest official guidelines.",
    documents:
      "Identity proof, residence proof, income-related documents and other supporting records may be required depending on the applicant category.",
    application:
      "Contact the Directorate of Social Welfare or check the Goa Online portal for the latest application procedure.",
  },
  {
    id: 4,
    name: "Atal Asra Yojana",
    shortName: "Atal Asra Housing Scheme",
    category: "Housing",
    department: "Goa Government – Social Welfare",
    icon: "🏠",
    description:
      "A financial assistance scheme listed by the Goa Government for construction, reconstruction and repairs of houses.",
    benefits:
      "Provides housing-related financial assistance to eligible applicants according to the notified scheme conditions.",
    audience:
      "Applicants who meet the prescribed requirements for housing construction, reconstruction or repair assistance.",
    eligibility:
      "Community category, income, residence, ownership and other requirements must be verified from the latest official scheme notification.",
    documents:
      "Property or ownership records, identity proof, residence proof, income documents and other supporting certificates may be required.",
    application:
      "Refer to the Atal Asra Yojana guidelines and contact the concerned department before submitting an application.",
  },
  {
    id: 5,
    name: "Mukhyamantri Annapurna Yojana",
    shortName: "Annapurna Yojana",
    category: "Food & Welfare",
    department: "Goa Government – Food & Civil Supplies",
    icon: "🌾",
    description:
      "A food and welfare scheme published in the Goa Government schemes directory.",
    benefits:
      "Provides assistance under the provisions of the notified scheme. The current benefits and distribution conditions should be checked in its official guidelines.",
    audience:
      "Beneficiaries who satisfy the conditions laid down under the scheme.",
    eligibility:
      "Household, ration-card and other eligibility conditions must be confirmed using the latest government notification.",
    documents:
      "Ration card, identity proof, residence details and any other documents specified by the implementing department may be needed.",
    application:
      "Check the official notification and contact the relevant Food and Civil Supplies office for application details.",
  },
  {
    id: 6,
    name: "Interest Free Education Loan Scheme for Higher Education",
    shortName: "Interest Free Education Loan",
    category: "Education",
    department: "Goa Government – Education",
    icon: "📚",
    description:
      "A scheme listed by the Goa Government to provide interest-free education loan assistance for higher education.",
    benefits:
      "Offers education loan assistance on an interest-free basis, subject to the scheme's approved terms and conditions.",
    audience:
      "Students pursuing eligible higher education programmes who meet the prescribed conditions.",
    eligibility:
      "Course recognition, admission, residence, financial and repayment-related conditions must be checked in the latest scheme guidelines.",
    documents:
      "Admission proof, academic records, identity and residence proof, income documents and other loan-related paperwork may be required.",
    application:
      "Read the official scheme notification and follow the application instructions issued by the implementing authority.",
  },
  {
    id: 7,
    name: "Manohar Parrikar Goa Scholars Scheme, 2025",
    shortName: "Goa Scholars Scheme",
    category: "Education",
    department: "Goa Government – Higher Education",
    icon: "🏅",
    description:
      "A scholarship scheme listed by the Goa Government for eligible scholars pursuing higher studies.",
    benefits:
      "Provides scholarship assistance under the conditions and selection process specified in the official 2025 scheme.",
    audience:
      "Students and scholars who meet the prescribed academic and other eligibility requirements.",
    eligibility:
      "Academic performance, course, institution and other selection conditions must be checked in the official scheme document.",
    documents:
      "Academic transcripts, admission proof, identity documents and other records requested by the scheme authority may be required.",
    application:
      "Check the latest notification and application instructions on the Goa Government portal.",
  },
  {
    id: 8,
    name: "Scheme for Grant of Scholarship to Students with Disabilities",
    shortName: "Scholarship for Students with Disabilities",
    category: "Education & Inclusion",
    department: "Goa Government – Empowerment of Persons with Disabilities",
    icon: "♿",
    description:
      "A scholarship scheme listed by Goa for students with disabilities pursuing eligible education.",
    benefits:
      "Provides scholarship assistance to eligible students according to the notified provisions.",
    audience:
      "Students with disabilities who satisfy the scheme's academic and other eligibility conditions.",
    eligibility:
      "Disability certification, course, academic and income conditions should be verified from the latest official notification.",
    documents:
      "Disability certificate, academic records, identity proof, residence proof and other documents specified by the department may be required.",
    application:
      "Refer to the latest scheme notification and contact the concerned department for application support.",
  },
];

function Home({ navigate }) {
  const [showAllSchemes, setShowAllSchemes] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  const visibleSchemes = showAllSchemes
    ? schemes
    : schemes.filter((scheme) => scheme.featured);

  return (
    <div className="home-page">
      {/* Welcome section */}
      <section className="welcome-section">
        <div className="welcome-content">
          <span className="welcome-label">YOUR COMMUNITY. YOUR VOICE.</span>

          <h1>
            Let's make your
            <br />
            neighbourhood <span>better.</span>
          </h1>

          <p>
            Report civic problems, follow their progress, and help
            build cleaner, safer and better communities.
          </p>

          <div className="welcome-actions">
            <button
              className="primary-btn"
              onClick={() => navigate("report")}
            >
              Report a Problem <span>→</span>
            </button>

            <button
              className="secondary-btn"
              onClick={() => navigate("track")}
            >
              Track My Reports
            </button>
          </div>
        </div>

        <div className="welcome-illustration">
          <div className="illustration-circle">
            <span className="illustration-leaf">🌿</span>
            <span className="illustration-house">🏡</span>
            <span className="illustration-sun">☀️</span>
          </div>
          <div className="illustration-caption">
            <strong>Better communities start with us.</strong>
            <span>One report can make a difference.</span>
          </div>
        </div>
      </section>

      {/* Citizen profile */}
      <section className="citizen-strip">
        <div className="citizen-info">
          <div className="citizen-avatar">C</div>
          <div>
            <span className="small-label">YOUR CIVICPULSE PROFILE</span>
            <h3>Welcome, Citizen!</h3>
            <p>Your contribution journey starts here.</p>
          </div>
        </div>

        <div className="citizen-badge">
          <span>✦</span>
          <div>
            <strong>Starter</strong>
            <small>Entry-level contributor</small>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="home-section">
        <div className="section-heading">
          <div>
            <span className="small-label">GET INVOLVED</span>
            <h2>Make your voice count</h2>
          </div>
        </div>

        <div className="action-grid">
          <button
            className="action-card report-card"
            onClick={() => navigate("report")}
          >
            <span className="action-icon">📍</span>
            <span className="action-title">Report an Issue</span>
            <span className="action-description">
              Bring a civic problem to the authorities' attention.
            </span>
            <span className="action-arrow">→</span>
          </button>

          <button
            className="action-card anonymous-card"
            onClick={() => navigate("report")}
          >
            <span className="action-icon">🔒</span>
            <span className="action-title">Anonymous Voice</span>
            <span className="action-description">
              Raise a concern without displaying your identity.
            </span>
            <span className="action-arrow">→</span>
          </button>

          <button
            className="action-card track-card"
            onClick={() => navigate("track")}
          >
            <span className="action-icon">📋</span>
            <span className="action-title">Track Reports</span>
            <span className="action-description">
              Follow the progress of your submitted complaints.
            </span>
            <span className="action-arrow">→</span>
          </button>
        </div>
      </section>

      {/* Government schemes */}
      <section className="home-section schemes-section">
        <div className="section-heading schemes-heading">
          <div>
            <span className="small-label">OPPORTUNITIES FOR YOU</span>
            <h2>Government schemes & benefits</h2>
            <p>
              Discover government initiatives, financial assistance and
              opportunities available to eligible citizens.
            </p>
          </div>

          <a
            className="official-directory-link"
            href={officialSchemesUrl}
            target="_blank"
            rel="noreferrer"
          >
            Official directory ↗
          </a>
        </div>

        <div className="scheme-feature-note">
          <span className="scheme-note-icon">📢</span>
          <div>
            <strong>Know what you're eligible for.</strong>
            <p>
              Explore government schemes and check their official
              guidelines before applying.
            </p>
          </div>
        </div>

        <div className="scheme-grid">
          {visibleSchemes.map((scheme) => (
            <button
              className="scheme-card"
              key={scheme.id}
              onClick={() => setSelectedScheme(scheme)}
            >
              <div className="scheme-card-top">
                <span className="scheme-icon">{scheme.icon}</span>
                <span className="scheme-category">{scheme.category}</span>
              </div>

              <h3>{scheme.shortName}</h3>
              <p>{scheme.description}</p>

              <div className="scheme-card-bottom">
                <span>View scheme details</span>
                <span className="scheme-card-arrow">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="schemes-footer">
          <p>
            Showing {visibleSchemes.length} of {schemes.length} schemes
          </p>

          <button
            className="view-schemes-btn"
            onClick={() => setShowAllSchemes((previous) => !previous)}
          >
            {showAllSchemes ? "Show featured schemes ↑" : "View all →"}
          </button>
        </div>

        <p className="scheme-disclaimer">
          Scheme information is a quick overview, not an eligibility decision.
          Benefits, documents, deadlines and application availability are
          subject to the latest official government notifications.
        </p>
      </section>

      {/* Scheme details modal */}
      {selectedScheme && (
        <div
          className="scheme-modal-overlay"
          onClick={() => setSelectedScheme(null)}
        >
          <div
            className="scheme-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scheme-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="scheme-modal-header">
              <div className="scheme-modal-heading">
                <span className="scheme-modal-icon">
                  {selectedScheme.icon}
                </span>
                <div>
                  <span className="scheme-category">
                    {selectedScheme.category}
                  </span>
                  <h2 id="scheme-modal-title">
                    {selectedScheme.name}
                  </h2>
                </div>
              </div>

              <button
                className="scheme-modal-close"
                onClick={() => setSelectedScheme(null)}
                aria-label="Close scheme details"
              >
                ×
              </button>
            </div>

            <div className="scheme-modal-body">
              <div className="scheme-official-label">
                <span>✓</span>
                Listed in the Goa Government schemes directory
              </div>

              <div className="scheme-detail-block">
                <h3>About this scheme</h3>
                <p>{selectedScheme.description}</p>
              </div>

              <div className="scheme-detail-block">
                <h3>Benefits</h3>
                <p>{selectedScheme.benefits}</p>
              </div>

              <div className="scheme-detail-block">
                <h3>Who may benefit?</h3>
                <p>{selectedScheme.audience}</p>
              </div>

              <div className="scheme-detail-block">
                <h3>Eligibility conditions</h3>
                <p>{selectedScheme.eligibility}</p>
              </div>

              <div className="scheme-detail-block">
                <h3>Documents to check</h3>
                <p>{selectedScheme.documents}</p>
              </div>

              <div className="scheme-detail-block">
                <h3>How to apply</h3>
                <p>{selectedScheme.application}</p>
              </div>

              <div className="scheme-department">
                <span>Issuing department / authority</span>
                <strong>{selectedScheme.department}</strong>
              </div>

              <div className="scheme-modal-notice">
                <strong>Before you apply</strong>
                <p>
                  Please confirm the latest eligibility rules, benefits,
                  required documents, application dates and availability
                  with the official department. This overview does not
                  guarantee eligibility.
                </p>
              </div>

              <div className="scheme-modal-actions">
                <a
                  href={officialSchemesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="scheme-apply-btn"
                >
                  View official notification ↗
                </a>

                <a
                  href={goaOnlineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="scheme-online-link"
                >
                  Goa Online portal ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity and nearby issues */}
      <div className="home-two-column">
        <section className="home-section">
          <div className="section-heading">
            <div>
              <span className="small-label">YOUR CONTRIBUTION</span>
              <h2>Your activity</h2>
            </div>

            <button
              className="text-link"
              onClick={() => navigate("track")}
            >
              View all →
            </button>
          </div>

          <div className="empty-section compact-empty">
            <div className="empty-icon">📝</div>
            <h3>No reports yet</h3>
            <p>
              Your submitted civic reports will appear here.
            </p>
            <button
              className="small-primary-btn"
              onClick={() => navigate("report")}
            >
              Submit your first report
            </button>
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading">
            <div>
              <span className="small-label">AROUND YOU</span>
              <h2>Nearby issues</h2>
            </div>

            <button
              className="text-link"
              onClick={() => navigate("track")}
            >
              Explore →
            </button>
          </div>

          <div className="empty-section compact-empty">
            <div className="empty-icon">🗺️</div>
            <h3>No nearby reports to show</h3>
            <p>
              Civic issues in your area will appear here when
              location-based reports become available.
            </p>
          </div>
        </section>
      </div>

      {/* Community leaderboard */}
      <section className="community-banner">
        <div className="community-icon">🏆</div>
        <div className="community-content">
          <span className="small-label">STRONGER TOGETHER</span>
          <h2>Every community can make a difference.</h2>
          <p>
            See how neighbourhoods contribute towards a cleaner
            and better civic environment.
          </p>
        </div>
        <div className="leaderboard-status">
          <span>Community leaderboard</span>
          <strong>Coming soon</strong>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <strong>CivicPulse</strong>
        <span>Building better communities, one voice at a time.</span>
      </footer>
    </div>
  );
}

export default Home;
