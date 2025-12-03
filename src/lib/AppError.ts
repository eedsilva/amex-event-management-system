export class AppError extends Error {
    status: number;
    details?: unknown;
  
    constructor(status: number, message: string, details?: unknown) {
      super(message);
      this.status = status;
      this.details = details;
  
      // Ensure the name is always AppError for easier logging
      this.name = "AppError";
    }
  }
  