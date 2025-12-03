import { CircuitBreaker } from "../src/lib/circuitBreaker";

const config = {
  serviceName: "testService",
  failureThreshold: 3,
  rollingWindowMs: 30000,
  openStateDurationMs: 200 // short cooldown for testing
};

describe("CircuitBreaker", () => {
  test("opens after 3 failures", async () => {
    const breaker = new CircuitBreaker(config);

    const failingFn = () => Promise.reject(new Error("fail"));

    await expect(breaker.exec(failingFn)).rejects.toThrow();
    await expect(breaker.exec(failingFn)).rejects.toThrow();
    await expect(breaker.exec(failingFn)).rejects.toThrow();

    // 4th request should be fail-fast, not call the function
    await expect(breaker.exec(failingFn)).rejects.toThrow(
      /OPEN — failing fast/
    );
  });

  test("half-open allows exactly one canary", async () => {
    jest.useFakeTimers();

    const breaker = new CircuitBreaker(config);
    const failingFn = () => Promise.reject(new Error("fail"));
    const successFn = () => Promise.resolve("ok");

    // Trip breaker
    await expect(breaker.exec(failingFn)).rejects.toThrow();
    await expect(breaker.exec(failingFn)).rejects.toThrow();
    await expect(breaker.exec(failingFn)).rejects.toThrow();

    // Move time forward into half-open
    jest.advanceTimersByTime(config.openStateDurationMs);

    // Canary runs first
    const canary = breaker.exec(successFn);
    expect(await canary).toBe("ok");

    // Now breaker should be closed again
    const res = await breaker.exec(successFn);
    expect(res).toBe("ok");

    jest.useRealTimers();
  });

  test("canary failure reopens breaker", async () => {
    jest.useFakeTimers();

    const breaker = new CircuitBreaker(config);
    const failingFn = () => Promise.reject(new Error("fail"));

    // Trip breaker
    await expect(breaker.exec(failingFn)).rejects.toThrow();
    await expect(breaker.exec(failingFn)).rejects.toThrow();
    await expect(breaker.exec(failingFn)).rejects.toThrow();

    jest.advanceTimersByTime(config.openStateDurationMs);

    // Canary fails → breaker becomes OPEN immediately
    await expect(breaker.exec(failingFn)).rejects.toThrow();

    // Immediately fail-fast again
    await expect(breaker.exec(failingFn)).rejects.toThrow(
      /OPEN — failing fast/
    );

    jest.useRealTimers();
  });
});
