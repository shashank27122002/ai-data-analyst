import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  getDatasets,
  uploadDataset,
  deleteDataset,
  getDatasetPreview,
  getDatasetStatistics,
  type Dataset,
  type DatasetPreviewResponse,
  type DatasetStatistics,
} from "../api/api";

function Datasets() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [datasets, setDatasets] =
    useState<Dataset[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedDataset, setSelectedDataset] =
    useState<Dataset | null>(null);

  const [detailView, setDetailView] =
    useState<
      "preview" | "statistics" | null
    >(null);

  const [preview, setPreview] =
    useState<DatasetPreviewResponse | null>(null);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [statistics, setStatistics] =
    useState<DatasetStatistics | null>(null);

  const [statisticsLoading, setStatisticsLoading] =
    useState(false);

  // ==========================================================
  // REFS
  // ==========================================================

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const previewRef =
    useRef<HTMLDivElement>(null);

  const statisticsRef =
    useRef<HTMLDivElement>(null);

  // ==========================================================
  // LOAD DATASETS
  // ==========================================================

  async function loadDatasets() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDatasets();

      setDatasets(
        response.datasets || []
      );
    } catch (err) {
      console.error(
        "Failed to load datasets:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load datasets."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadDatasets();
  }, []);

  // ==========================================================
  // SCROLL TO PREVIEW
  // ==========================================================

  useEffect(() => {
    if (
      selectedDataset &&
      detailView === "preview" &&
      preview &&
      !previewLoading
    ) {
      previewRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [
    selectedDataset,
    detailView,
    preview,
    previewLoading,
  ]);

  // ==========================================================
  // SCROLL TO STATISTICS
  // ==========================================================

  useEffect(() => {
    if (
      selectedDataset &&
      detailView === "statistics" &&
      statistics &&
      !statisticsLoading
    ) {
      statisticsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [
    selectedDataset,
    detailView,
    statistics,
    statisticsLoading,
  ]);

  // ==========================================================
  // UPLOAD DATASET
  // ==========================================================

  async function handleUpload(
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
      setUploading(true);
      setError("");

      setSelectedDataset(null);
      setDetailView(null);
      setPreview(null);
      setStatistics(null);

      await uploadDataset(file);

      await loadDatasets();
    } catch (err) {
      console.error(
        "Dataset upload failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload dataset."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  // ==========================================================
  // OPEN FILE PICKER
  // ==========================================================

  function openUploadPicker() {
    fileInputRef.current?.click();
  }

  // ==========================================================
  // PREVIEW
  // ==========================================================

  async function handlePreview(
    dataset: Dataset
  ) {
    try {
      setSelectedDataset(dataset);

      setDetailView("preview");

      setPreview(null);

      setStatistics(null);

      setPreviewLoading(true);

      setStatisticsLoading(false);

      setError("");

      const response =
        await getDatasetPreview(
          dataset.dataset_id,
          10
        );

      setPreview(response);
    } catch (err) {
      console.error(
        "Failed to load dataset preview:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dataset preview."
      );
    } finally {
      setPreviewLoading(false);
    }
  }

  // ==========================================================
  // STATISTICS
  // ==========================================================

  async function handleStatistics(
    dataset: Dataset
  ) {
    try {
      setSelectedDataset(dataset);

      setDetailView("statistics");

      setStatistics(null);

      setPreview(null);

      setStatisticsLoading(true);

      setPreviewLoading(false);

      setError("");

      const response =
        await getDatasetStatistics(
          dataset.dataset_id
        );

      setStatistics(response);
    } catch (err) {
      console.error(
        "Failed to load dataset statistics:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dataset statistics."
      );
    } finally {
      setStatisticsLoading(false);
    }
  }

  // ==========================================================
  // DELETE DATASET
  // ==========================================================

  async function handleDelete(
    dataset: Dataset
  ) {
    const confirmed =
      window.confirm(
        `Delete "${dataset.original_filename}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteDataset(
        dataset.dataset_id
      );

      if (
        selectedDataset?.dataset_id ===
        dataset.dataset_id
      ) {
        setSelectedDataset(null);
        setDetailView(null);
        setPreview(null);
        setStatistics(null);
      }

      await loadDatasets();
    } catch (err) {
      console.error(
        "Failed to delete dataset:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete dataset."
      );
    }
  }

  // ==========================================================
  // CLOSE DETAILS
  // ==========================================================

  function closeDetails() {
    setSelectedDataset(null);

    setDetailView(null);

    setPreview(null);

    setStatistics(null);

    setPreviewLoading(false);

    setStatisticsLoading(false);
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          gap: "20px",
        }}
      >
        <div>
          <p className="eyebrow">
            DATA MANAGEMENT
          </p>

          <h1>
            Datasets
          </h1>

          <p>
            Upload, preview, analyze and manage
            your datasets.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleUpload}
            style={{
              display: "none",
            }}
          />

          <button
            type="button"
            onClick={openUploadPicker}
            disabled={uploading}
            className="primary-button"
          >
            {uploading
              ? "Uploading..."
              : "+ Upload Dataset"}
          </button>
        </div>
      </div>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "24px",
            borderRadius: "10px",
            background: "#fff1f2",
            color: "#b42318",
          }}
        >
          {error}
        </div>
      )}

      {/* ====================================================
          DATASET COUNT
      ==================================================== */}

      <div
        className="card"
        style={{
          marginBottom: "24px",
        }}
      >
        <p className="eyebrow">
          AVAILABLE DATASETS
        </p>

        <h2>
          {loading
            ? "..."
            : datasets.length}
        </h2>

        <p>
          datasets available for analysis
        </p>
      </div>

      {/* ====================================================
          LOADING
      ==================================================== */}

      {loading && (
        <div className="card">
          Loading datasets...
        </div>
      )}

      {/* ====================================================
          EMPTY STATE
      ==================================================== */}

      {!loading &&
        datasets.length === 0 && (
          <div className="card">
            <h2>
              No datasets yet
            </h2>

            <p>
              Upload a CSV or Excel file to
              start analyzing your data.
            </p>
          </div>
        )}

      {/* ====================================================
          DATASET LIST
      ==================================================== */}

      {!loading &&
        datasets.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            {datasets.map(
              (dataset) => (
                <div
                  key={
                    dataset.dataset_id
                  }
                  className="card"
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "20px",
                    }}
                  >

                    {/* DATASET INFO */}

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

                      <p>
                        {
                          dataset.row_count
                        }{" "}
                        rows
                        {" · "}
                        {
                          dataset.column_count
                        }{" "}
                        columns
                      </p>

                      {dataset.file_type && (
                        <p>
                          Type:{" "}
                          {
                            dataset.file_type
                          }
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexShrink: 0,
                        flexWrap: "wrap",
                        justifyContent:
                          "flex-end",
                      }}
                    >

                      <button
                        type="button"
                        onClick={() =>
                          handlePreview(
                            dataset
                          )
                        }
                        className="secondary-button"
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatistics(
                            dataset
                          )
                        }
                        className="secondary-button"
                      >
                        Statistics
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            dataset
                          )
                        }
                        className="danger-button"
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}

      {/* ====================================================
          PREVIEW
      ==================================================== */}

      {selectedDataset &&
        detailView === "preview" && (
          <div
            ref={previewRef}
            className="card"
            style={{
              marginTop: "32px",
              scrollMarginTop: "30px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: "20px",
                gap: "20px",
              }}
            >
              <div>
                <p className="eyebrow">
                  DATASET PREVIEW
                </p>

                <h2>
                  {
                    selectedDataset.original_filename
                  }
                </h2>

                <p>
                  Showing the first 10 rows.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="secondary-button"
              >
                Close
              </button>
            </div>

            {/* PREVIEW LOADING */}

            {previewLoading && (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                }}
              >
                Loading preview...
              </div>
            )}

            {/* PREVIEW TABLE */}

            {!previewLoading &&
              preview &&
              preview.data.length > 0 && (
                <div
                  style={{
                    overflowX: "auto",
                    border:
                      "1px solid #e5e7eb",
                    borderRadius: "10px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                      minWidth: "900px",
                    }}
                  >
                    <thead>
                      <tr>
                        {preview.columns.map(
                          (column) => (
                            <th
                              key={column}
                              style={{
                                textAlign:
                                  "left",
                                padding:
                                  "14px",
                                background:
                                  "#f8fafc",
                                borderBottom:
                                  "1px solid #ddd",
                                fontWeight:
                                  700,
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {column}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {preview.data.map(
                        (
                          row,
                          rowIndex
                        ) => (
                          <tr
                            key={
                              rowIndex
                            }
                          >
                            {preview.columns.map(
                              (column) => (
                                <td
                                  key={
                                    column
                                  }
                                  style={{
                                    padding:
                                      "14px",
                                    borderBottom:
                                      "1px solid #eee",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {String(
                                    row[
                                      column
                                    ] ?? ""
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
              )}

            {/* EMPTY PREVIEW */}

            {!previewLoading &&
              preview &&
              preview.data.length === 0 && (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  <h3>
                    No preview data
                  </h3>

                  <p>
                    This dataset does not contain
                    any rows.
                  </p>
                </div>
              )}

          </div>
        )}

      {/* ====================================================
          STATISTICS
      ==================================================== */}

      {selectedDataset &&
        detailView === "statistics" && (
          <div
            ref={statisticsRef}
            className="card"
            style={{
              marginTop: "32px",
              scrollMarginTop: "30px",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: "24px",
                gap: "20px",
              }}
            >
              <div>
                <p className="eyebrow">
                  DATASET STATISTICS
                </p>

                <h2>
                  {
                    selectedDataset.original_filename
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="secondary-button"
              >
                Close
              </button>
            </div>

            {/* STATISTICS LOADING */}

            {statisticsLoading && (
              <div
                style={{
                  padding: "30px",
                  textAlign: "center",
                }}
              >
                Loading statistics...
              </div>
            )}

            {/* STATISTICS */}

            {!statisticsLoading &&
              statistics && (
                <>
                  {/* SUMMARY CARDS */}

                  <div
                    className="stats-grid"
                    style={{
                      marginBottom: "28px",
                    }}
                  >

                    <div className="stat-card">

                      <span className="stat-label">
                        Rows
                      </span>

                      <strong>
                        {statistics.rows.toLocaleString()}
                      </strong>

                      <span className="stat-description">
                        Total records
                      </span>

                    </div>

                    <div className="stat-card">

                      <span className="stat-label">
                        Columns
                      </span>

                      <strong>
                        {statistics.columns}
                      </strong>

                      <span className="stat-description">
                        Total fields
                      </span>

                    </div>

                    <div className="stat-card">

                      <span className="stat-label">
                        Numeric Columns
                      </span>

                      <strong>
                        {
                          statistics
                            .numeric_columns
                            .length
                        }
                      </strong>

                      <span className="stat-description">
                        Numeric fields
                      </span>

                    </div>

                  </div>

                  {/* NUMERIC COLUMNS */}

                  {statistics.numeric_columns.length >
                    0 && (
                    <div
                      style={{
                        marginBottom:
                          "24px",
                      }}
                    >

                      <h3>
                        Numeric Columns
                      </h3>

                      <div
                        style={{
                          display:
                            "flex",
                          flexWrap:
                            "wrap",
                          gap: "8px",
                          marginTop:
                            "12px",
                        }}
                      >

                        {statistics.numeric_columns.map(
                          (column) => (
                            <span
                              key={
                                column
                              }
                              className="filter-badge"
                            >
                              {column}
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* NUMERIC STATISTICS TABLE */}

                  {Object.keys(
                    statistics.numeric_statistics
                  ).length > 0 && (

                    <div
                      style={{
                        overflowX:
                          "auto",
                      }}
                    >

                      <h3
                        style={{
                          marginBottom:
                            "16px",
                        }}
                      >
                        Numeric Statistics
                      </h3>

                      <table
                        className="analysis-result-table"
                      >

                        <thead>

                          <tr>

                            <th>
                              Column
                            </th>

                            <th>
                              Count
                            </th>

                            <th>
                              Sum
                            </th>

                            <th>
                              Average
                            </th>

                            <th>
                              Minimum
                            </th>

                            <th>
                              Maximum
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {Object.entries(
                            statistics
                              .numeric_statistics
                          ).map(
                            (
                              [
                                column,
                                stat,
                              ]
                            ) => (

                              <tr
                                key={
                                  column
                                }
                              >

                                <td>
                                  {column}
                                </td>

                                <td>
                                  {stat.count.toLocaleString()}
                                </td>

                                <td>
                                  {stat.sum.toLocaleString()}
                                </td>

                                <td>
                                  {stat.average.toLocaleString(
                                    undefined,
                                    {
                                      maximumFractionDigits:
                                        2,
                                    }
                                  )}
                                </td>

                                <td>
                                  {stat.minimum ===
                                  null
                                    ? "—"
                                    : stat.minimum.toLocaleString()}
                                </td>

                                <td>
                                  {stat.maximum ===
                                  null
                                    ? "—"
                                    : stat.maximum.toLocaleString()}
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </>
              )}

          </div>
        )}

    </div>
  );
}

export default Datasets;