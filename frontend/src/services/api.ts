import { ApiResponse } from '@/types';

// Detect default API base URL
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // In browser: relative /api goes through Next.js proxy or direct backend
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  // On server/Node
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
};

export class ApiError extends Error {
  public statusCode: number;
  public details?: Array<{ field?: string; issue: string }>;
  public code?: string;

  constructor(message: string, statusCode: number, details?: Array<{ field?: string; issue: string }>, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage = data.error?.message || `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data.error?.details, data.error?.code);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Network request failed';
    throw new ApiError(message, 0);
  }
}
