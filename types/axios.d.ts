// Axios types copied
export interface AxiosRequestConfig {
  url: string;
  method?: 'get' | 'post' | 'put' | 'delete'; // Extend as needed
  headers?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: Record<string, any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AxiosResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AxiosError<T = any> extends Error {
  config: AxiosRequestConfig;
  code?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request?: any;
  response?: AxiosResponse<T>;
}
