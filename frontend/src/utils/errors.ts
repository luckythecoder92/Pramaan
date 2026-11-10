import axios from "axios";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractDetail(data: unknown): string | null {
  if (!isRecord(data)) {
    return null;
  }

  const detail = data.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (isRecord(item) && typeof item.msg === "string") {
          return item.msg;
        }

        return null;
      })
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  const message = data.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return null;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = extractDetail(error.response?.data);

    if (detail) {
      return detail;
    }

    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "The request timed out. Please try again.";
      }

      return "Cannot reach the Pramaan server. Make sure the backend is running.";
    }

    switch (error.response.status) {
      case 400:
        return "The request could not be completed. Please check your input.";
      case 401:
        return "Your session has expired. Please sign in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 413:
        return "The file is too large. The maximum size is 10 MB.";
      case 415:
        return "That file type is not supported.";
      case 422:
        return "Some of the information provided is invalid. Please review it.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
        return "The Pramaan service is temporarily unavailable. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
