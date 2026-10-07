import { apiFetch } from "../api/api";
import type { Report } from "../types/report";

const API_BASE_URL = "http://localhost:8000";


// ============================================================
// GET ALL REPORTS
// ============================================================

export async function getReports(): Promise<Report[]> {

  const response = await apiFetch(
    `${API_BASE_URL}/reports/`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load reports."
    );
  }

  const data = await response.json();

  return data.reports;
}


// ============================================================
// SAVE REPORT
// ============================================================

export async function saveReport(
  report: Omit<Report, "id" | "createdAt">
): Promise<Report> {

  const response = await apiFetch(
    `${API_BASE_URL}/reports/`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        dataset_id: report.datasetId,
        dataset_name: report.datasetName,
        question: report.question,
        answer: report.answer,
        operation: report.operation ?? null,
        column: report.column ?? null,
        group_by: report.groupBy ?? null,
        result: report.result ?? null,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to save report."
    );
  }

  return response.json();
}


// ============================================================
// DELETE ONE REPORT
// ============================================================

export async function deleteReport(
  reportId: string
): Promise<void> {

  const response = await apiFetch(
    `${API_BASE_URL}/reports/${reportId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete report."
    );
  }
}


// ============================================================
// DELETE ALL REPORTS
// ============================================================

export async function clearReports(): Promise<void> {

  const response = await apiFetch(
    `${API_BASE_URL}/reports/`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to clear reports."
    );
  }
}