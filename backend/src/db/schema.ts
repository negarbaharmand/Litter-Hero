import { pgTable, serial, varchar, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', ['pending', 'verified', 'disputed', 'cleaned', 'rejected']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  name: varchar('name', { length: 100 }),
  role: varchar('role', { length: 50 }).default('user'),
  points: integer('points').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  location: varchar('location', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  size: varchar('size', { length: 50 }), // e.g., small, medium, large
  status: statusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// This helps Drizzle understand the "One-to-Many" relationship
export const usersRelations = relations(users, ({ many }) => ({
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  author: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));