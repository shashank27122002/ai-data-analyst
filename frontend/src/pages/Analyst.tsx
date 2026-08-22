import { useEffect, useState } from "react";

import {
  getDatasets,
  askQuestion,
  type Dataset,
} from "../api/api";

import {
  saveReport,
} from "../services/reportService";

interface AnalysisDetails {
  operation: string;
  column: string;
  group_by: string | null;
  filters: Record<string, string>;
  result: unknown;
}

function Analyst() {
  const [datasets, setDatasets] =
    useState<Dataset[]>([]);

  const [selectedDataset, setSelectedDataset] =
    useState<Dataset | null>(null);

  const [question, setQuestion] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [analysisDetails, setAnalysisDetails] =
    useState<AnalysisDetails | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingDatasets, setLoadingDatasets] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reportSaved, setReportSaved] =
    useState(false);


  // ==========================================================
  // LOAD DATASETS
  // ==========================================================

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
        response.datasets || []
      );

      if (
        response.datasets.length > 0
      ) {
        setSelectedDataset(
          response.datasets[0]
        );
      }

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load datasets."
      );

    } finally {

      setLoadingDatasets(false);

    }
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

      setLoading(true);
      setError("");
      setAnswer("");
      setAnalysisDetails(null);
      setReportSaved(false);

      const response =
        await askQuestion(
          selectedDataset.dataset_id,
          question.trim()
        );

      setAnswer(
        response.answer
      );

      setAnalysisDetails(
        response.analysis ?? null
      );

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Failed to process question."
      );

    } finally {

      setLoading(false);

    }
  }


  // ==========================================================
  // SAVE REPORT
  // ==========================================================

  function handleSaveReport() {

    if (
      !selectedDataset ||
      !answer
    ) {
      return;
    }

    saveReport({

      datasetId:
        selectedDataset.dataset_id,

      datasetName:
        selectedDataset.original_filename,

      question:
        question.trim(),

      answer:
        answer,

      operation:
        analysisDetails?.operation,

      column:
        analysisDetails?.column,

      groupBy:
        analysisDetails?.group_by,

      result:
        analysisDetails?.result,

    });

    setReportSaved(true);
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
    setReportSaved(false);
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        style={{
          marginBottom: "32px",
        }}
      >

        <p className="eyebrow">
          AI ANALYST
        </p>

        <h1>
          Ask your data
        </h1>

        <p>
          Ask questions in natural language
          and get answers from your dataset.
        </p>

      </div>


      {/* ====================================================
          QUESTION CARD
      ==================================================== */}

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
              Ask a question about your selected
              dataset.
            </p>

          </div>

        </div>


        {/* DATASET */}

        <div className="dataset-selector">

          <label>
            Dataset
          </label>

          <select
            value={
              selectedDataset?.dataset_id ?? ""
            }
            disabled={
              loadingDatasets
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


        {/* QUESTION */}

        <textarea
          value={question}
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
          placeholder="e.g. What is the total Sales?"
          rows={5}
        />


        {/* FOOTER */}

        <div className="question-footer">

          <span>
            Try: "What is the total Sales?"
          </span>

          <button
            type="button"
            className="ask-button"
            disabled={
              !question.trim() ||
              !selectedDataset ||
              loading
            }
            onClick={
              handleAskQuestion
            }
          >

            {loading
              ? "Analyzing..."
              : "Ask Question"}

            <span>
              →
            </span>

          </button>

        </div>

      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div className="error-message">
          {error}
        </div>

      )}


      {/* ====================================================
          ANSWER
      ==================================================== */}

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


          {/* SAVE REPORT */}

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <button
              type="button"
              className="ask-button"
              onClick={
                handleSaveReport
              }
              disabled={
                reportSaved
              }
            >

              {reportSaved
                ? "Report Saved ✓"
                : "Save Report"}

            </button>

            {reportSaved && (

              <span
                style={{
                  fontSize: "14px",
                  color: "#64748b",
                }}
              >
                Saved to Reports
              </span>

            )}

          </div>

        </div>

      )}


      {/* ====================================================
          ANALYSIS DETAILS
      ==================================================== */}

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


          {/* OPERATION DETAILS */}

          <div className="analysis-details-grid">

            <div className="analysis-detail-item">

              <span>
                Operation
              </span>

              <strong>
                {analysisDetails.operation}
              </strong>

            </div>


            <div className="analysis-detail-item">

              <span>
                Column
              </span>

              <strong>
                {analysisDetails.column || "—"}
              </strong>

            </div>


            <div className="analysis-detail-item">

              <span>
                Group By
              </span>

              <strong>
                {analysisDetails.group_by || "—"}
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

              <div
                className="analysis-result-table-wrapper"
              >

                <table
                  className="analysis-result-table"
                >

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

                        <tr key={key}>

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

    </div>
  );
}

export default Analyst;