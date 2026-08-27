import React from "react";

interface VisualizationProps {
  operation?: string;
  column?: string;
  groupBy?: string | null;
  result?: unknown;
}

interface GroupedResult {
  label: string;
  value: number;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDecimal(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${formatDecimal(value)}%`;
}

function getGroupedResults(result: unknown): GroupedResult[] {
  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    return [];
  }

  return Object.entries(
    result as Record<string, unknown>
  )
    .map(([label, value]) => ({
      label,
      value: Number(value),
    }))
    .filter(
      (item) =>
        item.label.trim() !== "" &&
        Number.isFinite(item.value)
    );
}

const Visualization: React.FC<VisualizationProps> = ({
  operation,
  column,
  groupBy,
  result,
}) => {
  /*
   * ---------------------------------------------------------
   * GROUPED RESULTS
   * ---------------------------------------------------------
   */

  const groupedResults = getGroupedResults(result);

  const isGroupedOperation =
    operation === "group_sum" ||
    operation === "group_average" ||
    operation === "group_avg" ||
    operation === "group_count" ||
    operation === "group_min" ||
    operation === "group_max" ||
    operation === "group_percentage";

  if (
    isGroupedOperation &&
    groupedResults.length > 0
  ) {
    /*
     * -------------------------------------------------------
     * PERCENTAGE VISUALIZATION
     * -------------------------------------------------------
     *
     * For group_percentage, the values are already
     * percentages.
     *
     * Example:
     *
     * South = 54.52
     * North = 25.36
     *
     * Therefore the bar width can directly use
     * the percentage value.
     */

    if (operation === "group_percentage") {
      return (
        <section className="analysis-card">
          <div className="analysis-card-header">
            <div>
              <div className="eyebrow">
                VISUALIZATION
              </div>

              <h3>
                {column
                  ? `${column} Percentage by ${
                      groupBy || "Group"
                    }`
                  : `Percentage by ${
                      groupBy || "Group"
                    }`}
              </h3>
            </div>
          </div>

          <div className="visualization-container">
            {groupedResults.map((item) => {
              const percentage = Math.min(
                Math.max(item.value, 0),
                100
              );

              return (
                <div
                  key={item.label}
                  className="visualization-row"
                >
                  <div className="visualization-row-header">
                    <strong>
                      {item.label}
                    </strong>

                    <span>
                      {formatPercentage(
                        item.value
                      )}
                    </span>
                  </div>

                  <div className="visualization-track">
                    <div
                      className="visualization-bar"
                      style={{
                        width: `${Math.max(
                          percentage,
                          2
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    /*
     * -------------------------------------------------------
     * NORMAL GROUPED VISUALIZATION
     * -------------------------------------------------------
     */

    const maxValue = Math.max(
      ...groupedResults.map(
        (item) => item.value
      )
    );

    return (
      <section className="analysis-card">
        <div className="analysis-card-header">
          <div>
            <div className="eyebrow">
              VISUALIZATION
            </div>

            <h3>
              {column
                ? `${column} by ${
                    groupBy || "Group"
                  }`
                : `Results by ${
                    groupBy || "Group"
                  }`}
            </h3>
          </div>
        </div>

        <div className="visualization-container">
          {groupedResults.map((item) => {
            const percentage =
              maxValue > 0
                ? (item.value / maxValue) * 100
                : 0;

            return (
              <div
                key={item.label}
                className="visualization-row"
              >
                <div className="visualization-row-header">
                  <strong>
                    {item.label}
                  </strong>

                  <span>
                    {formatNumber(item.value)}
                  </span>
                </div>

                <div className="visualization-track">
                  <div
                    className="visualization-bar"
                    style={{
                      width: `${Math.max(
                        percentage,
                        2
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * SINGLE NUMERIC RESULT
   * ---------------------------------------------------------
   */

  if (
    typeof result === "number" &&
    Number.isFinite(result)
  ) {
    let title = "Result";

    switch (operation) {
      case "total":
        title = column
          ? `Total ${column}`
          : "Total";
        break;

      case "average":
      case "avg":
        title = column
          ? `Average ${column}`
          : "Average";
        break;

      case "count":
        title = "Count";
        break;

      case "minimum":
      case "min":
        title = column
          ? `Minimum ${column}`
          : "Minimum";
        break;

      case "maximum":
      case "max":
        title = column
          ? `Maximum ${column}`
          : "Maximum";
        break;

      default:
        title = column || "Result";
    }

    return (
      <section className="analysis-card">
        <div className="analysis-card-header">
          <div>
            <div className="eyebrow">
              VISUALIZATION
            </div>

            <h3>{title}</h3>
          </div>
        </div>

        <div className="metric-visualization">
          <div className="metric-value">
            {formatNumber(result)}
          </div>

          {column && (
            <div className="metric-label">
              {column}
            </div>
          )}
        </div>
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * ARRAY RESULT
   * ---------------------------------------------------------
   */

  if (
    Array.isArray(result) &&
    result.length > 0
  ) {
    return (
      <section className="analysis-card">
        <div className="analysis-card-header">
          <div>
            <div className="eyebrow">
              VISUALIZATION
            </div>

            <h3>Analysis Result</h3>
          </div>
        </div>

        <div className="visualization-list">
          {result.map((item, index) => (
            <div
              key={index}
              className="visualization-list-item"
            >
              {typeof item === "object"
                ? JSON.stringify(item)
                : String(item)}
            </div>
          ))}
        </div>
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * NOTHING TO VISUALIZE
   * ---------------------------------------------------------
   */

  return null;
};

export default Visualization;