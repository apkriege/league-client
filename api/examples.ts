/**
 * API Client Usage Examples
 *
 * This file demonstrates how to use the agnostic API client
 */

import apiClient from './client';
import type { ApiResponse, ApiErrorResponse } from './client';

// ============================================
// Example 1: Basic GET request
// ============================================
export async function getUsers() {
  try {
    const response = await apiClient.get('/users');
    console.log('Users:', response.data);
    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Error fetching users:', apiError.message);
    throw error;
  }
}

// ============================================
// Example 2: GET with query parameters
// ============================================
export async function getUserById(id: string) {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Error fetching user:', apiError.message);
    throw error;
  }
}

// ============================================
// Example 3: POST request with data
// ============================================
interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export async function createUser(userData: CreateUserData) {
  try {
    const response = await apiClient.post('/users', userData);
    console.log('User created:', response.data);
    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Error creating user:', apiError.message);
    throw error;
  }
}

// ============================================
// Example 4: PUT request (update)
// ============================================
interface UpdateUserData {
  name?: string;
  email?: string;
}

export async function updateUser(id: string, userData: UpdateUserData) {
  try {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Error updating user:', apiError.message);
    throw error;
  }
}

// ============================================
// Example 5: DELETE request
// ============================================
export async function deleteUser(id: string) {
  try {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Error deleting user:', apiError.message);
    throw error;
  }
}

// ============================================
// Example 6: File upload
// ============================================
export async function uploadAvatar(file: File, userId: string) {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId);

    const response = await apiClient.upload('/users/avatar', formData, (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log(`Upload progress: ${percentCompleted}%`);
    });

    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Error uploading avatar:', apiError.message);
    throw error;
  }
}

// ============================================
// Example 7: Authentication flow
// ============================================
interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function login(credentials: LoginData) {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

    // Store the token
    apiClient.setToken(response.data.token);

    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Login failed:', apiError.message);
    throw error;
  }
}

export function logout() {
  apiClient.removeToken();
  // Optionally redirect to login page
  window.location.href = '/login';
}

// ============================================
// Example 8: Using with React Query / TanStack Query
// ============================================
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch users with React Query
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/users');
      return response.data;
    },
  });
}

// Create user with React Query
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserData) => apiClient.post('/users', userData).then((res) => res.data),
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ============================================
// Example 9: Pagination
// ============================================
interface PaginationParams {
  page: number;
  limit: number;
}

export async function getUsersPaginated(params: PaginationParams) {
  try {
    const response = await apiClient.get('/users', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Error fetching users:', apiError.message);
    throw error;
  }
}

// ============================================
// Example 10: Custom headers
// ============================================
export async function getDataWithCustomHeaders() {
  try {
    const response = await apiClient.get('/data', {
      headers: {
        'X-Custom-Header': 'custom-value',
      },
    });
    return response.data;
  } catch (error) {
    const apiError = error as ApiErrorResponse;
    console.error('Error fetching data:', apiError.message);
    throw error;
  }
}

// ============================================
// Example 11: Advanced - Using raw axios instance
// ============================================
export async function advancedRequest() {
  const axiosInstance = apiClient.getAxiosInstance();

  // Now you have full access to axios methods
  const response = await axiosInstance.request({
    method: 'GET',
    url: '/advanced-endpoint',
    // Any axios config options
  });

  return response.data;
}
