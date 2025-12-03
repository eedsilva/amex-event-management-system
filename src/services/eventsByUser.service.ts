import { getUserById, getEventById, Event } from "./eventApi.service.js";
import { AppError } from "../lib/AppError.js";

/**
 * Fetch all events for a given user ID using parallel requests.
 * This solves the Task 2 latency issue while staying realistic
 * (no "fetch everything and filter" anti-pattern).
 */
export async function getEventsByUserId(userId: string): Promise<Event[]> {
  // Get the user first
  const user = await getUserById(userId);

  // No events → fast return
  if (!user.events || user.events.length === 0) {
    return [];
  }

  try {
    // Parallel fetch all events using Promise.all
    const eventPromises = user.events.map((eventId) => getEventById(eventId));

    const events = await Promise.all(eventPromises);

    return events;
  } catch (err) {
    // Any failure = clean Fastify-friendly AppError
    throw new AppError(
      502,
      "Failed to fetch user events from external service",
      err
    );
  }
}
