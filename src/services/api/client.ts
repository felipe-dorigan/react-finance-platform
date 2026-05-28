export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export type ApiClient = {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  patch<T>(path: string, body?: unknown): Promise<T>;
  delete<T>(path: string): Promise<T>;
};

async function request<T>(baseUrl: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(response.statusText || 'Request failed', response.status, payload);
  }

  return payload as T;
}

export function createApiClient(baseUrl = ''): ApiClient {
  return {
    get: <T>(path: string) => request<T>(baseUrl, path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(baseUrl, path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(baseUrl, path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(baseUrl, path, { method: 'DELETE' }),
  };
}