import { desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { favorites, wishes } from '@/db/schema';

export async function GET() {
  const db = getDb();
  const [savedRows, wishRows] = await Promise.all([
    db.select().from(favorites).orderBy(desc(favorites.createdAt)),
    db.select().from(wishes).orderBy(desc(wishes.createdAt)),
  ]);

  return Response.json({
    favorites: savedRows.map((row) => row.itemId),
    wishes: wishRows.map((row) => ({
      ...row,
      imageUrl: row.imageKey ? `/api/images/${encodeURIComponent(row.imageKey)}` : null,
    })),
  });
}
