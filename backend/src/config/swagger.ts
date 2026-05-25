import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

const here = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Håll Sverige Rent API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000" }],
    // Default: JWT required. Public routes override with `security: []` in their JSDoc.
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Register and login (JWT)" },
      { name: "Users", description: "User profiles and leaderboard (JWT required)" },
      { name: "Reports", description: "Litter reports" },
      { name: "Health", description: "Service checks" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT from POST /api/auth/login or POST /api/auth/register",
        },
      },
      schemas: {
        ErrorMessage: {
          type: "object",
          properties: {
            error: { type: "string", description: "Human-readable error" },
          },
          required: ["error"],
        },
        UserPublic: {
          type: "object",
          properties: {
            id: { type: "integer" },
            username: { type: "string", nullable: true },
            email: { type: "string", format: "email" },
            name: { type: "string", nullable: true },
            role: { type: "string", nullable: true },
            points: { type: "integer", nullable: true },
            createdAt: { type: "string", format: "date-time", nullable: true },
            reportsCreated: { type: "integer", nullable: true },
            cleanupsApproved: { type: "integer", nullable: true },
            verificationVotes: { type: "integer", nullable: true },
          },
          required: ["id", "email"],
        },
        UsersPaginatedResponse: {
          type: "object",
          properties: {
            users: {
              type: "array",
              items: { $ref: "#/components/schemas/UserPublic" },
            },
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
          },
          required: ["users", "page", "limit", "total"],
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT valid for 7 days",
            },
            user: { $ref: "#/components/schemas/UserPublic" },
          },
          required: ["token", "user"],
        },
        Report: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            imageUrl: { type: "string", nullable: true },
            location: { type: "string" },
            latitude: { type: "number", nullable: true },
            longitude: { type: "number", nullable: true },
            description: { type: "string", nullable: true },
            size: { type: "string", nullable: true },
            status: {
              type: "string",
              enum: ["pending", "verified", "disputed", "cleaned", "rejected", "open", "cleanup_pending_vote"],
            },
            cleanedByUserId: { type: "integer", nullable: true },
            cleanedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time", nullable: true },
            pendingSubmissionsCount: { type: "integer", description: "Number of pending cleanup submissions awaiting community votes" },
            topPendingVoteCount: { type: "integer", description: "Highest vote count reached on any single pending submission (max possible: 3)" },
          },
          required: ["id", "userId", "location"],
        },
        CleanupSubmission: {
          type: "object",
          properties: {
            id: { type: "integer" },
            reportId: { type: "integer" },
            userId: { type: "integer" },
            imageUrl: { type: "string" },
            note: { type: "string", nullable: true },
            status: { type: "string", enum: ["pending", "approved", "rejected", "expired"] },
            createdAt: { type: "string", format: "date-time", nullable: true },
            resolvedAt: { type: "string", format: "date-time", nullable: true },
          },
          required: ["id", "reportId", "userId", "imageUrl", "status"],
        },
        VoteSummary: {
          type: "object",
          properties: {
            totalVotes: { type: "integer" },
            cleanVotes: { type: "integer" },
            notCleanVotes: { type: "integer" },
            myVote: {
              type: "string",
              enum: ["clean", "not_clean"],
              nullable: true,
            },
          },
          required: ["totalVotes", "cleanVotes", "notCleanVotes", "myVote"],
        },
        CleanupSubmissionWithVotes: {
          allOf: [
            { $ref: "#/components/schemas/CleanupSubmission" },
            {
              type: "object",
              properties: {
                voteSummary: { $ref: "#/components/schemas/VoteSummary" },
              },
              required: ["voteSummary"],
            },
          ],
        },
        ReportDetails: {
          allOf: [
            { $ref: "#/components/schemas/Report" },
            {
              type: "object",
              properties: {
                winningSubmission: {
                  oneOf: [
                    { $ref: "#/components/schemas/CleanupSubmission" },
                    { type: "null" },
                  ],
                },
                cleanupSubmissions: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CleanupSubmissionWithVotes" },
                },
              },
              required: ["winningSubmission", "cleanupSubmissions"],
            },
          ],
        },
        ConfigTestResponse: {
          type: "object",
          properties: {
            port: { type: "integer" },
            db_connected: { type: "boolean" },
          },
          required: ["port", "db_connected"],
        },
      },
    },
  },
  apis: [
    path.resolve(here, "../routes/*.ts"),
    path.resolve(here, "../routes/*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
