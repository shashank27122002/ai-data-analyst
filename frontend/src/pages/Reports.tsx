import { useEffect, useState } from "react";

interface Report {
  datasetId: number;
  datasetName: string;
  question: string;
  answer: string;
  operation: string;
  column: string;
  groupBy: string | null;
  result: unknown;
  id: string;
  createdAt: string;
}

const REPORTS_STORAGE_KEY =
  "ai_data_analyst_reports";

function Reports() {
  const [reports, setReports] = useState<Report[]>([]);

  // ============================================================
  // LOAD REPORTS
  // ============================================================

  useEffect(() => {
    loadReports();
  }, []);

  function loadReports() {
    const storedReports =
      localStorage.getItem(
        REPORTS_STORAGE_KEY
      );

    if (!storedReports) {
      setReports([]);
      return;
    }

    try {
      const parsedReports =
        JSON.parse(storedReports);

      if (Array.isArray(parsedReports)) {
        setReports(parsedReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error(
        "Failed to load reports:",
        error
      );

      setReports([]);
    }
  }

  // ============================================================
  // DELETE ONE REPORT
  // ============================================================

  function deleteReport(
    reportId: string
  ) {
    const updatedReports =
      reports.filter(
        (report) =>
          report.id !== reportId
      );

    setReports(updatedReports);

    localStorage.setItem(
      REPORTS_STORAGE_KEY,
      JSON.stringify(updatedReports)
    );
  }

  // ============================================================
  // DELETE ALL REPORTS
  // ============================================================

  function clearAllReports() {
    setReports([]);

    localStorage.removeItem(
      REPORTS_STORAGE_KEY
    );
  }

  // ============================================================
  // FORMAT NUMBER
  // ============================================================

  function formatNumber(
    value: unknown
  ): string {
    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value.toLocaleString(
        "en-US"
      );
    }

    return String(value);
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

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
      "en-US",
      {
        dateStyle: "short",
        timeStyle: "medium",
      }
    );
  }

  // ============================================================
  // RENDER RESULT
  // ============================================================

  function renderResult(
    report: Report
  ) {
    const result =
      report.result;

    // ----------------------------------------------------------
    // OBJECT RESULT
    // ----------------------------------------------------------

    if (
      result !== null &&
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
            overflowX: "auto",
            border:
              "1px solid #e5e7eb",
            borderRadius:
              "12px",
          }}
        >
          <table
            style={{
              width: "100%",
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
                    textAlign: "left",
                    padding: "14px 16px",
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
                  {report.groupBy ||
                    "Group"}
                </th>

                <th
                  style={{
                    textAlign: "right",
                    padding: "14px 16px",
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
                  {report.column ||
                    "Value"}
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
                      {formatNumber(
                        value
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );
    }

    // ----------------------------------------------------------
    // ARRAY RESULT
    // ----------------------------------------------------------

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
              >
                {typeof item ===
                "object"
                  ? JSON.stringify(
                      item
                    )
                  : String(
                      item
                    )}
              </div>
            )
          )}
        </div>
      );
    }

    // ----------------------------------------------------------
    // NORMAL RESULT
    // ----------------------------------------------------------

    return (
      <div className="answer-box">
        {formatNumber(
          result
        )}
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="page">

      {/* ======================================================
          HEADER
      ====================================================== */}

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

        {reports.length >
          0 && (
          <button
            className="secondary-button"
            onClick={
              clearAllReports
            }
          >
            Clear All
          </button>
        )}

      </div>


      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {reports.length ===
        0 && (
        <section className="card">

          <div
            className="card-header"
          >

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


      {/* ======================================================
          REPORTS
      ====================================================== */}

      {reports.length >
        0 && (
        <div
          className="reports-list"
        >

          {reports.map(
            (report) => (

              <section
                className="card"
                key={report.id}
                style={{
                  marginBottom:
                    "24px",
                }}
              >

                {/* =================================================
                    REPORT HEADER
                ================================================= */}

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "20px",
                  }}
                >

                  <div>

                    <div className="eyebrow">
                      ANALYSIS REPORT
                    </div>

                    <h2>
                      {report.question}
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
                      {formatDate(
                        report.createdAt
                      )}
                    </p>

                  </div>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      deleteReport(
                        report.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>


                {/* =================================================
                    ANSWER
                ================================================= */}

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

                    {report.answer}

                  </div>

                </div>


                {/* =================================================
                    ANALYSIS DETAILS
                ================================================= */}

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
                          report.operation
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
                          report.column
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


                {/* =================================================
                    RESULT
                ================================================= */}

                <div
                  style={{
                    marginTop:
                      "28px",
                  }}
                >

                  <div className="eyebrow">
                    RESULT
                  </div>

                  {renderResult(
                    report
                  )}

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