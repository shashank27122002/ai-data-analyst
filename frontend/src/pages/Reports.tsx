import { useEffect, useMemo, useState } from "react";

import {
  getReports,
  deleteReport,
  clearReports,
} from "../services/reportService";

import type { Report } from "../types/report";


// ==========================================================
// COMPONENT
// ==========================================================

function Reports() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [reports, setReports] =
    useState<Report[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedDataset, setSelectedDataset] =
    useState("ALL");


  // ==========================================================
  // LOAD REPORTS
  // ==========================================================

  useEffect(() => {

    loadReports();

  }, []);


  function loadReports() {

    const storedReports =
      getReports();

    setReports(
      storedReports
    );

  }


  // ==========================================================
  // DATASET OPTIONS
  // ==========================================================

  const datasetOptions =
    useMemo(() => {

      const names =
        reports.map(
          report =>
            report.datasetName
        );

      return Array.from(
        new Set(names)
      );

    }, [reports]);


  // ==========================================================
  // FILTER REPORTS
  // ==========================================================

  const filteredReports =
    useMemo(() => {

      const search =
        searchQuery
          .trim()
          .toLowerCase();

      return reports.filter(
        report => {

          const matchesDataset =
            selectedDataset === "ALL" ||
            report.datasetName ===
              selectedDataset;

          if (!matchesDataset) {
            return false;
          }

          if (!search) {
            return true;
          }

          return (

            report.question
              .toLowerCase()
              .includes(search) ||

            report.answer
              .toLowerCase()
              .includes(search) ||

            report.datasetName
              .toLowerCase()
              .includes(search) ||

            (report.operation || "")
              .toLowerCase()
              .includes(search) ||

            (report.column || "")
              .toLowerCase()
              .includes(search) ||

            (report.groupBy || "")
              .toLowerCase()
              .includes(search)

          );

        }
      );

    }, [
      reports,
      searchQuery,
      selectedDataset,
    ]);


  // ==========================================================
  // DELETE ONE REPORT
  // ==========================================================

  function handleDeleteReport(
    reportId: string
  ) {

    deleteReport(
      reportId
    );

    setReports(
      getReports()
    );

  }


  // ==========================================================
  // DELETE ALL REPORTS
  // ==========================================================

  function handleClearAll() {

    clearReports();

    setReports([]);

    setSearchQuery("");

    setSelectedDataset(
      "ALL"
    );

  }


  // ==========================================================
  // FORMAT NUMBER
  // ==========================================================

  function formatNumber(
    value: unknown
  ): string {

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {

      return value.toLocaleString(
        "en-IN"
      );

    }

    return String(value);

  }


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDate(
    date: string
  ): string {

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  }


  // ==========================================================
  // FORMAT RESULT VALUE
  // ==========================================================

  function formatResultValue(
    value: unknown,
    report: Report
  ): string {

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {

      if (
        report.operation ===
        "group_percentage"
      ) {

        return `${value.toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}%`;

      }

      return formatNumber(
        value
      );

    }

    return String(value);

  }


  // ==========================================================
  // RENDER RESULT
  // ==========================================================

  function renderResult(
    report: Report
  ) {

    const result =
      report.result;


    // ========================================================
    // NO RESULT
    // ========================================================

    if (
      result === null ||
      result === undefined
    ) {

      return (

        <div className="answer-box">
          No result available.
        </div>

      );

    }


    // ========================================================
    // OBJECT RESULT
    // ========================================================

    if (
      typeof result === "object" &&
      !Array.isArray(result)
    ) {

      const entries =
        Object.entries(
          result as Record<
            string,
            unknown
          >
        );


      if (
        entries.length === 0
      ) {

        return (

          <div className="answer-box">
            No result available.
          </div>

        );

      }


      return (

        <div
          style={{
            overflowX:
              "auto",

            border:
              "1px solid #e5e7eb",

            borderRadius:
              "12px",
          }}
        >

          <table
            style={{
              width:
                "100%",

              borderCollapse:
                "collapse",
            }}
          >

            <thead>

              <tr
                style={{
                  background:
                    "#f8fafc",
                }}
              >

                <th
                  style={{
                    textAlign:
                      "left",

                    padding:
                      "14px 16px",

                    borderBottom:
                      "1px solid #e5e7eb",

                    fontSize:
                      "13px",

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      "0.05em",
                  }}
                >

                  {
                    report.groupBy ||
                    "Group"
                  }

                </th>


                <th
                  style={{
                    textAlign:
                      "right",

                    padding:
                      "14px 16px",

                    borderBottom:
                      "1px solid #e5e7eb",

                    fontSize:
                      "13px",

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      "0.05em",
                  }}
                >

                  {
                    report.operation ===
                    "group_count"

                      ? "Count"

                      : report.operation ===
                        "group_percentage"

                        ? "Percentage"

                        : report.column ||
                          "Value"
                  }

                </th>

              </tr>

            </thead>


            <tbody>

              {entries.map(
                ([key, value]) => (

                  <tr
                    key={key}
                  >

                    <td
                      style={{
                        padding:
                          "14px 16px",

                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >

                      {key}

                    </td>


                    <td
                      style={{
                        padding:
                          "14px 16px",

                        borderBottom:
                          "1px solid #e5e7eb",

                        textAlign:
                          "right",

                        fontWeight:
                          600,
                      }}
                    >

                      {
                        formatResultValue(
                          value,
                          report
                        )
                      }

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      );

    }


    // ========================================================
    // ARRAY RESULT
    // ========================================================

    if (
      Array.isArray(result)
    ) {

      return (

        <div className="answer-box">

          {result.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                style={{
                  marginBottom:
                    "6px",
                }}
              >

                {
                  typeof item ===
                  "object"

                    ? JSON.stringify(
                        item
                      )

                    : String(
                        item
                      )
                }

              </div>

            )
          )}

        </div>

      );

    }


    // ========================================================
    // NORMAL RESULT
    // ========================================================

    return (

      <div className="answer-box">

        {
          formatResultValue(
            result,
            report
          )
        }

      </div>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            REPORTS
          </div>

          <h1>
            Reports
          </h1>

          <p>
            Review and manage your
            generated analysis
            reports.
          </p>

        </div>


        {reports.length > 0 && (

          <button
            type="button"
            className="secondary-button"
            onClick={
              handleClearAll
            }
          >
            Clear All
          </button>

        )}

      </div>


      {/* ====================================================
          EMPTY STATE
      ==================================================== */}

      {reports.length === 0 && (

        <section className="card">

          <div className="card-header">

            <div className="icon-box">
              ✦
            </div>

            <div>

              <h2>
                Analysis Reports
              </h2>

              <p>
                Your saved analysis
                reports will appear
                here.
              </p>

            </div>

          </div>


          <div
            style={{
              textAlign:
                "center",

              padding:
                "80px 20px",
            }}
          >

            <h2>
              No reports yet
            </h2>

            <p>
              Run an analysis from
              the AI Analyst page
              to create a report.
            </p>

          </div>

        </section>

      )}


      {/* ====================================================
          REPORT CONTROLS
      ==================================================== */}

      {reports.length > 0 && (

        <section
          className="card"
          style={{
            marginBottom:
              "24px",
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

              flexWrap:
                "wrap",
            }}
          >

            <div>

              <div className="eyebrow">
                REPORT LIBRARY
              </div>

              <h2
                style={{
                  margin:
                    "4px 0",
                }}
              >

                {filteredReports.length}

                {" "}

                {
                  filteredReports.length ===
                  1
                    ? "Report"
                    : "Reports"
                }

              </h2>

            </div>


            {/* ==============================================
                SEARCH
            ============================================== */}

            <input
              type="text"
              value={
                searchQuery
              }
              onChange={
                event =>
                  setSearchQuery(
                    event.target.value
                  )
              }
              placeholder="Search reports..."
              style={{
                flex:
                  "1 1 280px",

                maxWidth:
                  "420px",

                padding:
                  "12px 14px",

                border:
                  "1px solid #e2e8f0",

                borderRadius:
                  "10px",

                fontSize:
                  "14px",

                outline:
                  "none",
              }}
            />


            {/* ==============================================
                DATASET FILTER
            ============================================== */}

            <select
              value={
                selectedDataset
              }
              onChange={
                event =>
                  setSelectedDataset(
                    event.target.value
                  )
              }
              style={{
                padding:
                  "12px 14px",

                border:
                  "1px solid #e2e8f0",

                borderRadius:
                  "10px",

                background:
                  "#ffffff",

                fontSize:
                  "14px",

                minWidth:
                  "190px",
              }}
            >

              <option value="ALL">
                All Datasets
              </option>

              {datasetOptions.map(
                dataset => (

                  <option
                    key={
                      dataset
                    }
                    value={
                      dataset
                    }
                  >

                    {
                      dataset
                    }

                  </option>

                )
              )}

            </select>

          </div>

        </section>

      )}


      {/* ====================================================
          NO FILTER RESULTS
      ==================================================== */}

      {reports.length > 0 &&
        filteredReports.length === 0 && (

          <section className="card">

            <div
              style={{
                textAlign:
                  "center",

                padding:
                  "60px 20px",
              }}
            >

              <h2>
                No matching reports
              </h2>

              <p>
                Try a different search
                term or dataset.
              </p>

            </div>

          </section>

      )}


      {/* ====================================================
          REPORT LIST
      ==================================================== */}

      {filteredReports.length > 0 && (

        <div className="reports-list">

          {filteredReports.map(
            report => (

              <section
                className="card"
                key={
                  report.id
                }
                style={{
                  marginBottom:
                    "24px",
                }}
              >

                {/* ==========================================
                    REPORT HEADER
                ========================================== */}

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "space-between",

                    alignItems:
                      "flex-start",

                    gap:
                      "20px",
                  }}
                >

                  <div
                    style={{
                      flex:
                        1,
                    }}
                  >

                    <div className="eyebrow">
                      ANALYSIS REPORT
                    </div>


                    <h2>
                      {
                        report.question
                      }
                    </h2>


                    <p>

                      Dataset:{" "}

                      <strong>
                        {
                          report.datasetName
                        }
                      </strong>

                    </p>


                    <p
                      style={{
                        color:
                          "#64748b",

                        fontSize:
                          "14px",
                      }}
                    >

                      {
                        formatDate(
                          report.createdAt
                        )
                      }

                    </p>

                  </div>


                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleDeleteReport(
                        report.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>


                {/* ==========================================
                    ANSWER
                ========================================== */}

                <div
                  style={{
                    marginTop:
                      "28px",
                  }}
                >

                  <div className="eyebrow">
                    ANSWER
                  </div>


                  <div className="answer-box">

                    {
                      report.answer
                    }

                  </div>

                </div>


                {/* ==========================================
                    ANALYSIS DETAILS
                ========================================== */}

                <div
                  style={{
                    marginTop:
                      "28px",
                  }}
                >

                  <div className="eyebrow">
                    ANALYSIS DETAILS
                  </div>


                  <div
                    className="analysis-grid"
                  >

                    <div
                      className="analysis-item"
                    >

                      <span>
                        OPERATION
                      </span>

                      <strong>
                        {
                          report.operation ||
                          "—"
                        }
                      </strong>

                    </div>


                    <div
                      className="analysis-item"
                    >

                      <span>
                        COLUMN
                      </span>

                      <strong>
                        {
                          report.column ||
                          "—"
                        }
                      </strong>

                    </div>


                    <div
                      className="analysis-item"
                    >

                      <span>
                        GROUP BY
                      </span>

                      <strong>
                        {
                          report.groupBy ||
                          "—"
                        }
                      </strong>

                    </div>

                  </div>

                </div>


                {/* ==========================================
                    RESULT
                ========================================== */}

                <div
                  style={{
                    marginTop:
                      "28px",
                  }}
                >

                  <div className="eyebrow">
                    RESULT
                  </div>


                  {
                    renderResult(
                      report
                    )
                  }

                </div>

              </section>

            )
          )}

        </div>

      )}

    </div>

  );

}


export default Reports;