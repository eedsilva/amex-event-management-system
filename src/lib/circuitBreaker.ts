import { TypedEventEmitter } from "./typedEventEmitter.js";

//
// -------------------------------------
// Event Types
// -------------------------------------
//
export interface CircuitBreakerEvents {
  "circuitBreaker.open": {
    service: string;
    failureCount: number;
  };
  "circuitBreaker.halfOpen": {
    service: string;
  };
  "circuitBreaker.closed": {
    service: string;
  };
}

export const circuitBreakerEmitter =
  new TypedEventEmitter<CircuitBreakerEvents>();

//
// -------------------------------------
// Circuit Breaker States
// -------------------------------------
//
type BreakerState = "closed" | "open" | "halfOpen";

interface BreakerConfig {
  serviceName: string;

  failureThreshold: number; // e.g., 3
  rollingWindowMs: number;  // e.g., 30000
  openStateDurationMs: number; // cooldown, e.g., 10000
}

export class CircuitBreaker {
  private state: BreakerState = "closed";
  private failures: number[] = []; // timestamps of failures
  private lastStateChange = Date.now();
  private canaryInFlight = false;

  constructor(private config: BreakerConfig) {}

  //
  // -------------------------------------
  // Public: Attempt a protected action
  // -------------------------------------
  //
  async exec<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();

    // -------------------------------------
    // OPEN STATE — immediately reject
    // -------------------------------------
    if (this.state === "open") {
      const elapsed = now - this.lastStateChange;

      if (elapsed < this.config.openStateDurationMs) {
        throw this.failFastError();
      }

      // Time to transition to HALF-OPEN
      this.toHalfOpen();
    }

    // -------------------------------------
    // HALF-OPEN — allow exactly 1 canary
    // -------------------------------------
    if (this.state === "halfOpen") {
      if (this.canaryInFlight) {
        throw this.failFastError();
      }

      this.canaryInFlight = true;

      try {
        const result = await fn();
        this.toClosed();
        return result;
      } catch (err) {
        this.toOpen();
        throw err;
      }
    }

    // -------------------------------------
    // CLOSED — normal execution
    // -------------------------------------
    try {
      const result = await fn();
      return result;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  //
  // -------------------------------------
  // Closed State: Record failure
  // -------------------------------------
  //
  private recordFailure() {
    const now = Date.now();
    this.failures.push(now);

    // Keep only failures within rolling window
    this.failures = this.failures.filter(
      (t) => now - t <= this.config.rollingWindowMs
    );

    if (this.failures.length >= this.config.failureThreshold) {
      this.toOpen();
    }
  }

  //
  // -------------------------------------
  // State Transitions
  // -------------------------------------
  //
  private toOpen() {
    this.state = "open";
    this.lastStateChange = Date.now();
    this.canaryInFlight = false;

    circuitBreakerEmitter.emit("circuitBreaker.open", {
      service: this.config.serviceName,
      failureCount: this.failures.length
    });
  }

  private toHalfOpen() {
    this.state = "halfOpen";
    this.canaryInFlight = false;

    circuitBreakerEmitter.emit("circuitBreaker.halfOpen", {
      service: this.config.serviceName
    });
  }

  private toClosed() {
    this.state = "closed";
    this.failures = [];
    this.canaryInFlight = false;
    this.lastStateChange = Date.now();

    circuitBreakerEmitter.emit("circuitBreaker.closed", {
      service: this.config.serviceName
    });
  }

  //
  // -------------------------------------
  // Fail-Fast helper
  // -------------------------------------
  //
  private failFastError() {
    return new Error(
      `CircuitBreaker[${this.config.serviceName}] is OPEN — failing fast`
    );
  }
}
