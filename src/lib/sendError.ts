import { FastifyReply } from "fastify";
import { AppError } from "./AppError.js";

export function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof AppError) {
    reply.code(error.status).send({
      error: true,
      message: error.message,
      details: error.details ?? null
    });
    return;
  }

  // Unexpected error fallback
  reply.code(500).send({
    error: true,
    message: "Internal Server Error"
  });
}
