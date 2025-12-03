// mock-server/index.js
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// -------------------------------------
// In-Memory Stores (same as your original)
// -------------------------------------
import userStore from "./userStore.js";   // or wherever you keep it
import eventStore from "./eventStore.js"; // keep your structure intact

// -------------------------------------
// MSW Handlers (copy your exact handlers)
// -------------------------------------
const handlers = [
  http.get("http://event.com/getUsers", () => {
    return HttpResponse.json(Object.values(userStore));
  }),

  http.get("http://event.com/getUserById/:id", ({ params }) => {
    const user = userStore[params.id];
    return HttpResponse.json(user);
  }),

  http.get("http://event.com/getEvents", () => {
    return HttpResponse.json(Object.values(eventStore));
  }),

  http.get("http://event.com/getEventById/:id", async ({ params }) => {
    const event = eventStore[params.id];
    await new Promise((resolve) => setTimeout(resolve, 500));
    return HttpResponse.json(event);
  }),

  http.post("http://event.com/addEvent", async ({ request }) => {
    const body = await request.json();

    if (addEventRequestCount < 5) {
      addEventRequestCount++;
      const newEventId = String(Date.now());

      eventStore[newEventId] = body;
      userStore[body.userId].events.push(newEventId);

      return HttpResponse.json({ success: true });
    }

    if (addEventRequestCount < 15) {
      addEventRequestCount++;
      return HttpResponse.json(
        {
          success: false,
          message: "Service unavailable. Too many requests."
        },
        { status: 503 }
      );
    }

    addEventRequestCount = 0;
    return HttpResponse.json({ success: true });
  })
];

// Track the POST failure cycle
let addEventRequestCount = 0;

// -------------------------------------
// Setup MSW server
// -------------------------------------
const server = setupServer(...handlers);

// -------------------------------------
// Public function: start mock server
// -------------------------------------
export async function startMockServer() {
  if (server.listening) return; // Already started
  server.listen({
    onUnhandledRequest: "bypass"
  });
  console.log("[mock-server] MSW mock API started.");
}

// -------------------------------------
// OPTIONAL: export for tests
// -------------------------------------
export { server };
