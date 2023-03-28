import axios from "axios";
import { getSession } from "next-auth/react";

//-- Global Variables --//
const maxRetries = 1; // The total number of times axios will retry a request
let currRetries = 0; // The current number of times axios has retried a request

// Create axios client
const client = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Attach an error handler as a response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("error intercepted");
    console.log("we have an error:", { error });
    // Check if the error was due to an invalid token
    if (error.response.status === 501) {
      // Refresh the token
      getSession();

      // Retry the request (if we didn't already)
      if (currRetries < maxRetries) {
        currRetries++;
        return axios.request(error.config);
      }
    }

    // whatever you want to do with the error
    throw error;
  }
);

// Export axios client
export default client;
