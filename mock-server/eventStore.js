// mock-server/eventStore.js

/**
 * In-memory event store for MSW mock API.
 *
 * Shape:
 * {
 *   "101": { id: "101", userId: "1", title: "...", description: "..." },
 *   "102": { id: "102", userId: "1", title: "...", description: "..." },
 *   "103": { id: "103", userId: "3", title: "...", description: "..." }
 * }
 */

const eventStore = {
    "101": {
      id: "101",
      userId: "1",
      title: "Concert",
      description: "Alice is attending a concert"
    },
    "102": {
      id: "102",
      userId: "1",
      title: "Dentist",
      description: "Alice has a dentist appointment"
    },
    "103": {
      id: "103",
      userId: "3",
      title: "Gym Class",
      description: "Carla has a gym class scheduled"
    }
  };
  
  /**
   * Helper to completely reset all events (useful for tests)
   */
  export function resetEventStore() {
    eventStore["101"] = {
      id: "101",
      userId: "1",
      title: "Concert",
      description: "Alice is attending a concert"
    };
  
    eventStore["102"] = {
      id: "102",
      userId: "1",
      title: "Dentist",
      description: "Alice has a dentist appointment"
    };
  
    eventStore["103"] = {
      id: "103",
      userId: "3",
      title: "Gym Class",
      description: "Carla has a gym class scheduled"
    };
  }
  
  export default eventStore;
  