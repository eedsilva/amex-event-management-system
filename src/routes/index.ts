import { FastifyInstance } from "fastify";
import eventsRoutes from "./events.routes.js";

export async function routes(app: FastifyInstance) {
  // Events-related endpoints
  app.register(eventsRoutes, { prefix: "/api" });
}
