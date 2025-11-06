// Token management actions for the Cloud Convert API

import { AppDataSource } from './database';
import { User } from '../entities/User';

/**
 * Deduct tokens from a user's balance
 * @param userId - The ID of the user
 * @param amount - The amount of tokens to deduct
 * @returns The updated user with new token balance
 */
export async function deductUserToken(userId: number, amount: number = 1): Promise<User> {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Check if user has enough tokens
  if (user.token < amount) {
    throw new Error(`Insufficient tokens. Required: ${amount}, Available: ${user.token}`);
  }

  // Deduct tokens
  user.token -= amount;

  // Save updated user
  await userRepository.save(user);

  console.log(`[TOKEN] Successfully deducted ${amount} token(s) from user ${userId}. Remaining: ${user.token}`);

  return user;
}

/**
 * Check if user has enough tokens
 * @param userId - The ID of the user
 * @param requiredTokens - Number of tokens required
 * @returns True if user has enough tokens
 */
export async function checkUserTokens(userId: number, requiredTokens: number = 1): Promise<boolean> {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    return false;
  }

  return user.token >= requiredTokens;
}

/**
 * Add tokens to a user's balance (for refunds or admin actions)
 * @param userId - The ID of the user
 * @param amount - The amount of tokens to add
 * @returns The updated user with new token balance
 */
export async function addUserTokens(userId: number, amount: number): Promise<User> {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Add tokens
  user.token += amount;

  // Save updated user
  await userRepository.save(user);

  console.log(`[TOKEN] Successfully added ${amount} token(s) to user ${userId}. New balance: ${user.token}`);

  return user;
}

/**
 * Get user's current token balance
 * @param userId - The ID of the user
 * @returns Object with user's token balance
 */
export async function getUserTokenBalance(userId: number): Promise<{ balance: number; userId: number }> {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  return {
    balance: user.token,
    userId: user.id
  };
}

/**
 * Grant tokens based on subscription product
 * Called by webhook when user purchases a subscription
 * @param userId - The ID of the user
 * @param tokens - Number of tokens to grant (from product definition)
 */
export async function grantSubscriptionTokens(userId: number, tokens: number): Promise<User> {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new Error(`User with ID ${userId} not found`);
  }

  // Set token balance to subscription level (not additive, replaces previous)
  user.token = tokens;

  // Save updated user
  await userRepository.save(user);

  console.log(`[TOKENS] Granted ${tokens} tokens to user ${userId} from subscription`);

  return user;
}
