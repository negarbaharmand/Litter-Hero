import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

const here = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Håll Sverige Rent API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: [
    path.resolve(here, "../routes/*.ts"),
    path.resolve(here, "../routes/*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
