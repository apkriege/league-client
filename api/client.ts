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
        // Add auth token if available
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
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
   * Get authentication token from storage
   */
  private getToken(): string | null {
    return localStorage.getItem("token");
  }

  /**
   * Set authentication token
   */
  public setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  /**
   * Remove authentication token
   */
  public removeToken(): void {
    localStorage.removeItem("token");
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): Promise<ApiErrorResponse> {
    const errorResponse: ApiErrorResponse = {
      message: "An unexpected error occurred",
      status: error.response?.status,
    };

    if (error.response) {
      // Server responded with error
      errorResponse.message = (error.response.data as any)?.message || error.message;
      errorResponse.errors = (error.response.data as any)?.errors;

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          errorResponse.message = "Unauthorized - Please login again";
          this.removeToken();
          break;
        case 403:
          errorResponse.message = "Forbidden - You do not have permission";
          break;
        case 404:
          errorResponse.message = "Resource not found";
          break;
        case 500:
          errorResponse.message = "Server error - Please try again later";
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
