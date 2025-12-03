import { addEvent } from "./eventApi.service.js";
import { CircuitBreaker } from "../lib/circuitBreaker.js";
import { AppError } from "../lib/AppError.js";

// -------------------------------------
// Circuit Breaker Instance for addEvent
// -------------------------------------
const addEventBreaker = new CircuitBreaker({
  serviceName: "addEvent",
  failureThreshold: 3,       // 3 failures
  rollingWindowMs: 30000,    // in 30s
  openStateDurationMs: 10000 // stay OPEN for 10s before half-open
});

// -------------------------------------
// Public Handler
// -------------------------------------
export async function addEventHandler(body: Record<string, unknown>) {
  try {
    const result = await addEventBreaker.exec(() => addEvent(body));

    // External API returns { success: boolean, message?: string }
    if (!result.success) {
      throw new AppError(502, "External service rejected the request", result);
    }

    return result;
  } catch (err) {
    //
    // If breaker failed fast (state=open), err.message contains:
    // "CircuitBreaker[addEvent] is OPEN — failing fast"
    //
    if (err instanceof Error && err.message.includes("CircuitBreaker[addEvent]")) {
      throw new AppError(
        503,
        "Event service temporarily unavailable",
        { reason: "circuit-breaker-open" }
      );
    }

    //
    // Otherwise: normal external failure or API error
    //
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      502,
      "Failed to add event due to external service error",
      err
    );
  }
}
