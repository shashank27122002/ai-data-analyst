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

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";


// ==========================================================
// COMPONENT
// ==========================================================

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
  // GROUPED RESULT CHECK
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
  // GET CHART VALUES
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

            value:
              numericValue,

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
  // GET VISUALIZATION TITLE
  // ==========================================================

  function getVisualizationTitle(): string {

    if (!analysisDetails) {
      return "Analysis Chart";
    }

    if (
      analysisDetails.operation ===
      "group_percentage"
    ) {

      return `${
        analysisDetails.column ||
        "Value"
      } Percentage by ${
        analysisDetails.group_by ||
        "Group"
      }`;

    }

    if (
      analysisDetails.operation ===
      "group_count"
    ) {

      return `Count by ${
        analysisDetails.group_by ||
        "Group"
      }`;

    }

    if (
      analysisDetails.column
    ) {

      return `${
        analysisDetails.column
      } by ${
        analysisDetails.group_by ||
        "Group"
      }`;

    }

    return "Analysis Chart";

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
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    )}%`;

  }


  // ==========================================================
  // CUSTOM TOOLTIP
  // ==========================================================

  function ChartTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value?: number;
    }>;
    label?: string;
  }) {

    if (
      !active ||
      !payload ||
      payload.length === 0
    ) {

      return null;

    }

    const value =
      Number(
        payload[0]?.value ?? 0
      );

    return (

      <div
        style={{
          background:
            "#ffffff",

          border:
            "1px solid #e2e8f0",

          borderRadius:
            "10px",

          padding:
            "10px 14px",

          boxShadow:
            "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >

        <p
          style={{
            margin:
              "0 0 4px",

            fontWeight:
              600,

            color:
              "#172033",
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin:
              0,

            color:
              "#475569",
          }}
        >

          {
            analysisDetails?.operation ===
            "group_percentage"

              ? formatPercentage(
                  value
                )

              : formatNumber(
                  value
                )
          }

        </p>

      </div>

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
          marginBottom:
            "32px",
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
            DATASET SELECTOR
        ================================================== */}

        <div className="dataset-selector">

          <label>
            Dataset
          </label>

          <select

            value={
              selectedDataset?.dataset_id ??
              ""
            }

            disabled={
              loadingDatasets
            }

            onChange={
              event =>
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
            QUESTION INPUT
        ================================================== */}

        <textarea

          value={
            question
          }

          onChange={
            event =>
              setQuestion(
                event.target.value
              )
          }

          placeholder="Ask something about your data..."

          rows={5}

          disabled={
            loading
          }

        />


        {/* ==================================================
            QUESTION FOOTER
        ================================================== */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            marginTop:
              "16px",

            gap:
              "16px",
          }}
        >

          <span
            style={{
              color:
                "#94a3b8",

              fontSize:
                "14px",
            }}
          >
            Try: "Which products were sold in South?"
          </span>


          <button

            type="button"

            className="ask-button"

            onClick={
              handleAskQuestion
            }

            disabled={
              loading ||
              !selectedDataset
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
              marginTop:
                "20px",

              display:
                "flex",

              alignItems:
                "center",

              gap:
                "12px",
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
                  fontSize:
                    "14px",

                  color:
                    "#64748b",
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

                      {key} = {value}

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

            {isGroupedResult() ? (

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
                          analysisDetails.operation ===
                          "group_count"

                            ? "Count"

                            : analysisDetails.operation ===
                              "group_percentage"

                              ? "Percentage"

                              : analysisDetails.column ||
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

              /* =============================================
                 NORMAL RESULT
              ============================================= */

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
                marginTop:
                  "32px",
              }}
            >

              {/* =================================================
                  VISUALIZATION HEADER
              ================================================= */}

              <div
                style={{
                  marginBottom:
                    "18px",
                }}
              >

                <p className="eyebrow">
                  VISUALIZATION
                </p>

                <h3
                  style={{
                    marginTop:
                      "4px",
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
                    padding:
                      "24px",

                    background:
                      "#f8fafc",

                    border:
                      "1px solid #e2e8f0",

                    borderRadius:
                      "14px",
                  }}
                >

                  {/* ============================================
                      PIE / DONUT FOR PERCENTAGES
                  ============================================ */}

                  {analysisDetails.operation ===
                  "group_percentage" ? (

                    <div
                      style={{
                        width:
                          "100%",

                        height:
                          "360px",
                      }}
                    >

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <PieChart>

                          <Pie

                            data={
                              getChartValues().map(
                                item => ({
                                  name:
                                    item.label,

                                  value:
                                    item.value,
                                })
                              )
                            }

                            dataKey="value"

                            nameKey="name"

                            cx="50%"

                            cy="50%"

                            outerRadius={120}

                            innerRadius={65}

                            paddingAngle={2}

                            label

                          >

                            {getChartValues().map(
                              (_, index) => (

                                <Cell
                                  key={
                                    `cell-${index}`
                                  }
                                />

                              )
                            )}

                          </Pie>


                          <Tooltip
                            content={
                              <ChartTooltip />
                            }
                          />

                        </PieChart>

                      </ResponsiveContainer>

                    </div>

                  ) : (

                    /* ==========================================
                       BAR CHART
                    ========================================== */

                    <div
                      style={{
                        width:
                          "100%",

                        height:
                          "380px",
                      }}
                    >

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <BarChart

                          data={
                            getChartValues().map(
                              item => ({
                                name:
                                  item.label,

                                value:
                                  item.value,
                              })
                            )
                          }

                          margin={{
                            top:
                              10,

                            right:
                              20,

                            left:
                              20,

                            bottom:
                              50,
                          }}

                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                          />

                          <XAxis

                            dataKey="name"

                            interval={0}

                            angle={
                              getChartValues().length >
                              5
                                ? -35
                                : 0
                            }

                            textAnchor={
                              getChartValues().length >
                              5
                                ? "end"
                                : "middle"
                            }

                            height={80}

                          />

                          <YAxis />

                          <Tooltip
                            content={
                              <ChartTooltip />
                            }
                          />

                          <Bar
                            dataKey="value"
                            radius={[
                              6,
                              6,
                              0,
                              0
                            ]}
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  )}

                </div>

              ) : (

                <div
                  style={{
                    padding:
                      "20px",

                    background:
                      "#f8fafc",

                    border:
                      "1px solid #e2e8f0",

                    borderRadius:
                      "12px",

                    color:
                      "#64748b",
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