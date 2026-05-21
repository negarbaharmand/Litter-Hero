import { users } from './schema.js';

/** Drizzle column map for API responses — never includes `password`. */
export const publicUserColumns = {
  id: users.id,
  username: users.username,
  email: users.email,
  name: users.name,
  role: users.role,
  points: users.points,
  createdAt: users.createdAt,
} as const;
