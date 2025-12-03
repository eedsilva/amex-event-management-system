// Mock eventApi.addEvent
jest.mock("../src/services/eventApi.service");

// Mock circuit breaker instance
jest.mock("../src/lib/circuitBreaker");

let addEventHandler: typeof import("../src/services/addEvent.service").addEventHandler;
let MockCircuitBreaker: jest.Mock;
let execMock: jest.Mock;
let AppError: typeof import("../src/lib/AppError").AppError;

describe("addEventHandler (Circuit Breaker Wrapper)", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    const circuitBreakerModule = require("../src/lib/circuitBreaker");
    MockCircuitBreaker = circuitBreakerModule.CircuitBreaker as unknown as jest.Mock;
    const { AppError: AppErrorClass } = require("../src/lib/AppError");
    AppError = AppErrorClass;

    execMock = jest.fn();
    MockCircuitBreaker.mockImplementation(() => ({
      exec: execMock
    }));

    addEventHandler = require("../src/services/addEvent.service").addEventHandler;
  });

  // -------------------------------------
  // SUCCESS CASE
  // -------------------------------------
  test("returns success when breaker and API succeed", async () => {
    execMock.mockResolvedValue({ success: true });

    const result = await addEventHandler({ foo: "bar" });

    expect(result).toEqual({ success: true });
    expect(execMock).toHaveBeenCalled();
  });

  // -------------------------------------
  // EXTERNAL API FAILS (result.success = false)
  // -------------------------------------
  test("wraps API-level error into AppError (502)", async () => {
    execMock.mockResolvedValue({
      success: false,
      message: "Service unavailable"
    });

    await expect(addEventHandler({}))
      .rejects
      .toThrow(AppError);

    try {
      await addEventHandler({});
    } catch (err: any) {
      expect(err.status).toBe(502);
      expect(err.message).toBe("External service rejected the request");
    }
  });

  // -------------------------------------
  // BREAKER FAIL-FAST (state=open)
  // -------------------------------------
  test("returns 503 AppError when breaker is OPEN (fail-fast)", async () => {
    execMock.mockRejectedValue(new Error("CircuitBreaker[addEvent] is OPEN — failing fast"));

    await expect(addEventHandler({}))
      .rejects
      .toThrow(AppError);

    try {
      await addEventHandler({});
    } catch (err: any) {
      expect(err.status).toBe(503);
      expect(err.message).toBe("Event service temporarily unavailable");
      expect(err.details).toEqual({ reason: "circuit-breaker-open" });
    }
  });

  // -------------------------------------
  // GENERIC ERROR (communication failure)
  // -------------------------------------
  test("wraps generic error into AppError(502)", async () => {
    execMock.mockRejectedValue(new Error("Network broken"));

    await expect(addEventHandler({}))
      .rejects
      .toThrow(AppError);

    try {
      await addEventHandler({});
    } catch (err: any) {
      expect(err.status).toBe(502);
      expect(err.message).toBe("Failed to add event due to external service error");
    }
  });
});
