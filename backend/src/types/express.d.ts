declare global {
  namespace Express {
    interface Request {
      /** Public user fields (no password), set by `authenticate`. */
      user?: {
        id: number;
        username: string | null;
        email: string;
        name: string | null;
        role: string | null;
        points: number | null;
        createdAt: Date | null;
      };
    }
  }
}

export {};
