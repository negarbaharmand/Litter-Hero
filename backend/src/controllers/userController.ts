import type { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, reports } from '../db/schema.js';
import { eq, desc, gte, and } from 'drizzle-orm'; 
import type { AuthRequest } from '../middleware/authMiddleware.js';


export const getUser = async (req: Request, res: Response) => {
  try {
    const idValue = req.query.id ?? req.query.userId;
    const emailValue = req.query.email;

    const id = typeof idValue === 'string' ? Number(idValue) : undefined;
    const email = typeof emailValue === 'string' ? emailValue : undefined;

    if (!id && !email) {
      return res.status(400).json({ error: 'Provide id, userId, or email' });
    }

    const [user] = id
      ? await db.select().from(users).where(eq(users.id, id)).limit(1)
      : await db.select().from(users).where(eq(users.email, email!)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// getMe endpoint to get the currently logged in user based on the userId stored in the session
//it also includes the calculation of weekly points based on the reports created in the last 7 days,
//  and returns that along with the user data.
export const getMe = async (req: AuthRequest, res: Response) => { // Now from AuthRequest instead of Request
  try {
    const userId = req.userId; // Now from token via authMiddleware

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate weekly points based on reports created in the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyReports = await db
      .select()
      .from(reports)
      .where(and(
        eq(reports.userId, userId),
        gte(reports.createdAt, oneWeekAgo)
      ));
      // Only reports from the last 7 days
      // gte = greater than or equal to
      

    const weeklyPoints = weeklyReports.length * 10; // 10 points per report

    const { password: _, ...userWithoutPassword } = user;
    //Badge Logic based on points
    const badges: string[] = []
    const reportCount = (user.points ?? 0) /10 //Calculate report count from points (if points are null, use 0 instead)

    if (reportCount >= 1) badges.push('First Report');
    if (reportCount >= 5) badges.push(' 5 Cleanups');
    if (reportCount >= 10) badges.push('10 Cleanups');
    if (reportCount >= 50) badges.push('50 Cleanups')
    res.json({
      ...userWithoutPassword,
      weeklyPoints, // adds weeklypoints in response.
      badges
    });

  } catch (error) {
    console.error('Error fetching me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const rawLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 10;
    const limit = rawLimit === 20 ? 20 : 10;

    const leaderboard = await db.select().from(users).orderBy(desc(users.points)).limit(limit);
    const leaderboardwithoutPassword = leaderboard.map(user => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
   });
    res.json(leaderboardwithoutPassword);
  }
  catch (error){
     console.error('Error fetching leaderboard')
     res.status(500).json({ error: 'Internal server error '})
  }

  
    
}
