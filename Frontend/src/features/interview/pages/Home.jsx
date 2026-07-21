import React, { useState, useRef, useEffect } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";

const MAX_JD_CHARS = 2000;

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { loading, generateReport, reports, getAllReports } = useInterview();

  useEffect(() => {
    getAllReports();
  }, []);

  const handleJobDescriptionChange = (e) => {
    const value = e.target.value.slice(0, MAX_JD_CHARS);
    setJobDescription(value);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;
    setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const [errorMsg, setErrorMsg] = useState(null);

  const handleGenerate = async () => {
    setErrorMsg(null);
    const data = await generateReport({
      jobDescription,
      selfDescription,
      resumeFile,
    });

    console.log("Generated report data:", data); // TEMP: see actual shape

    if (data?._id) {
      navigate(`/interview/${data._id}`);
    } else {
      setErrorMsg(
        "Something went wrong generating your report. Please try again.",
      );
    }
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <h1>Loading your interview plan...</h1>
      </main>
    );
  }
  console.log("Reports:", reports);

  return (
    <div className="interview-plan-page">
      <header className="interview-plan-header">
        <h1>
          Create Your Custom <span className="accent">Interview Plan</span>
        </h1>
        <p>
          Let our AI analyze the job requirements and your profile to tailor the
          perfect interview strategy.
        </p>
      </header>
      <div className="interview-plan-card">
        <div className="interview-plan-card__body">
          {/* Left column */}
          <section className="panel">
            <div className="panel__heading">
              <span className="panel__icon panel__icon--doc" aria-hidden="true">
                <DocIcon />
              </span>
              <h2>Target Job Description</h2>
              <span className="panel__counter">
                {jobDescription.length}/{MAX_JD_CHARS}
              </span>
            </div>

            <textarea
              className="jd-textarea"
              placeholder={
                "Paste the full job description here.\nThis helps our AI understand the required skills, technologies, and responsibilities to generate relevant questions."
              }
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              maxLength={MAX_JD_CHARS}
            />
            <div className="jd-textarea__footer">
              {jobDescription.length} / {MAX_JD_CHARS} chars
            </div>
          </section>

          {/* Divider */}
          <div className="panel-divider" aria-hidden="true" />

          {/* Right column */}
          <section className="panel">
            <div className="panel__heading">
              <span
                className="panel__icon panel__icon--user"
                aria-hidden="true"
              >
                <UserIcon />
              </span>
              <h2>Your Profile</h2>
            </div>

            <div className="field-label">
              Upload Resume<span className="optional">[BEST RESULTS]</span>
            </div>

            <label
              className={`dropzone ${isDragging ? "dropzone--active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                hidden
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <span className="dropzone__icon" aria-hidden="true">
                <UploadIcon />
              </span>
              <span className="dropzone__title">
                {resumeFile
                  ? resumeFile.name
                  : "Click to upload or drag & drop"}
              </span>
              <span className="dropzone__subtitle">PDF or DOCX (Max 5MB)</span>
            </label>

            <div className="or-divider">
              <span />
              <p>OR</p>
              <span />
            </div>

            {/* <textarea
              className="resume-textarea"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            /> */}

            <div className="field-label field-label--section">
              Quick Self-Description
            </div>
            <textarea
              className="self-description-textarea"
              placeholder="Briefly describe your experience, key skills, achievements, and career aspirations..."
              value={selfDescription}
              onChange={(e) => setSelfDescription(e.target.value)}
            />

            <div className="tip-box">
              <span className="tip-box__icon" aria-hidden="true">
                <SparkIcon />
              </span>
              <p>
                Either a Resume or a Self Description is required to required to
                generate a personalized interview strategy. The more information
                you provide, the better the AI can tailor the questions and
                guidance to your profile.
              </p>
            </div>
          </section>
        </div>

        <div className="interview-plan-card__footer">
          <p className="ats-note">AI-Powered Strategy Generation-Approx 30s</p>
          {errorMsg && <p className="error-text">{errorMsg}</p>}
          <button className="generate-btn" onClick={handleGenerate}>
            <SparkleClusterIcon />
            Generate My Interview Strategy
          </button>
        </div>
      </div>
      {/* Recent Reports List */}
      {reports?.length > 0 && (
        <section className="recent-reports">
          <h2>My Recent Interview Plans</h2>
          <ul className="reports-list">
            {reports.map((report) => (
              <li
                key={report._id}
                className="report-item"
                onClick={() => navigate(`/interview/${report._id}`)}
              >
                <h3>{report.title || "Untitled Position"}</h3>
                <p className="report-meta">
                  Generated on {new Date(report.createdAt).toLocaleDateString()}
                </p>
                <p
                  className={`match-score ${report.matchScore >= 80 ? "score--high" : report.matchScore >= 60 ? "score--mid" : "score--low"}`}
                >
                  Match Score: {report.matchScore}%
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <footer className="page-footer">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Help Center</a>
      </footer>
    </div>
  );
}

/* --- Inline icons (no external deps) --- */

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2h8l4 4v16H6V2zm7 1.5V7h3.5L13 3.5zM8 12h8v1.5H8V12zm0 3h8v1.5H8V15zm0-6h4v1.5H8V9z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.4 0-9 2.2-9 5v3h18v-3c0-2.8-4.6-5-9-5z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
    </svg>
  );
}

function SparkleClusterIcon() {
  return (
    <svg
      className="generate-btn__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9 2l1.2 3.8L14 7l-3.8 1.2L9 12l-1.2-3.8L4 7l3.8-1.2L9 2z" />
      <path d="M17.5 12l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z" />
    </svg>
  );
}
