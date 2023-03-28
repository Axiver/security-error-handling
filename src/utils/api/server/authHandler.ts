import { access_tokens, refresh_tokens } from "@prisma/client";
import PrismaClient from "../../../utils/prisma";
import crypto from "crypto";

/**
 * Type declarations
 */
type ValidateTokenOptions<T> = {
  userId: string;
  token: T | null;
  checkExpiry?: boolean;
};

/**
 * Global variables
 */
export const ACCESS_TOKEN_VALIDITY = 1000 * 30; // The validity of the access token in milliseconds (2 hours)
export const REFRESH_TOKEN_VALIDITY = 1000 * 60 * 60 * 24; // The validity of the refresh token in milliseconds (1 day)
const REFRESH_TOKEN_REFRESH_THRESHOLD = 1000 * 60 * 60 * 4; // The time before the refresh token expires to refresh it in milliseconds (4 hours)

/**
 * Revokes all refresh tokens associated with the user
 * @param userId The ids of the users to revoke the tokens of
 */
const revokeRefreshTokens = async (userId: string | string[]) => {
  // Revoke all refresh tokens associated with the users
  return PrismaClient.refresh_tokens.updateMany({
    where: {
      user_id: {
        in: userId,
      },
    },
    data: {
      revoked: true,
    },
  });
};

/**
 * Revokes a refresh token
 * @param token The refresh token to revoke
 */
const revokeRefreshToken = async (token: string) => {
  // Revokes a specific refresh token
  return PrismaClient.refresh_tokens.update({
    where: {
      token: token,
    },
    data: {
      revoked: true,
    },
  });
};

/**
 * Retrieves a refresh token from the database
 * @param token The refresh token
 * @returns The refresh token if it is valid, otherwise null
 */
const retrieveRefreshToken = async (token: string) => {
  // Retrieve the refresh token from the database
  const refreshToken = await PrismaClient.refresh_tokens.findUnique({
    where: {
      token: token,
    },
  });

  return refreshToken;
};

/**
 * Retrieves an access token from the database
 * @param token The access token
 * @returns The access token if it is valid, otherwise null
 */
const retrieveAccessToken = async (token: string) => {
  // Retrieve the access token from the database
  const accessToken = await PrismaClient.access_tokens.findUnique({
    where: {
      token: token,
    },
  });

  return accessToken;
};

/**
 * Validates both the access token and the refresh token
 * @param userId The id of the user making the request
 * @param token The token to validate
 * @returns The token if the token is valid, otherwise throws an error
 */
const validateToken = async <T extends refresh_tokens>({ userId, token, checkExpiry }: ValidateTokenOptions<T>) => {
  console.log({ userId, token });

  // Check if the token exists in the database
  if (!token) {
    // The token does not exist in the database, this might be an attack
    // Revoke all tokens associated with the user
    await revokeRefreshTokens(userId);

    throw "invalid token";
  }

  // Check if the token is for the user making the request
  if (token.user_id !== userId) {
    // It is not, this might be an attack
    // Revoke all tokens associated with both users
    await revokeRefreshTokens(userId);
    await revokeRefreshTokens(token.user_id);

    throw "invalid token";
  }

  // Check if the token has expired (if required)
  if (checkExpiry && token.expires_at < new Date()) {
    // The token has expired, revoke it
    await revokeRefreshToken(token.token);

    throw "token expired";
  }

  // Check if the token has been revoked
  if (token.revoked) {
    // The token has been revoked, but it was still used in the request
    // This might be an attack, so we should revoke all refresh tokens associated with the user
    await revokeRefreshTokens(userId);

    throw "invalid token";
  }

  // The token is valid
  return token;
};

/**
 * Validates the refresh token
 * @param userId The id of the user
 * @param token The refresh token
 * @returns The refresh token if it is valid, otherwise throws an error
 */
const validateRefreshToken = async (userId: string, token: string) => {
  // Retrieve the refresh token from the database
  const refreshToken = await retrieveRefreshToken(token);

  // Validate the refresh token
  return validateToken({
    userId,
    token: refreshToken,
    checkExpiry: true,
  });
};

/**
 * Validates the access token
 * @param userId The id of the user
 * @param token The access token
 * @returns The access token if it is valid, otherwise throws an error
 */
const validateAccessToken = async (userId: string, token: string) => {
  // Retrieve the access token from the database
  const accessToken = await retrieveAccessToken(token);

  // Validate the access token
  return validateToken({
    userId,
    token: accessToken,
  });
};

