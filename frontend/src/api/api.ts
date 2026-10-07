const API_BASE_URL = "http://localhost:8000";


// ============================================================
// ACCESS TOKEN
// ============================================================
//
// The access token is intentionally kept in memory.
// We do NOT store it in localStorage.
//
// Refresh token is stored by the backend in an HttpOnly cookie.
// ============================================================

let accessToken: string | null = null;


// ============================================================
// AUTH TYPES
// ============================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  email: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  role: string;
}


// ============================================================
// AUTH TOKEN MANAGEMENT
// ============================================================

export function setAccessToken(
  token: string | null
): void {
  accessToken = token;
}


export function getAccessToken(): string | null {
  return accessToken;
}


// ============================================================
// COMMON ERROR HANDLER
// ============================================================

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {

  const error =
    await response
      .json()
      .catch(() => null);

  return (
    error?.detail ||
    fallback
  );
}


// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================
//
// The browser automatically sends the HttpOnly
// refresh_token cookie.
//
// The refresh token itself is never exposed to React.
// ============================================================

let refreshPromise:
  Promise<string | null> | null = null;


async function refreshAccessToken(): Promise<string | null> {

  // ----------------------------------------------------------
  // Prevent multiple simultaneous refresh requests.
  //
  // If 5 API requests fail with 401 at the same time,
  // only ONE refresh request will be sent.
  // ----------------------------------------------------------

  if (refreshPromise) {
    return refreshPromise;
  }


  refreshPromise =
    (async () => {

      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/auth/refresh`,
            {
              method: "POST",

              credentials: "include",
            }
          );


        if (!response.ok) {

          accessToken = null;

          return null;
        }


        const data:
          LoginResponse =
          await response.json();


        accessToken =
          data.access_token;


        return accessToken;

      } catch (error) {

        console.error(
          "Token refresh failed:",
          error
        );

        accessToken = null;

        return null;

      } finally {

        refreshPromise = null;
      }

    })();


  return refreshPromise;
}


// ============================================================
// AUTHENTICATED FETCH
// ============================================================
//
// Automatically:
// 1. Adds Bearer access token
// 2. Sends cookies
// 3. Refreshes access token on 401
// 4. Retries original request once
// ============================================================

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  retry: boolean = true
): Promise<Response> {

  const headers =
    new Headers(
      options.headers
    );


  // ----------------------------------------------------------
  // Add access token
  // ----------------------------------------------------------

  if (accessToken) {

    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  }


  // ----------------------------------------------------------
  // Send cookies
  // ----------------------------------------------------------

  const requestOptions:
    RequestInit = {
      ...options,
      headers,
      credentials: "include",
    };


  let response =
    await fetch(
      url,
      requestOptions
    );


  // ----------------------------------------------------------
  // Access token expired
  // ----------------------------------------------------------

  if (
    response.status === 401 &&
    retry
  ) {

    const newToken =
      await refreshAccessToken();


    if (newToken) {

      const retryHeaders =
        new Headers(
          options.headers
        );

      retryHeaders.set(
        "Authorization",
        `Bearer ${newToken}`
      );


      response =
        await fetch(
          url,
          {
            ...options,

            headers:
              retryHeaders,

            credentials:
              "include",
          }
        );
    }
  }


  return response;
}


// ============================================================
// REGISTER
// ============================================================

export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {

  const response =
    await fetch(
      `${API_BASE_URL}/api/auth/register`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials:
          "include",

        body:
          JSON.stringify(data),
      }
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Registration failed."
      )
    );
  }


  return response.json();
}


// ============================================================
// LOGIN
// ============================================================

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {

  const response =
    await fetch(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials:
          "include",

        body:
          JSON.stringify(data),
      }
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Login failed."
      )
    );
  }


  const result:
    LoginResponse =
    await response.json();


  // ----------------------------------------------------------
  // Store access token in memory only
  // ----------------------------------------------------------

  accessToken =
    result.access_token;


  return result;
}


// ============================================================
// RESTORE SESSION
// ============================================================
//
// Called when the React application starts.
//
// If a valid refresh cookie exists, the backend returns
// a new access token.
//
// No token needs to be stored in localStorage.
// ============================================================

export async function restoreSession():
  Promise<boolean> {

  const token =
    await refreshAccessToken();


  return token !== null;
}


// ============================================================
// GET CURRENT USER
// ============================================================

export async function getCurrentUser():
  Promise<CurrentUser> {

  const response =
    await apiFetch(
      `${API_BASE_URL}/api/auth/me`
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Failed to get current user."
      )
    );
  }


  return response.json();
}


// ============================================================
// LOGOUT
// ============================================================

export async function logout():
  Promise<void> {

  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/auth/logout`,
        {
          method: "POST",

          credentials:
            "include",

          headers:
            accessToken
              ? {
                  Authorization:
                    `Bearer ${accessToken}`,
                }
              : undefined,
        }
      );


    if (!response.ok) {

      throw new Error(
        await getErrorMessage(
          response,
          "Logout failed."
        )
      );
    }

  } finally {

    // --------------------------------------------------------
    // Always remove access token from memory.
    // --------------------------------------------------------

    accessToken = null;
  }
}


