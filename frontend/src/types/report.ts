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