/**
 * Generates a new token string, compliant with RFC 6750
 */
const generateToken = () => {
  // Generate a random token
  const token = crypto.randomBytes(32).toString("hex");

  // Return the token
  return token;
};

/**
 * Generates a new access token and saves it to the database
 * @param userId The id of the user
 * @param refreshToken The refresh token to generate the access token with
 * @returns The new access token
 */
const generateAccessToken = async (userId: string, refreshToken: refresh_tokens) => {
  // Generate a new access token
  const newAccessToken = generateToken();

  // Calculate the expiry of the access token
  const expiry = new Date(new Date().getTime() + ACCESS_TOKEN_VALIDITY);

  // Save the new access token to the database
  await PrismaClient.access_tokens.create({
    data: {
      token: newAccessToken,
      user_id: userId,
      expires_at: expiry,
      revoked: false,
      refresh_token: refreshToken.id,
    },
  });

  // Return the new access token
  return {
    token: newAccessToken,
    expiry,
  };
};

/**
 * Generates a new refresh token and saves it to the database
 * @param userId The id of the user
 * @returns The new refresh token
 */
const generateRefreshToken = async (userId: string) => {
  // The refresh token needs to be refreshed, generate a new one
  const generatedToken = generateToken();

  // Save the new refresh token to the database
  const newRefreshToken = await PrismaClient.refresh_tokens.create({
    data: {
      token: generatedToken,
      user_id: userId,
      expires_at: new Date(new Date().getTime() + REFRESH_TOKEN_VALIDITY),
      revoked: false,
    },
  });

  return newRefreshToken;
};

/**
 * Generates a new refresh token and saves it to the database (if necessary)
 * @param userId The id of the user
 * @param $refreshToken The old refresh token
 * @returns New refresh token
 */
const refreshRefreshToken = async (userId: string, $refreshToken: string) => {
  // Validate the refresh token
  const refreshToken = await validateRefreshToken(userId, $refreshToken);

  // Refresh token is currently valid, check if it needs to be refreshed
  if (refreshToken.expires_at.getTime() - new Date().getTime() < REFRESH_TOKEN_REFRESH_THRESHOLD) {
    // Generate a new refresh token
    const newRefreshToken = generateRefreshToken(userId);

    // Invalidate old refresh token and all its associated access tokens
    await revokeRefreshToken(refreshToken.token);

    // Return the new refresh token
    return newRefreshToken;
  }

  // The refresh token need not be refreshed, return the old one
  return refreshToken;
};

/**
 * Generates a new access token with the refresh token
 */
const refreshAccessToken = async (userId: string, $accessToken: string, $refreshToken: string) => {
  // Validate the access token
  const accessToken = await validateAccessToken(userId, $accessToken);

  // Both the access token and the refresh token are valid, refresh the refresh token if necessary
  const refreshToken = await refreshRefreshToken(userId, $refreshToken);

  console.log({ accessToken, refreshToken });

  // Check that the access token is generated by the provided refresh token
  if (accessToken.refresh_token !== refreshToken.id) {
    // It was not, this might be an attack
    // Revoke all the user's refresh tokens
    await revokeRefreshTokens(userId);
    throw "invalid token";
  }

  // Generate a new access token
  const newAccessToken = await generateAccessToken(userId, refreshToken);

  // Prepare the result object
  const result = {
    accessToken: newAccessToken.token,
    accessTokenExpires: newAccessToken.expiry.getTime(),
    refreshToken: refreshToken.token,
  };

  console.log("new access token issued at: " + new Date().toISOString());
  console.log("access token time to expiry: " + (newAccessToken.expiry.getTime() - new Date().getTime()) / 1000 + "s");

  return result;
};

/**
 * Generates both access and refresh tokens for a user on initial login
 * @param userId The id of the user
 */
const requestTokens = async (userId: string) => {
  // Generate a new refresh token
  const refreshToken = await generateRefreshToken(userId);

  // Generate a new access token
  const accessToken = await generateAccessToken(userId, refreshToken);

  // Prepare the result object
  const result = {
    accessToken: accessToken.token,
    accessTokenExpires: accessToken.expiry.getTime(),
    refreshToken: refreshToken.token,
  };

  return result;
};

export default {
  refreshAccessToken,
  refreshRefreshToken,
  requestTokens,
};
