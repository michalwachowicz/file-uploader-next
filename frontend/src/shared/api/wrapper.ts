import axios, { AxiosError, Method, AxiosResponse } from "axios";
import apiClient from "@/shared/api/client";
import { config } from "@/shared/lib/config";

type ApiRequestOptions<TResponse = unknown> = {
  method: Method;
  path: string;
  data?: unknown;
  token?: string;
  defaultErrorMessage: string;
  extractData?: (response: AxiosResponse<unknown>) => TResponse;
};

/**
 * Shared API wrapper that handles both server-side (with token) and client-side (without token) requests.
 *
 * @param options - Request configuration
 * @returns Promise resolving to the response data
 * @throws {Error} If the request fails
 */
export async function apiRequest<TResponse = unknown>({
  method,
  path,
  data,
  token,
  defaultErrorMessage,
  extractData,
}: ApiRequestOptions<TResponse>): Promise<TResponse> {
  try {
    let response: AxiosResponse<unknown>;

    if (token) {
      response = await axios.request({
        method,
        url: `${config.apiUrl}${path}`,
        data,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } else {
      response = await apiClient.request({
        method,
        url: path,
        data,
      });
    }

    if (extractData) {
      return extractData(response);
    }
    return response.data as TResponse;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const errorMessage =
      axiosError.response?.data?.error ||
      axiosError.message ||
      defaultErrorMessage;

    throw new Error(errorMessage);
  }
}
