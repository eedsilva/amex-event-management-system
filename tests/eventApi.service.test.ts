import {
    getUsers,
    getEvents,
    getUserById,
    getEventById,
    addEvent
  } from "../src/services/eventApi.service";
  import { AppError } from "../src/lib/AppError";
  import { config } from "../src/config/index";
  
  const globalAny: any = global;
  
  describe("eventApi.service", () => {
    beforeEach(() => {
      globalAny.fetch = jest.fn();
    });
  
    // -------------------------------------
    // SUCCESS CASES
    // -------------------------------------
    test("getUsers calls correct URL and returns JSON", async () => {
      globalAny.fetch.mockResolvedValue({
        ok: true,
        json: async () => [{ id: "1", name: "Alice", events: [] }]
      });
  
      const users = await getUsers();
      expect(users[0].id).toBe("1");
  
      expect(globalAny.fetch).toHaveBeenCalledWith(
        `${config.eventApiBaseUrl}/getUsers`,
        expect.any(Object)
      );
    });
  
    test("getUserById calls correct URL", async () => {
      globalAny.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: "1", name: "Alice", events: [] })
      });
  
      const user = await getUserById("1");
      expect(user.id).toBe("1");
  
      expect(globalAny.fetch).toHaveBeenCalledWith(
        `${config.eventApiBaseUrl}/getUserById/1`,
        expect.any(Object)
      );
    });
  
    test("addEvent sends POST and returns JSON", async () => {
      globalAny.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
  
      const payload = { foo: "bar" };
      const res = await addEvent(payload);
  
      expect(res.success).toBe(true);
  
      expect(globalAny.fetch).toHaveBeenCalledWith(
        `${config.eventApiBaseUrl}/addEvent`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(payload)
        })
      );
    });
  
    // -------------------------------------
    // ERROR CASES
    // -------------------------------------
    test("throws AppError when response.ok = false", async () => {
      globalAny.fetch.mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: "failed" })
      });
  
      await expect(getUsers()).rejects.toThrow(AppError);
  
      try {
        await getUsers();
      } catch (err: any) {
        expect(err.status).toBe(503);
        expect(err.message).toBe("External API error");
        expect(err.details).toEqual({ error: "failed" });
      }
    });
  
    test("throws AppError on invalid JSON", async () => {
      globalAny.fetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        }
      });
  
      await expect(getUsers()).rejects.toThrow(AppError);
  
      try {
        await getUsers();
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.message).toBe("Invalid JSON received from external API");
      }
    });
  
    test("throws generic AppError for network failure", async () => {
      globalAny.fetch.mockRejectedValue(new Error("Network down"));
  
      await expect(getUsers()).rejects.toThrow(AppError);
  
      try {
        await getUsers();
      } catch (err: any) {
        expect(err.status).toBe(500);
      }
    });
  });
  