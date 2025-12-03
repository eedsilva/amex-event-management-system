import Fastify from "fastify";
import eventsRoutes from "../src/routes/events.routes";
import * as addEventService from "../src/services/addEvent.service";
import { AppError } from "../src/lib/AppError";

// Mock the addEventHandler only (Breaker + API already unit-tested)
jest.mock("../src/services/addEvent.service");

describe("POST /api/addEvent (route integration)", () => {
  let app: ReturnType<typeof Fastify>;
  const mockAddEventHandler = addEventService.addEventHandler as jest.Mock;

  beforeAll(async () => {
    app = Fastify();
    app.register(eventsRoutes, { prefix: "/api" });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // SUCCESS CASE
  // -----------------------------
  test("returns 200 and success JSON when service succeeds", async () => {
    mockAddEventHandler.mockResolvedValue({ success: true });

    const response = await app.inject({
      method: "POST",
      url: "/api/addEvent",
      payload: { foo: "bar" }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ success: true });
    expect(mockAddEventHandler).toHaveBeenCalled();
  });

  // -----------------------------
  // FAIL-FAST (Breaker open -> 503)
  // -----------------------------
  test("returns 503 structured AppError when breaker open", async () => {
    mockAddEventHandler.mockRejectedValue(
      new AppError(503, "Event service temporarily unavailable", {
        reason: "circuit-breaker-open"
      })
    );

    const response = await app.inject({
      method: "POST",
      url: "/api/addEvent",
      payload: { foo: "bar" }
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      error: true,
      message: "Event service temporarily unavailable",
      details: { reason: "circuit-breaker-open" }
    });
  });

  // -----------------------------
  // SERVICE-LEVEL EXTERNAL ERROR
  // -----------------------------
  test("returns 502 when service throws AppError(502)", async () => {
    mockAddEventHandler.mockRejectedValue(
      new AppError(502, "External API error")
    );

    const response = await app.inject({
      method: "POST",
      url: "/api/addEvent",
      payload: { foo: "bar" }
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      error: true,
      message: "External API error",
      details: null
    });
  });

  // -----------------------------
  // UNEXPECTED ERROR FALLBACK
  // -----------------------------
  test("returns 500 for unknown errors", async () => {
    mockAddEventHandler.mockRejectedValue(new Error("unexpected"));

    const response = await app.inject({
      method: "POST",
      url: "/api/addEvent",
      payload: { foo: "bar" }
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: true,
      message: "Internal Server Error"
    });
  });
});
