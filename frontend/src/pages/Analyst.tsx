import { useEffect, useState } from "react";

import {
  getDatasets,
  askQuestion,
  type Dataset,
} from "../api/api";

import {
  saveReport,
} from "../services/reportService";

import type {
  AnalysisDetails,
} from "../types/analysis";


function Analyst() {

  // ==========================================================
  // STATE
  // ==========================================================

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
        response.datasets &&
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
  // CHECK IF RESULT CAN BE VISUALIZED
  // ==========================================================

  function isGroupedResult(): boolean {

    if (!analysisDetails) {
      return false;
    }

    const groupedOperations = [

      "group_sum",

      "group_average",

      "group_count",

      "group_percentage",

      "top_n",

      "bottom_n",

    ];

    if (
      !groupedOperations.includes(
        analysisDetails.operation
      )
    ) {

      return false;

    }

    return (

      analysisDetails.result !== null &&

      typeof analysisDetails.result ===
        "object" &&

      !Array.isArray(
        analysisDetails.result
      )

    );
  }


  // ==========================================================
  // GET GROUPED RESULT
  // ==========================================================

  function getGroupedResult(): Record<
    string,
    unknown
  > {

    if (

      !analysisDetails ||

      !analysisDetails.result ||

      typeof analysisDetails.result !==
        "object" ||

      Array.isArray(
        analysisDetails.result
      )

    ) {

      return {};

    }

    return analysisDetails.result as Record<
      string,
      unknown
    >;
  }


  // ==========================================================
  // GET NUMERIC CHART VALUES
  // ==========================================================

  function getChartValues(): Array<{
    label: string;
    value: number;
  }> {

    const groupedResult =
      getGroupedResult();

    return Object.entries(
      groupedResult
    )

      .map(
        ([label, value]) => {

          const numericValue =
            typeof value === "number"
              ? value
              : Number(value);

          return {
            label,
            value: numericValue,
          };

        }
      )

      .filter(
        item =>
          Number.isFinite(
            item.value
          )
      );
  }


  // ==========================================================
  // GET MAXIMUM CHART VALUE
  // ==========================================================

  function getChartMaximum(): number {

    const values =
      getChartValues();

    if (values.length === 0) {
      return 0;
    }

    return Math.max(
      ...values.map(
        item => item.value
      )
    );
  }


  // ==========================================================
  // FORMAT NUMBER
  // ==========================================================

  function formatNumber(
    value: number
  ): string {

    return value.toLocaleString(
      "en-IN"
    );
  }


  // ==========================================================
  // FORMAT PERCENTAGE
  // ==========================================================

  function formatPercentage(
    value: number
  ): string {

    return `${value.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}%`;
  }


  // ==========================================================
  // GET VISUALIZATION TITLE
  // ==========================================================

  function getVisualizationTitle(): string {

    if (!analysisDetails) {
      return "Analysis Chart";
    }

    const operation =
      analysisDetails.operation;

    const group =
      analysisDetails.group_by ||
      "Group";

    const column =
      analysisDetails.column ||
      "Value";


    // --------------------------------------------------------
    // GROUP COUNT
    // --------------------------------------------------------

    if (
      operation === "group_count"
    ) {

      return `Count by ${group}`;

    }


    // --------------------------------------------------------
    // GROUP PERCENTAGE
    // --------------------------------------------------------

    if (
      operation ===
      "group_percentage"
    ) {

      return `Percentage by ${group}`;

    }


    // --------------------------------------------------------
    // GROUP SUM
    // --------------------------------------------------------

    if (
      operation === "group_sum"
    ) {

      return `${column} by ${group}`;

    }


    // --------------------------------------------------------
    // GROUP AVERAGE
    // --------------------------------------------------------

    if (
      operation ===
      "group_average"
    ) {

      return `Average ${column} by ${group}`;

    }


    // --------------------------------------------------------
    // TOP N
    // --------------------------------------------------------

    if (
      operation === "top_n"
    ) {

      return `Top ${group} by ${column}`;

    }


    // --------------------------------------------------------
    // BOTTOM N
    // --------------------------------------------------------

    if (
      operation === "bottom_n"
    ) {

      return `Bottom ${group} by ${column}`;

    }


    return `${column} by ${group}`;
  }


  // ==========================================================
  // GET RESULT TABLE VALUE LABEL
  // ==========================================================

  function getResultValueLabel(): string {

    if (!analysisDetails) {
      return "Value";
    }

    if (
      analysisDetails.operation ===
      "group_count"
    ) {

      return "Count";

    }

    if (
      analysisDetails.operation ===
      "group_percentage"
    ) {

      return "Percentage";

    }

    return (
      analysisDetails.column ||
      "Value"
    );
  }


  // ==========================================================
  // CHECK IF RESULT IS TABLE DATA
  // ==========================================================

  function isTableResult(): boolean {

    if (!analysisDetails) {
      return false;
    }

    const tableOperations = [

      "group_sum",

      "group_average",

      "group_count",

      "group_percentage",

      "top_n",

      "bottom_n",

    ];

    return (
      tableOperations.includes(
        analysisDetails.operation
      ) &&

      analysisDetails.result !== null &&

      typeof analysisDetails.result ===
        "object" &&

      !Array.isArray(
        analysisDetails.result
      )
    );
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


        {/* ==================================================
            DATASET
        ================================================== */}

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


        {/* ==================================================
            QUESTION
        ================================================== */}

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


        {/* ==================================================
            FOOTER
        ================================================== */}

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


          {/* ==================================================
              SAVE REPORT
          ================================================== */}

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


          {/* ==================================================
              HEADER
          ================================================== */}

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


          {/* ==================================================
              OPERATION DETAILS
          ================================================== */}

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


          {/* ==================================================
              FILTERS
          ================================================== */}

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

                      {key} = {String(value)}

                    </span>

                  )
                )}

              </div>

            </div>

          )}


          {/* ==================================================
              RESULT
          ================================================== */}

          <div className="analysis-result">

            <h4>
              Result
            </h4>


            {/* =================================================
                GROUPED RESULT TABLE
            ================================================= */}

            {isTableResult() ? (

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
                          getResultValueLabel()
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

                              ? analysisDetails.operation ===
                                "group_percentage"

                                ? formatPercentage(
                                    value
                                  )

                                : formatNumber(
                                    value
                                  )

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


          {/* ==================================================
              VISUALIZATION
          ================================================== */}

          {isGroupedResult() && (

            <div
              style={{
                marginTop: "32px",
              }}
            >


              {/* =================================================
                  VISUALIZATION HEADER
              ================================================= */}

              <div
                style={{
                  marginBottom: "18px",
                }}
              >

                <p className="eyebrow">
                  VISUALIZATION
                </p>

                <h3
                  style={{
                    marginTop: "4px",
                  }}
                >

                  {
                    getVisualizationTitle()
                  }

                </h3>

              </div>


              {/* =================================================
                  CHART
              ================================================= */}

              {getChartValues().length > 0 ? (

                <div

                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                    padding: "24px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                  }}

                >

                  {getChartValues().map(
                    item => {

                      const maximum =
                        getChartMaximum();


                      const percentage =

                        analysisDetails.operation ===
                        "group_percentage"

                          ? Math.min(
                              Math.max(
                                item.value,
                                4
                              ),
                              100
                            )

                          : maximum > 0

                            ? Math.max(
                                4,
                                (
                                  item.value /
                                  maximum
                                ) * 100
                              )

                            : 0;


                      return (

                        <div
                          key={item.label}
                        >


                          {/* -------------------------------------
                              CHART LABEL
                          ------------------------------------- */}

                          <div

                            style={{
                              display: "flex",
                              justifyContent:
                                "space-between",
                              alignItems:
                                "center",
                              marginBottom:
                                "7px",
                              gap: "16px",
                            }}

                          >

                            <span

                              style={{
                                fontWeight: 600,
                                color:
                                  "#172033",
                              }}

                            >

                              {item.label}

                            </span>


                            <span

                              style={{
                                fontWeight: 600,
                                color:
                                  "#475569",
                              }}

                            >

                              {
                                analysisDetails.operation ===
                                "group_percentage"

                                  ? formatPercentage(
                                      item.value
                                    )

                                  : formatNumber(
                                      item.value
                                    )
                              }

                            </span>

                          </div>


                          {/* -------------------------------------
                              BAR BACKGROUND
                          ------------------------------------- */}

                          <div

                            style={{
                              width: "100%",
                              height: "18px",
                              background:
                                "#e2e8f0",
                              borderRadius:
                                "999px",
                              overflow:
                                "hidden",
                            }}

                          >

                            {/* ---------------------------------
                                BAR
                            --------------------------------- */}

                            <div

                              style={{
                                width:
                                  `${percentage}%`,
                                height:
                                  "100%",
                                background:
                                  "#172033",
                                borderRadius:
                                  "999px",
                                transition:
                                  "width 0.4s ease",
                              }}

                            />

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              ) : (

                <div

                  style={{
                    padding: "20px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    color: "#64748b",
                  }}

                >

                  No numeric values are available
                  for visualization.

                </div>

              )}

            </div>

          )}

        </div>

      )}

    </div>

  );
}


export default Analyst;