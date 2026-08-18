import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import "./App.css";

import {
  getDatasets,
  askQuestion,
  uploadDataset,
  getDatasetPreview,
  type Dataset,
  type DatasetPreviewResponse,
} from "./api/api";

interface RecentQuestion {
  question: string;
  answer: string;
}

type Page =
  | "dashboard"
  | "datasets"
  | "analyst"
  | "reports";

function App() {
  const [question, setQuestion] = useState("");

  const [datasets, setDatasets] =
    useState<Dataset[]>([]);

  const [selectedDataset, setSelectedDataset] =
    useState<Dataset | null>(null);

  const [answer, setAnswer] =
    useState("");

  const [recentQuestions, setRecentQuestions] =
    useState<RecentQuestion[]>([]);

  const [loadingDatasets, setLoadingDatasets] =
    useState(true);

  const [askingQuestion, setAskingQuestion] =
    useState(false);

  const [uploadingDataset, setUploadingDataset] =
    useState(false);

  const [preview, setPreview] =
    useState<DatasetPreviewResponse | null>(null);

  const [loadingPreview, setLoadingPreview] =
    useState(false);

  const [error, setError] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState<Page>("dashboard");

  // ========================================================
  // LOAD DATASETS
  // ========================================================

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      setLoadingDatasets(true);
      setError("");

      const response =
        await getDatasets();

      setDatasets(
        response.datasets
      );

      if (
        response.datasets.length > 0
      ) {
        setSelectedDataset(
          response.datasets[0]
        );
      }
    } catch (error) {
      console.error(
        "Failed to load datasets:",
        error
      );

      setError(
        "Unable to connect to the backend."
      );
    } finally {
      setLoadingDatasets(false);
    }
  }

  // ========================================================
  // UPLOAD DATASET
  // ========================================================

  async function handleUploadDataset(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName =
      file.name.toLowerCase();

    if (
      !fileName.endsWith(".csv") &&
      !fileName.endsWith(".xlsx")
    ) {
      setError(
        "Only CSV and Excel (.xlsx) files are supported."
      );

      event.target.value = "";

      return;
    }

    try {
      setUploadingDataset(true);
      setError("");
      setAnswer("");
      setPreview(null);

      console.log(
        "Uploading dataset:",
        file.name
      );

      const response =
        await uploadDataset(file);

      console.log(
        "Dataset uploaded:",
        response
      );

      const datasetsResponse =
        await getDatasets();

      const updatedDatasets =
        datasetsResponse.datasets;

      setDatasets(
        updatedDatasets
      );

      const newDataset =
        updatedDatasets.find(
          (dataset) =>
            dataset.dataset_id ===
            response.database?.dataset_id
        );

      if (newDataset) {
        setSelectedDataset(
          newDataset
        );
      } else if (
        updatedDatasets.length > 0
      ) {
        setSelectedDataset(
          updatedDatasets[
            updatedDatasets.length - 1
          ]
        );
      }

      setCurrentPage(
        "dashboard"
      );

    } catch (error) {
      console.error(
        "Dataset upload failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload dataset."
      );
    } finally {
      setUploadingDataset(false);

      event.target.value = "";
    }
  }

  // ========================================================
  // OPEN FILE PICKER
  // ========================================================

  function openUploadPicker() {
    document
      .getElementById(
        "dataset-upload"
      )
      ?.click();
  }

  // ========================================================
  // ASK QUESTION
  // ========================================================

  async function handleAskQuestion() {
    if (!question.trim()) {
      return;
    }

    if (!selectedDataset) {
      setError(
        "Please select a dataset first."
      );

      return;
    }

    try {
      setAskingQuestion(true);
      setError("");
      setAnswer("");

      const currentQuestion =
        question.trim();

      const response =
        await askQuestion(
          selectedDataset.dataset_id,
          currentQuestion
        );

      setAnswer(
        response.answer
      );

      setRecentQuestions(
        (previous) => [
          {
            question:
              currentQuestion,

            answer:
              response.answer,
          },
          ...previous,
        ].slice(0, 5)
      );
    } catch (error) {
      console.error(
        "Question failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to process the question."
      );
    } finally {
      setAskingQuestion(false);
    }
  }

  // ========================================================
  // RECENT QUESTION
  // ========================================================

  function handleRecentQuestion(
    recent: RecentQuestion
  ) {
    setQuestion(
      recent.question
    );

    setAnswer(
      recent.answer
    );

    setError("");

    setCurrentPage(
      "dashboard"
    );
  }

  // ========================================================
  // SELECT DATASET
  // ========================================================

  function handleDatasetChange(
    datasetId: number
  ) {
    const dataset =
      datasets.find(
        (item) =>
          item.dataset_id ===
          datasetId
      );

    setSelectedDataset(
      dataset ?? null
    );

    setAnswer("");
    setPreview(null);
    setError("");
  }

  // ========================================================
  // PREVIEW DATASET
  // ========================================================

  async function handlePreviewDataset(
    datasetId: number
  ) {
    try {
      setLoadingPreview(true);
      setError("");
      setPreview(null);

      const response =
        await getDatasetPreview(
          datasetId,
          10
        );

      setPreview(response);

    } catch (error) {
      console.error(
        "Failed to load preview:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dataset preview."
      );
    } finally {
      setLoadingPreview(false);
    }
  }

  // ========================================================
  // NAVIGATION
  // ========================================================

  function handleNavigation(
    page: Page
  ) {
    setCurrentPage(page);
    setError("");
  }

  // ========================================================
  // SIDEBAR
  // ========================================================

  function renderSidebar() {
    return (
      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            AI
          </div>

          <div>
            <h2>
              AI Data Analyst
            </h2>

            <span>
              Intelligent analytics
            </span>
          </div>

        </div>

        <nav className="navigation">

          <button
            className={`nav-item ${
              currentPage === "dashboard"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              handleNavigation(
                "dashboard"
              )
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${
              currentPage === "datasets"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              handleNavigation(
                "datasets"
              )
            }
          >
            <span>▣</span>
            Datasets
          </button>

          <button
            className={`nav-item ${
              currentPage === "analyst"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              handleNavigation(
                "analyst"
              )
            }
          >
            <span>◉</span>
            AI Analyst
          </button>

          <button
            className={`nav-item ${
              currentPage === "reports"
                ? "active"
                : ""
            }`}
            type="button"
            onClick={() =>
              handleNavigation(
                "reports"
              )
            }
          >
            <span>▤</span>
            Reports
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="status">

            <span className="status-dot"></span>

            {error
              ? "Backend connection error"
              : "Backend connected"}

          </div>

        </div>

      </aside>
    );
  }

  // ========================================================
  // DASHBOARD
  // ========================================================

  function renderDashboard() {
    return (
      <>

        <header className="topbar">

          <div>

            <p className="eyebrow">
              AI DATA ANALYST
            </p>

            <h1>
              Dashboard
            </h1>

          </div>

          <button
            className="upload-button"
            type="button"
            disabled={
              uploadingDataset
            }
            onClick={
              openUploadPicker
            }
          >
            {uploadingDataset
              ? "Uploading..."
              : "+ Upload Dataset"}
          </button>

        </header>

        <input
          id="dataset-upload"
          type="file"
          accept=".csv,.xlsx"
          style={{
            display: "none",
          }}
          onChange={
            handleUploadDataset
          }
        />

        {/* WELCOME */}

        <section className="welcome-card">

          <div>

            <p className="welcome-label">
              Welcome back
            </p>

            <h2>
              Ask questions.
              <br />
              Get insights from your data.
            </h2>

            <p className="welcome-description">
              Upload a dataset and use natural
              language to analyze sales, customers,
              products and more.
            </p>

          </div>

          <div className="welcome-icon">
            ✦
          </div>

        </section>

        {/* STATISTICS */}

        <section className="stats-grid">

          <div className="stat-card">

            <span className="stat-label">
              Datasets
            </span>

            <strong>
              {datasets.length}
            </strong>

            <span className="stat-description">
              Available datasets
            </span>

          </div>

          <div className="stat-card">

            <span className="stat-label">
              Rows
            </span>

            <strong>
              {selectedDataset?.row_count ?? 0}
            </strong>

            <span className="stat-description">
              Across selected dataset
            </span>

          </div>

          <div className="stat-card">

            <span className="stat-label">
              Columns
            </span>

            <strong>
              {selectedDataset?.column_count ?? 0}
            </strong>

            <span className="stat-description">
              Available fields
            </span>

          </div>

        </section>

        {/* ANALYST */}

        <section className="analyst-section">

          <div className="section-heading">

            <div>

              <p className="eyebrow">
                ANALYSIS
              </p>

              <h2>
                Ask your dataset
              </h2>

            </div>

            <span className="dataset-badge">

              {loadingDatasets
                ? "Loading..."
                : selectedDataset
                  ? selectedDataset.original_filename
                  : "No dataset"}

            </span>

          </div>

          <div className="question-card">

            <div className="question-header">

              <div className="question-icon">
                ✦
              </div>

              <div>

                <h3>
                  What would you like to know?
                </h3>

                <p>
                  Ask a question in natural language.
                </p>

              </div>

            </div>

            {/* DATASET SELECTOR */}

            {datasets.length > 0 && (

              <div className="dataset-selector">

                <label>
                  Dataset
                </label>

                <select
                  value={
                    selectedDataset?.dataset_id ?? ""
                  }
                  onChange={(event) =>
                    handleDatasetChange(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >

                  {datasets.map(
                    (dataset) => (

                      <option
                        key={
                          dataset.dataset_id
                        }
                        value={
                          dataset.dataset_id
                        }
                      >
                        {
                          dataset.original_filename
                        }
                      </option>

                    )
                  )}

                </select>

              </div>

            )}

            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={(event) => {

                if (
                  event.key === "Enter" &&
                  event.ctrlKey
                ) {

                  event.preventDefault();

                  handleAskQuestion();

                }

              }}
              placeholder="e.g. What are the top 3 products by sales?"
              rows={4}
            />

            <div className="question-footer">

              <span>
                Try: "Which products were sold in South?"
              </span>

              <button
                className="ask-button"
                type="button"
                disabled={
                  !question.trim() ||
                  !selectedDataset ||
                  askingQuestion
                }
                onClick={
                  handleAskQuestion
                }
              >

                {askingQuestion
                  ? "Analyzing..."
                  : "Ask Question"}

                <span>
                  →
                </span>

              </button>

            </div>

          </div>

          {/* ERROR */}

          {error && (

            <div className="error-message">
              {error}
            </div>

          )}

          {/* ANSWER */}

          {answer && (

            <div className="answer-card">

              <div className="answer-header">

                <div className="answer-icon">
                  ✦
                </div>

                <div>

                  <p className="eyebrow">
                    AI ANALYSIS
                  </p>

                  <h3>
                    Answer
                  </h3>

                </div>

              </div>

              <p className="answer-text">
                {answer}
              </p>

            </div>

          )}

        </section>

        {/* RECENT QUESTIONS */}

        <section className="recent-section">

          <div className="section-heading">

            <div>

              <p className="eyebrow">
                HISTORY
              </p>

              <h2>
                Recent questions
              </h2>

            </div>

          </div>

          {recentQuestions.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ⌁
              </div>

              <h3>
                No questions yet
              </h3>

              <p>
                Your recent dataset questions
                will appear here.
              </p>

            </div>

          ) : (

            <div className="recent-questions">

              {recentQuestions.map(
                (recent, index) => (

                  <button
                    key={`${recent.question}-${index}`}
                    type="button"
                    className="recent-question-card"
                    onClick={() =>
                      handleRecentQuestion(
                        recent
                      )
                    }
                  >

                    <div className="recent-question-icon">
                      ✦
                    </div>

                    <div className="recent-question-content">

                      <h3>
                        {recent.question}
                      </h3>

                      <p>
                        {recent.answer}
                      </p>

                    </div>

                    <span className="recent-arrow">
                      →
                    </span>

                  </button>

                )
              )}

            </div>

          )}

        </section>

      </>
    );
  }

  // ========================================================
  // DATASETS PAGE
  // ========================================================

  function renderDatasets() {
    return (
      <>

        <header className="topbar">

          <div>

            <p className="eyebrow">
              AI DATA ANALYST
            </p>

            <h1>
              Datasets
            </h1>

          </div>

          <button
            className="upload-button"
            type="button"
            disabled={
              uploadingDataset
            }
            onClick={
              openUploadPicker
            }
          >
            {uploadingDataset
              ? "Uploading..."
              : "+ Upload Dataset"}
          </button>

        </header>

        <section className="datasets-page">

          <div className="section-heading">

            <div>

              <p className="eyebrow">
                DATA LIBRARY
              </p>

              <h2>
                Your datasets
              </h2>

            </div>

            <span className="dataset-badge">
              {datasets.length} dataset
              {datasets.length === 1
                ? ""
                : "s"}
            </span>

          </div>

          {loadingDatasets ? (

            <div className="empty-state">

              <h3>
                Loading datasets...
              </h3>

            </div>

          ) : datasets.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ▣
              </div>

              <h3>
                No datasets available
              </h3>

              <p>
                Upload a dataset to start
                analyzing your data.
              </p>

            </div>

          ) : (

            <div className="dataset-list">

              {datasets.map(
                (dataset) => (

                  <div
                    className={`dataset-card ${
                      selectedDataset?.dataset_id ===
                      dataset.dataset_id
                        ? "selected"
                        : ""
                    }`}
                    key={
                      dataset.dataset_id
                    }
                  >

                    <div className="dataset-card-icon">
                      ▣
                    </div>

                    <div className="dataset-card-content">

                      <h3>
                        {
                          dataset.original_filename
                        }
                      </h3>

                      <p>
                        Dataset ID:{" "}
                        {dataset.dataset_id}
                      </p>

                      <div className="dataset-meta">

                        <span>
                          {dataset.row_count} rows
                        </span>

                        <span>
                          {dataset.column_count} columns
                        </span>

                        {dataset.file_type && (
                          <span>
                            {dataset.file_type}
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="dataset-card-actions">

                      <button
                        type="button"
                        className="dataset-preview-button"
                        onClick={() =>
                          handlePreviewDataset(
                            dataset.dataset_id
                          )
                        }
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        className="dataset-select-button"
                        onClick={() => {

                          setSelectedDataset(
                            dataset
                          );

                          setAnswer("");
                          setPreview(null);
                          setError("");

                          setCurrentPage(
                            "dashboard"
                          );

                        }}
                      >
                        Analyze
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

          {/* PREVIEW */}

          {loadingPreview && (

            <div className="empty-state">

              <h3>
                Loading preview...
              </h3>

            </div>

          )}

          {preview &&
            !loadingPreview && (

              <section className="preview-section">

                <div className="section-heading">

                  <div>

                    <p className="eyebrow">
                      DATA PREVIEW
                    </p>

                    <h2>
                      {
                        preview.original_filename
                      }
                    </h2>

                  </div>

                  <span className="dataset-badge">
                    Showing{" "}
                    {preview.preview_rows} of{" "}
                    {preview.total_rows} rows
                  </span>

                </div>

                <div className="preview-table-wrapper">

                  <table className="preview-table">

                    <thead>

                      <tr>

                        {preview.columns.map(
                          (column) => (

                            <th key={column}>
                              {column}
                            </th>

                          )
                        )}

                      </tr>

                    </thead>

                    <tbody>

                      {preview.data.map(
                        (row, rowIndex) => (

                          <tr
                            key={rowIndex}
                          >

                            {preview.columns.map(
                              (column) => (

                                <td
                                  key={column}
                                >
                                  {row[column] ===
                                    null ||
                                  row[column] ===
                                    undefined
                                    ? "—"
                                    : String(
                                        row[column]
                                      )}
                                </td>

                              )
                            )}

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </section>

            )}

        </section>

      </>
    );
  }

  // ========================================================
  // AI ANALYST PAGE
  // ========================================================

  function renderAnalyst() {
    return (
      <>

        <header className="topbar">

          <div>

            <p className="eyebrow">
              AI DATA ANALYST
            </p>

            <h1>
              AI Analyst
            </h1>

          </div>

        </header>

        <section className="welcome-card">

          <div>

            <p className="welcome-label">
              Natural language analysis
            </p>

            <h2>
              Ask your data
              <br />
              anything.
            </h2>

            <p className="welcome-description">
              Select a dataset and ask questions
              using natural language.
            </p>

          </div>

          <div className="welcome-icon">
            ✦
          </div>

        </section>

        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
          }}
        >

          <button
            className="upload-button"
            type="button"
            onClick={() =>
              setCurrentPage(
                "dashboard"
              )
            }
          >
            Go to Dashboard
          </button>

        </div>

      </>
    );
  }

  // ========================================================
  // REPORTS PAGE
  // ========================================================

  function renderReports() {
    return (
      <>

        <header className="topbar">

          <div>

            <p className="eyebrow">
              AI DATA ANALYST
            </p>

            <h1>
              Reports
            </h1>

          </div>

        </header>

        <div className="empty-state">

          <div className="empty-icon">
            ▤
          </div>

          <h3>
            Reports coming soon
          </h3>

          <p>
            Generated data analysis reports
            will appear here.
          </p>

        </div>

      </>
    );
  }

  // ========================================================
  // MAIN RENDER
  // ========================================================

  return (
    <div className="app">

      {renderSidebar()}

      <main className="main-content">

        {currentPage === "dashboard" &&
          renderDashboard()}

        {currentPage === "datasets" &&
          renderDatasets()}

        {currentPage === "analyst" &&
          renderAnalyst()}

        {currentPage === "reports" &&
          renderReports()}

      </main>

    </div>
  );
}

export default App;