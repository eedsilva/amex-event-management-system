import Fastify from "fastify";
import { routes } from "./routes/index.js";
import { config } from "./config/index.js";

async function startServer() {
  const app = Fastify({
    logger: true
  });

  // Register all routes
  app.register(routes);

  // Start MSW mock server (dev-only)
  if (config.env === "development") {
    const { startMockServer } = await import("../mock-server/index.js");
    await startMockServer();
    app.log.info("Mock server started.");
  }

  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
    app.log.info(`Server running at http://localhost:${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
