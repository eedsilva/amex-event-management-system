import { config } from "../config/index.js";
import { AppError } from "../lib/AppError.js";

const BASE_URL = config.eventApiBaseUrl;

// -------------------------------------
// Types
// -------------------------------------

export interface User {
  id: string;
  name: string;
  events: string[];
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description: string;
}

interface AddEventResponse {
  success: boolean;
  message?: string;
}

// -------------------------------------
// Helper: fetch wrapper
// -------------------------------------

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      }
    });
  } catch (err) {
    throw new AppError(500, "External API error", err);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new AppError(500, "Invalid JSON received from external API");
  }

  if (!response.ok) {
    throw new AppError(response.status, "External API error", json);
  }

  return json as T;
}

// -------------------------------------
// API Methods
// -------------------------------------

export function getUsers(): Promise<User[]> {
  return request<User[]>("/getUsers");
}

export function getEvents(): Promise<Event[]> {
  return request<Event[]>("/getEvents");
}

export function getUserById(id: string): Promise<User> {
  return request<User>(`/getUserById/${id}`);
}

export function getEventById(id: string): Promise<Event> {
  return request<Event>(`/getEventById/${id}`);
}

export function addEvent(body: Record<string, unknown>): Promise<AddEventResponse> {
  return request<AddEventResponse>("/addEvent", {
    method: "POST",
    body: JSON.stringify(body)
  });
}
