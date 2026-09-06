import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { favorites } from '@/db/schema';

export async function POST(request: Request) {
  const input = (await request.json()) as { itemId?: unknown; saved?: unknown };
  if (typeof input.itemId !== 'string' || typeof input.saved !== 'boolean') {
    return Response.json({ error: '收藏信息不完整' }, { status: 400 });
  }

  const db = getDb();
  if (input.saved) {
    await db.insert(favorites).values({ itemId: input.itemId, createdAt: Date.now() }).onConflictDoNothing();
  } else {
    await db.delete(favorites).where(eq(favorites.itemId, input.itemId));
  }

  return Response.json({ itemId: input.itemId, saved: input.saved });
}
