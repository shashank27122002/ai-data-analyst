export interface Report {
  id: string;
  datasetId: number;
  datasetName: string;
  question: string;
  answer: string;
  operation?: string;
  column?: string;
  groupBy?: string | null;
  result?: unknown;
  createdAt: string;
}

const STORAGE_KEY = "ai_data_analyst_reports";

export function getReports(): Report[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as Report[];
  } catch {
    return [];
  }
}

export function saveReport(
  report: Omit<Report, "id" | "createdAt">
): Report {

  const newReport: Report = {
    ...report,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const reports = getReports();

  const updatedReports = [
    newReport,
    ...reports,
  ];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedReports)
  );

  return newReport;
}

export function deleteReport(
  reportId: string
): void {

  const reports = getReports();

  const updatedReports = reports.filter(
    (report) => report.id !== reportId
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedReports)
  );
}

export function clearReports(): void {
  localStorage.removeItem(STORAGE_KEY);
}