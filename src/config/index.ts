export const config = {
    env: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 3000,
  
    // Base URL for external event service (mock server)
    eventApiBaseUrl: "http://event.com"
  };
  