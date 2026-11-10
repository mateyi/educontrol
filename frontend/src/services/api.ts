const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('educontrol_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    localStorage.removeItem('educontrol_token');
    localStorage.removeItem('educontrol_user');
    window.location.href = '/login';
    throw new ApiError('Sesión expirada. Por favor inicie sesión nuevamente.', 401);
  }

  let resultData;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    resultData = await response.json();
  } else {
    resultData = await response.text();
  }

  if (!response.ok) {
    const errorMsg = resultData?.error || 'Ocurrió un error en la solicitud';
    throw new ApiError(errorMsg, response.status, resultData);
  }

  return resultData as T;
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'POST', data }),
  put: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'PUT', data }),
  patch: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'PATCH', data }),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};

export default api;
