import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { wishes } from '@/db/schema';

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const title = String(form.get('title') ?? '').trim();
  const area = String(form.get('area') ?? '').trim();
  const category = String(form.get('category') ?? '').trim();
  const note = String(form.get('note') ?? '').trim();
  const image = form.get('image');

  if (!title || !area || !['景点', '美食'].includes(category)) {
    return Response.json({ error: '请填写地点、区域和分类' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  let imageKey: string | null = null;
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith('image/') || image.size > MAX_IMAGE_BYTES) {
      return Response.json({ error: '请选择 6MB 以内的图片' }, { status: 400 });
    }
    imageKey = `${id}-${image.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    await env.FILES.put(imageKey, await image.arrayBuffer(), {
      httpMetadata: { contentType: image.type },
    });
  }

  const row = { id, title, area, category, note, imageKey, createdAt: Date.now() };
  await getDb().insert(wishes).values(row);
  return Response.json({ ...row, imageUrl: imageKey ? `/api/images/${encodeURIComponent(imageKey)}` : null });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return Response.json({ error: '缺少心愿编号' }, { status: 400 });
  const db = getDb();
  const [row] = await db.select().from(wishes).where(eq(wishes.id, id));
  if (row?.imageKey) await env.FILES.delete(row.imageKey);
  await db.delete(wishes).where(eq(wishes.id, id));
  return Response.json({ id });
}
