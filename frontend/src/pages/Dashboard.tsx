import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import {
  getDatasets,
  askQuestion,
  uploadDataset,
  type Dataset,
} from "../api/api";

import {
  getReports,
} from "../services/reportService";

import type {
  Report,
} from "../types/report";

import type {
  AnalysisDetails,
} from "../types/analysis";


function Dashboard() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [question, setQuestion] =
    useState("");

  const [datasets, setDatasets] =
    useState<Dataset[]>([]);

  const [selectedDataset, setSelectedDataset] =
    useState<Dataset | null>(null);

  const [answer, setAnswer] =
    useState("");

  const [analysisDetails, setAnalysisDetails] =
    useState<AnalysisDetails | null>(null);

  const [recentQuestions, setRecentQuestions] =
    useState<{
      question: string;
      answer: string;
    }[]>([]);

  const [reports, setReports] =
    useState<Report[]>([]);

  const [loadingDatasets, setLoadingDatasets] =
    useState(true);

  const [askingQuestion, setAskingQuestion] =
    useState(false);

  const [uploadingDataset, setUploadingDataset] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {

    loadDashboardData();

  }, []);


  async function loadDashboardData() {

    try {

      setLoadingDatasets(true);

      setError("");

      const response =
        await getDatasets();

      const loadedDatasets =
        response.datasets || [];

      setDatasets(
        loadedDatasets
      );


      if (
        loadedDatasets.length > 0
      ) {

        setSelectedDataset(
          loadedDatasets[0]
        );

      } else {

        setSelectedDataset(null);

      }


      setReports(
        getReports()
      );

    } catch (error) {

      console.error(
        "Failed to load dashboard data:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the backend."
      );

    } finally {

      setLoadingDatasets(false);

    }
  }


  // ==========================================================
  // REFRESH REPORTS
  // ==========================================================

  


  // ==========================================================
  // UPLOAD DATASET
  // ==========================================================

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
      !fileName.endsWith(".xlsx") &&
      !fileName.endsWith(".xls")
    ) {

      setError(
        "Only CSV and Excel files are supported."
      );

      event.target.value = "";

      return;
    }


    try {

      setUploadingDataset(true);

      setError("");

      setAnswer("");

      setAnalysisDetails(null);


      await uploadDataset(
        file
      );


      const response =
        await getDatasets();


      const loadedDatasets =
        response.datasets || [];


      setDatasets(
        loadedDatasets
      );


      if (
        loadedDatasets.length > 0
      ) {

        /*
         * The backend currently returns the
         * datasets in creation order.
         *
         * We select the newest returned dataset.
         */

        const newestDataset =
          loadedDatasets[
            loadedDatasets.length - 1
          ];


        setSelectedDataset(
          newestDataset
        );

      }

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


  // ==========================================================
  // OPEN UPLOAD PICKER
  // ==========================================================

  function openUploadPicker() {

    document
      .getElementById(
        "dataset-upload"
      )
      ?.click();

  }


  // ==========================================================
  // ASK QUESTION
  // ==========================================================

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

      setAnalysisDetails(null);


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


      setAnalysisDetails(
        response.analysis ?? null
      );


      setRecentQuestions(
        previous => [

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


  // ==========================================================
  // DATASET CHANGE
  // ==========================================================

  function handleDatasetChange(
    datasetId: number
  ) {

    const dataset =
      datasets.find(
        item =>
          item.dataset_id ===
          datasetId
      );


    setSelectedDataset(
      dataset ?? null
    );

    setAnswer("");

    setAnalysisDetails(null);

    setError("");

  }


  // ==========================================================
  // RECENT QUESTION
  // ==========================================================

  function handleRecentQuestion(
    recent: {
      question: string;
      answer: string;
    }
  ) {

    setQuestion(
      recent.question
    );

    setAnswer(
      recent.answer
    );

    setAnalysisDetails(
      null
    );

    setError("");

  }


  // ==========================================================
  // DASHBOARD METRICS
  // ==========================================================

  const totalDatasets =
    datasets.length;


  const totalRows =
    datasets.reduce(
      (
        total,
        dataset
      ) =>
        total +
        (
          Number(
            dataset.row_count
          ) || 0
        ),
      0
    );


  const totalColumns =
    datasets.reduce(
      (
        total,
        dataset
      ) =>
        total +
        (
          Number(
            dataset.column_count
          ) || 0
        ),
      0
    );


  const totalReports =
    reports.length;


  // ==========================================================
  // RECENT DATASETS
  // ==========================================================

  const recentDatasets =
    [...datasets]
      .reverse()
      .slice(0, 5);


  // ==========================================================
  // RECENT REPORTS
  // ==========================================================

  const recentReports =
    reports
      .slice(0, 5);


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>

      {/* ====================================================
          TOP BAR
      ==================================================== */}

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
        accept=".csv,.xlsx,.xls"
        style={{
          display: "none",
        }}
        onChange={
          handleUploadDataset
        }
      />


      {/* ====================================================
          WELCOME CARD
      ==================================================== */}

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


      {/* ====================================================
          DASHBOARD KPI CARDS
      ==================================================== */}

      <section className="stats-grid">


        {/* DATASETS */}

        <div className="stat-card">

          <span className="stat-label">
            Datasets
          </span>

          <strong>

            {loadingDatasets
              ? "..."
              : totalDatasets}

          </strong>

          <span className="stat-description">
            Available datasets
          </span>

        </div>


        {/* ROWS */}

        <div className="stat-card">

          <span className="stat-label">
            Total Rows
          </span>

          <strong>

            {loadingDatasets
              ? "..."
              : totalRows.toLocaleString()}

          </strong>

          <span className="stat-description">
            Across all datasets
          </span>

        </div>


        {/* COLUMNS */}

        <div className="stat-card">

          <span className="stat-label">
            Total Columns
          </span>

          <strong>

            {loadingDatasets
              ? "..."
              : totalColumns.toLocaleString()}

          </strong>

          <span className="stat-description">
            Across all datasets
          </span>

        </div>


        {/* REPORTS */}

        <div className="stat-card">

          <span className="stat-label">
            Reports
          </span>

          <strong>
            {totalReports}
          </strong>

          <span className="stat-description">
            Saved analyses
          </span>

        </div>

      </section>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div className="error-message">
          {error}
        </div>

      )}


      {/* ====================================================
          RECENT DATASETS
      ==================================================== */}

      <section
        style={{
          marginTop: "32px",
        }}
      >

        <div className="section-heading">

          <div>

            <p className="eyebrow">
              DATASETS
            </p>

            <h2>
              Recent datasets
            </h2>

          </div>

        </div>


        {recentDatasets.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              ◫
            </div>

            <h3>
              No datasets yet
            </h3>

            <p>
              Upload a dataset to start
              analyzing your data.
            </p>

          </div>

        ) : (

          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >

            {recentDatasets.map(
              dataset => (

                <div
                  key={
                    dataset.dataset_id
                  }
                  className="card"
                  style={{
                    padding:
                      "20px 24px",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap:
                        "20px",
                    }}
                  >

                    <div>

                      <h3>
                        {
                          dataset.original_filename
                        }
                      </h3>

                      <p>
                        Dataset ID:{" "}
                        {
                          dataset.dataset_id
                        }
                      </p>

                    </div>


                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "24px",
                        flexShrink:
                          0,
                      }}
                    >

                      <div>

                        <span
                          className="stat-label"
                        >
                          Rows
                        </span>

                        <strong>
                          {
                            Number(
                              dataset.row_count ||
                              0
                            ).toLocaleString()
                          }
                        </strong>

                      </div>


                      <div>

                        <span
                          className="stat-label"
                        >
                          Columns
                        </span>

                        <strong>
                          {
                            Number(
                              dataset.column_count ||
                              0
                            ).toLocaleString()
                          }
                        </strong>

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ====================================================
          ANALYSIS SECTION
      ==================================================== */}

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


        {/* ==================================================
            QUESTION CARD
        ================================================== */}

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
                  selectedDataset?.dataset_id ??
                  ""
                }
                onChange={event =>
                  handleDatasetChange(
                    Number(
                      event.target.value
                    )
                  )
                }
              >

                {datasets.map(
                  dataset => (

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


          {/* QUESTION */}

          <textarea
            value={
              question
            }

            onChange={event =>
              setQuestion(
                event.target.value
              )
            }

            onKeyDown={event => {

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


          {/* QUESTION FOOTER */}

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


        {/* ==================================================
            ANSWER
        ================================================== */}

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


        {/* ==================================================
            ANALYSIS DETAILS
        ================================================== */}

        {analysisDetails && (

          <div className="analysis-details-card">

            <div className="analysis-details-header">

              <div className="analysis-details-icon">
                ◉
              </div>

              <div>

                <p className="eyebrow">
                  ANALYSIS DETAILS
                </p>

                <h3>
                  How this answer was calculated
                </h3>

              </div>

            </div>


            <div className="analysis-details-grid">

              <div className="analysis-detail-item">

                <span>
                  Operation
                </span>

                <strong>
                  {
                    analysisDetails.operation
                  }
                </strong>

              </div>


              <div className="analysis-detail-item">

                <span>
                  Column
                </span>

                <strong>
                  {
                    analysisDetails.column ||
                    "—"
                  }
                </strong>

              </div>


              <div className="analysis-detail-item">

                <span>
                  Group By
                </span>

                <strong>
                  {
                    analysisDetails.group_by ||
                    "—"
                  }
                </strong>

              </div>

            </div>


            {/* FILTERS */}

            {Object.keys(
              analysisDetails.filters || {}
            ).length > 0 && (

              <div className="analysis-filters">

                <h4>
                  Filters
                </h4>

                <div className="filter-list">

                  {Object.entries(
                    analysisDetails.filters
                  ).map(
                    ([key, value]) => (

                      <span
                        className="filter-badge"
                        key={key}
                      >

                        {key} = {value}

                      </span>

                    )
                  )}

                </div>

              </div>

            )}


            {/* RESULT */}

            <div className="analysis-result">

              <h4>
                Result
              </h4>


              {(
                analysisDetails.operation ===
                  "group_sum" ||

                analysisDetails.operation ===
                  "group_average" ||

                analysisDetails.operation ===
                  "top_n" ||

                analysisDetails.operation ===
                  "bottom_n"

              ) &&

              analysisDetails.result !== null &&

              typeof analysisDetails.result ===
                "object" &&

              !Array.isArray(
                analysisDetails.result
              ) ? (

                <div className="analysis-result-table-wrapper">

                  <table className="analysis-result-table">

                    <thead>

                      <tr>

                        <th>
                          {
                            analysisDetails.group_by ||
                            "Group"
                          }
                        </th>

                        <th>
                          {
                            analysisDetails.column ||
                            "Value"
                          }
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {Object.entries(
                        analysisDetails.result as Record<
                          string,
                          unknown
                        >
                      ).map(
                        ([key, value]) => (

                          <tr
                            key={key}
                          >

                            <td>
                              {key}
                            </td>

                            <td>

                              {typeof value ===
                              "number"

                                ? value.toLocaleString()

                                : String(
                                    value
                                  )}

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              ) : (

                <pre>
                  {JSON.stringify(
                    analysisDetails.result,
                    null,
                    2
                  )}
                </pre>

              )}

            </div>

          </div>

        )}

      </section>


      {/* ====================================================
          RECENT REPORTS
      ==================================================== */}

      <section
        style={{
          marginTop:
            "40px",
        }}
      >

        <div className="section-heading">

          <div>

            <p className="eyebrow">
              REPORTS
            </p>

            <h2>
              Recent reports
            </h2>

          </div>

        </div>


        {recentReports.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              ▤
            </div>

            <h3>
              No saved reports
            </h3>

            <p>
              Save an analysis from the
              Analyst page to see it here.
            </p>

          </div>

        ) : (

          <div
            style={{
              display:
                "grid",
              gap:
                "12px",
            }}
          >

            {recentReports.map(
              report => (

                <div
                  key={
                    report.id
                  }
                  className="card"
                  style={{
                    padding:
                      "20px 24px",
                  }}
                >

                  <div>

                    <p
                      style={{
                        fontWeight:
                          600,
                        marginBottom:
                          "6px",
                      }}
                    >
                      {
                        report.question
                      }
                    </p>

                    <p
                      style={{
                        marginBottom:
                          "6px",
                      }}
                    >
                      {
                        report.answer
                      }
                    </p>

                    <span
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#64748b",
                      }}
                    >
                      {
                        report.datasetName
                      }
                      {" · "}
                      {
                        report.operation ||
                        "analysis"
                      }
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ====================================================
          RECENT QUESTIONS
      ==================================================== */}

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
              (
                recent,
                index
              ) => (

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
                      {
                        recent.question
                      }
                    </h3>

                    <p>
                      {
                        recent.answer
                      }
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

export default Dashboard;