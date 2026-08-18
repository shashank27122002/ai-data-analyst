const API_BASE_URL = "http://127.0.0.1:8000";

export interface Dataset {
  dataset_id: number;
  original_filename: string;
  stored_filename?: string;
  file_type?: string;
  table_name?: string;
  row_count: number;
  column_count: number;
  created_at?: string;
}

export interface DatasetListResponse {
  count: number;
  datasets: Dataset[];
}

export interface QueryResponse {
  dataset_id: number;
  question: string;
  route?: string;
  answer: string;
  analysis?: {
    operation: string;
    column: string;
    group_by: string | null;
    filters: Record<string, string>;
    result: unknown;
  };
  rag?: {
    chunk_count: number;
  };
}

export async function getDatasets(): Promise<DatasetListResponse> {
  const response = await fetch(`${API_BASE_URL}/datasets/`);

  if (!response.ok) {
    throw new Error("Failed to fetch datasets.");
  }

  return response.json();
}

export async function getDataset(
  datasetId: number
): Promise<Dataset> {
  const response = await fetch(
    `${API_BASE_URL}/datasets/${datasetId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dataset.");
  }

  return response.json();
}

export async function askQuestion(
  datasetId: number,
  question: string
): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/query/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataset_id: datasetId,
      question,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail || "Failed to process question."
    );
  }

  return response.json();
}
export async function uploadDataset(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/upload/`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(
      () => null
    );

    throw new Error(
      error?.detail ||
        "Failed to upload dataset."
    );
  }

  return response.json();
}
export interface DatasetPreviewResponse {
  dataset_id: number;
  original_filename: string;
  table_name: string;
  total_rows: number;
  preview_rows: number;
  columns: string[];
  data: Record<string, unknown>[];
}

export async function getDatasetPreview(
  datasetId: number,
  limit: number = 10
): Promise<DatasetPreviewResponse> {
  const response = await fetch(
    `${API_BASE_URL}/datasets/${datasetId}/preview?limit=${limit}`
  );

  if (!response.ok) {
    const error = await response.json().catch(
      () => null
    );

    throw new Error(
      error?.detail ||
        "Failed to load dataset preview."
    );
  }

  return response.json();
}