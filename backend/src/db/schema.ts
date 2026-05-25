import { pgTable, serial, varchar, integer, timestamp, pgEnum, real, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('status', [
  'pending',
  'verified',
  'disputed',
  'cleaned',
  'rejected',
  'open',
  'cleanup_pending_vote',
]);
export const cleanupSubmissionStatusEnum = pgEnum('cleanup_submission_status', [
  'pending',
  'approved',
  'rejected',
  'expired',
]);
export const cleanupVoteEnum = pgEnum('cleanup_vote', ['clean', 'not_clean']);

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
  latitude: real('latitude'),
  longitude: real('longitude'),
  description: varchar('description', { length: 1000 }),
  size: varchar('size', { length: 50 }), // e.g., small, medium, large
  imageSizeBytes: integer('image_size_bytes'),
  rejectionReason: varchar('rejection_reason', { length: 500 }),
  status: statusEnum('status').default('open').notNull(),
  cleanedByUserId: integer('cleaned_by_user_id').references(() => users.id),
  cleanedAt: timestamp('cleaned_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cleanupSubmissions = pgTable(
  'cleanup_submissions',
  {
    id: serial('id').primaryKey(),
    reportId: integer('report_id')
      .references(() => reports.id)
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    imageUrl: varchar('image_url', { length: 500 }).notNull(),
    note: varchar('note', { length: 1000 }),
    status: cleanupSubmissionStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    resolvedAt: timestamp('resolved_at'),
  },
  (table) => ({
    uniqueSubmitterPerReportIdx: uniqueIndex('cleanup_submissions_report_user_idx').on(
      table.reportId,
      table.userId
    ),
  })
);

export const cleanupSubmissionVotes = pgTable(
  'cleanup_submission_votes',
  {
    id: serial('id').primaryKey(),
    submissionId: integer('submission_id')
      .references(() => cleanupSubmissions.id)
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    vote: cleanupVoteEnum('vote').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    uniqueVotePerSubmissionIdx: uniqueIndex('cleanup_submission_votes_submission_user_idx').on(
      table.submissionId,
      table.userId
    ),
  })
);

// This helps Drizzle understand the "One-to-Many" relationship
export const usersRelations = relations(users, ({ many }) => ({
  reports: many(reports),
  cleanupSubmissions: many(cleanupSubmissions),
  cleanupSubmissionVotes: many(cleanupSubmissionVotes),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  author: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  cleaner: one(users, {
    fields: [reports.cleanedByUserId],
    references: [users.id],
  }),
  cleanupSubmissions: many(cleanupSubmissions),
}));

export const cleanupSubmissionsRelations = relations(cleanupSubmissions, ({ one, many }) => ({
  report: one(reports, {
    fields: [cleanupSubmissions.reportId],
    references: [reports.id],
  }),
  submitter: one(users, {
    fields: [cleanupSubmissions.userId],
    references: [users.id],
  }),
  votes: many(cleanupSubmissionVotes),
}));

export const cleanupSubmissionVotesRelations = relations(cleanupSubmissionVotes, ({ one }) => ({
  submission: one(cleanupSubmissions, {
    fields: [cleanupSubmissionVotes.submissionId],
    references: [cleanupSubmissions.id],
  }),
  voter: one(users, {
    fields: [cleanupSubmissionVotes.userId],
    references: [users.id],
  }),
}));
