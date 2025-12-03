/**
 * Tests for getEventsByUserId (Task 2 - Parallel Execution)
 */
import { getEventsByUserId } from "../src/services/eventsByUser.service";
import * as eventApi from "../src/services/eventApi.service";
import { AppError } from "../src/lib/AppError";

// Mock all eventApi service methods
jest.mock("../src/services/eventApi.service");

describe("getEventsByUserId - parallel event fetching", () => {
  const mockGetUserById = eventApi.getUserById as jest.Mock;
  const mockGetEventById = eventApi.getEventById as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetches all events in parallel and returns them", async () => {
    // user has 3 events
    mockGetUserById.mockResolvedValue({
      id: "1",
      name: "Alice",
      events: ["101", "102", "103"]
    });

    // simulate delayed events (100ms each)
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    mockGetEventById.mockImplementation(async (id: string) => {
      await delay(100);
      return { id, userId: "1", title: `Event ${id}`, description: "" };
    });

    const start = Date.now();
    const events = await getEventsByUserId("1");
    const diff = Date.now() - start;

    // Returned the events
    expect(events.length).toBe(3);

    // Should be < 200ms because they run concurrently
    expect(diff).toBeLessThan(250);

    // Sequential would have been ≈ 300ms (3 × 100ms)
  });

  test("returns empty list when user has no events", async () => {
    mockGetUserById.mockResolvedValue({
      id: "1",
      name: "Bob",
      events: []
    });

    const events = await getEventsByUserId("1");
    expect(events).toEqual([]);
  });

  test("throws AppError when an event fetch fails", async () => {
    mockGetUserById.mockResolvedValue({
      id: "1",
      name: "Alice",
      events: ["101"]
    });

    mockGetEventById.mockRejectedValue(
      new Error("External event API failure")
    );

    await expect(getEventsByUserId("1")).rejects.toThrow(AppError);
  });
});
