import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const favorites = sqliteTable('favorites', {
  itemId: text('item_id').primaryKey(),
  createdAt: integer('created_at').notNull(),
});

export const wishes = sqliteTable('wishes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  area: text('area').notNull(),
  category: text('category').notNull(),
  note: text('note').notNull().default(''),
  imageKey: text('image_key'),
  createdAt: integer('created_at').notNull(),
});
