import { AuthError } from "@/errors/AuthError";
import axios from "axios";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

//-- Global Variables --//
const maxRetries = 1; // The total number of times axios will retry a request
let currRetries = 0; // The current number of times axios has retried a request

let tokenRefreshPromise: Promise<Session | null> | null; // Holds the promise for the token refresh

// Create axios client
const client = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Attach an error handler as a response interceptor
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("error intercepted");
    console.log("we have an error:", { error: error.response.data });
    // Check if the error was due to an invalid token
    if (error.response.status === AuthError.status) {
      // Refresh the token
      console.log("attempting to refresh token");

      // Check if the token is already being refreshed
      if (!tokenRefreshPromise) {
        // It is not being refreshed, refresh it
        console.log("refreshing token");
        tokenRefreshPromise = getSession();
      } else {
        console.log("token is already being refreshed");
      }

      // Wait for the token to be refreshed
      const token = await tokenRefreshPromise;

      // Clear the token refresh promise
      tokenRefreshPromise = null;

      console.log("token refreshed: ", token);

      // Retry the request (if we didn't already)
      if (currRetries < maxRetries) {
        currRetries++;
        return axios.request(error.config);
      }

      // We have already hit the max number of retries, the user is no longer authenticated
      // Proceed to throw the error
    }

    // whatever you want to do with the error
    // throw error;
  }
);

// Export axios client
export default client;
