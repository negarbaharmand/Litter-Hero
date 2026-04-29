# Grupp 2


## Notes från Alexander
Följande filer behövs för att sätta upp utvecklarnas miljö, ta inte bort dom.

- .dockerignore
- .Dockerfile 
- docker-compose.yml 
- scripts/

### Gitignore kan ni uppdaterar så ni önskar 

### .env.example kan ni kopiera till .env och fylla i era egna variabler. Ni kan även fylla på med andra nödvändiga variabler.

## API Documentation (Swagger)

The backend uses Swagger UI to document all API endpoints.

### Viewing the docs

1. Start the backend dev server:
   ```bash
   cd backend
   npm run dev
   ```
2. Open your browser and go to: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

You will see an interactive list of all available endpoints where you can read descriptions and test requests directly in the browser.

---

### Adding docs for new endpoints

When you create a new route, you **must** add a `@swagger` JSDoc comment block directly above the route definition in the relevant file inside `backend/src/routes/`.

**Template to copy:**

```typescript
/**
 * @swagger
 * /api/your-path:
 *   post:
 *     summary: Short description of what this endpoint does
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field1, field2]
 *             properties:
 *               field1:
 *                 type: string
 *               field2:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Success message
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/your-path', yourController);
```

- Change `post` to `get`, `put`, or `delete` depending on the HTTP method.
- For `GET` endpoints, replace `requestBody` with `parameters` (see existing examples in `userRoutes.ts`).
- The path in `@swagger` must be the **full path** (e.g. `/api/reports`), not the relative router path.


