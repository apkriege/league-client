/// <reference types="vite/client" />

import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
// API Configuration
interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// API Response wrapper
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// API Error wrapper
interface ApiErrorResponse {
  message: string;
  status?: number;
  errors?: any;
}

class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig = {}) {
    this.client = axios.create({
      baseURL: config.baseURL || import.meta.env.VITE_API_URL || "http://localhost:3000/api",
      timeout: config.timeout || 10000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      withCredentials: true, // Enable automatic cookie sending
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return this.handleError(error);
      }
    );
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): Promise<ApiErrorResponse> {
    const responseData = error.response?.data as any;
    const serverMessage =
      typeof responseData === "string"
        ? responseData
        : responseData?.message || responseData?.error || responseData?.name;
    const errorResponse: ApiErrorResponse = {
      message: "An unexpected error occurred",
      status: error.response?.status,
    };

    if (error.response) {
      // Server responded with error
      errorResponse.message = serverMessage || error.message;
      errorResponse.errors = responseData?.errors;

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          errorResponse.message = serverMessage || "Unauthorized - Please login again";
          if (
            typeof window !== "undefined" &&
            window.location.pathname !== "/login"
          ) {
            localStorage.removeItem("app-store");
            const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            window.location.replace(`/login?redirect=${encodeURIComponent(returnTo)}`);
          }
          break;
        case 403:
          errorResponse.message = serverMessage || "Forbidden - You do not have permission";
          break;
        case 404:
          errorResponse.message = serverMessage || "Resource not found";
          break;
        case 500:
          errorResponse.message = serverMessage || "Server error - Please try again later";
          break;
      }
    } else if (error.request) {
      // Request made but no response
      errorResponse.message = "Network error - Please check your connection";
    }

    return Promise.reject(errorResponse);
  }

  /**
   * GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * POST request
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * PATCH request
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * Upload file(s)
   */
  public async upload<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return {
      data: response.data,
      status: response.status,
    };
  }

  /**
   * Get the raw axios instance for advanced usage
   */
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient, type ApiResponse, type ApiErrorResponse, type ApiClientConfig };
