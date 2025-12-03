// mock-server/userStore.js

/**
 * In-memory user store for MSW mock API.
 * 
 * Shape:
 * {
 *   "1": { id: "1", name: "Alice", events: ["101", "102"] },
 *   "2": { id: "2", name: "Bob",   events: [] },
 *   ...
 * }
 */

const userStore = {
    "1": {
      id: "1",
      name: "Alice Johnson",
      events: ["101", "102"]
    },
    "2": {
      id: "2",
      name: "Bob Anderson",
      events: []
    },
    "3": {
      id: "3",
      name: "Carla Mendez",
      events: ["103"]
    }
  };
  
  /**
   * Helper to reset users between test runs (optional).
   */
  export function resetUserStore() {
    userStore["1"].events = ["101", "102"];
    userStore["2"].events = [];
    userStore["3"].events = ["103"];
  }
  
  export default userStore;
  