// ============================================================
// DATASET TYPES
// ============================================================

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


// ============================================================
// RAG SOURCE
// ============================================================

export interface RagSource {
  rank: number;
  chunk_id: number;
  chunk_type: string;
  content: string;
  distance: number;
  similarity: number;
}


// ============================================================
// QUERY RESPONSE
// ============================================================

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
    sources?: RagSource[];
  };
}


// ============================================================
// DATASET PREVIEW
// ============================================================

export interface DatasetPreviewResponse {
  dataset_id: number;
  original_filename: string;
  table_name: string;
  total_rows: number;
  preview_rows: number;
  columns: string[];
  data: Record<string, unknown>[];
}


// ============================================================
// DELETE DATASET RESPONSE
// ============================================================

export interface DeleteDatasetResponse {
  message: string;
  dataset_id: number;
  table_name: string;
  metadata_deleted: boolean;
  embeddings_deleted: boolean;
  table_deleted: boolean;
  file_deleted: boolean;
}


// ============================================================
// GET ALL DATASETS
// ============================================================

export async function getDatasets():
  Promise<DatasetListResponse> {

  const response =
    await apiFetch(
      `${API_BASE_URL}/datasets/`
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Failed to fetch datasets."
      )
    );
  }


  return response.json();
}


// ============================================================
// GET SINGLE DATASET
// ============================================================

export async function getDataset(
  datasetId: number
): Promise<Dataset> {

  const response =
    await apiFetch(
      `${API_BASE_URL}/datasets/${datasetId}`
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Failed to fetch dataset."
      )
    );
  }


  return response.json();
}


// ============================================================
// ASK QUESTION
// ============================================================

export async function askQuestion(
  datasetId: number,
  question: string
): Promise<QueryResponse> {

  const response =
    await apiFetch(
      `${API_BASE_URL}/query/`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            dataset_id:
              datasetId,

            question,
          }),
      }
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Failed to process question."
      )
    );
  }


  return response.json();
}


// ============================================================
// UPLOAD DATASET
// ============================================================

export async function uploadDataset(
  file: File
) {

  const formData =
    new FormData();


  formData.append(
    "file",
    file
  );


  const response =
    await apiFetch(
      `${API_BASE_URL}/upload/`,
      {
        method: "POST",

        body:
          formData,
      }
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Failed to upload dataset."
      )
    );
  }


  return response.json();
}


// ============================================================
// DATASET PREVIEW
// ============================================================

export async function getDatasetPreview(
  datasetId: number,
  limit: number = 10
): Promise<DatasetPreviewResponse> {

  const response =
    await apiFetch(
      `${API_BASE_URL}/datasets/${datasetId}/preview?limit=${limit}`
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load dataset preview."
      )
    );
  }


  return response.json();
}


// ============================================================
// DELETE DATASET
// ============================================================

export async function deleteDataset(
  datasetId: number
): Promise<DeleteDatasetResponse> {

  const response =
    await apiFetch(
      `${API_BASE_URL}/datasets/${datasetId}`,
      {
        method: "DELETE",
      }
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Failed to delete dataset."
      )
    );
  }


  return response.json();
}


// ============================================================
// DATASET STATISTICS
// ============================================================

export interface DatasetStatistics {
  dataset_id: number;
  table_name: string;
  rows: number;
  columns: number;
  numeric_columns: string[];

  numeric_statistics: Record<
    string,
    {
      count: number;
      sum: number;
      average: number;
      minimum: number | null;
      maximum: number | null;
    }
  >;
}


export async function getDatasetStatistics(
  datasetId: number
): Promise<DatasetStatistics> {

  const response =
    await apiFetch(
      `${API_BASE_URL}/datasets/${datasetId}/statistics`
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response,
        "Failed to load dataset statistics."
      )
    );
  }


  return response.json();
}