import { FastifyInstance } from "fastify";
import { getUsers, getEvents } from "../services/eventApi.service.js";
import { getEventsByUserId } from "../services/eventsByUser.service.js";
import { addEventHandler } from "../services/addEvent.service.js";
import { sendError } from "../lib/sendError.js";

export default async function eventsRoutes(app: FastifyInstance) {
  // -------------------------------------
  // GET /api/getUsers
  // -------------------------------------
  app.get("/getUsers", async (_, reply) => {
    try {
      const users = await getUsers();
      reply.send(users);
    } catch (err) {
      sendError(reply, err);
    }
  });

  // -------------------------------------
  // GET /api/getEvents
  // -------------------------------------
  app.get("/getEvents", async (_, reply) => {
    try {
      const events = await getEvents();
      reply.send(events);
    } catch (err) {
      sendError(reply, err);
    }
  });

  // -------------------------------------
  // GET /api/getEventsByUserId/:id
  // -------------------------------------
  app.get("/getEventsByUserId/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const events = await getEventsByUserId(id);
      reply.send(events);
    } catch (err) {
      sendError(reply, err);
    }
  });

  // -------------------------------------
  // POST /api/addEvent
  // -------------------------------------
  app.post("/addEvent", async (request, reply) => {
    try {
      const body = request.body as Record<string, unknown>;
      const result = await addEventHandler(body);
      reply.send(result);
    } catch (err) {
      sendError(reply, err);
    }
  });
}
