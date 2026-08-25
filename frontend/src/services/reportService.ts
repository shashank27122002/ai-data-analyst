import type { Report } from "../types/report";

const STORAGE_KEY = "ai_data_analyst_reports";

// ============================================================
// GET ALL REPORTS
// ============================================================

export function getReports(): Report[] {
  try {
    const stored = localStorage.getItem(
      STORAGE_KEY
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Report[];

  } catch (error) {
    console.error(
      "Failed to load reports:",
      error
    );

    return [];
  }
}


// ============================================================
// SAVE REPORT
// ============================================================

export function saveReport(
  report: Omit<Report, "id" | "createdAt">
): Report {

  const newReport: Report = {
    ...report,

    id: crypto.randomUUID(),

    createdAt:
      new Date().toISOString(),
  };


  const reports =
    getReports();


  const updatedReports = [
    newReport,
    ...reports,
  ];


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      updatedReports
    )
  );


  return newReport;
}


// ============================================================
// DELETE ONE REPORT
// ============================================================

export function deleteReport(
  reportId: string
): void {

  const reports =
    getReports();


  const updatedReports =
    reports.filter(
      (report) =>
        report.id !== reportId
    );


  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      updatedReports
    )
  );
}


// ============================================================
// DELETE ALL REPORTS
// ============================================================

export function clearReports(): void {
  localStorage.removeItem(
    STORAGE_KEY
  );
}