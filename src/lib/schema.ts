import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, pgEnum, decimal, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const articleStatusEnum = pgEnum("article_status", ["draft", "published", "archived"]);

export const newsroomTopics = pgTable("newsroom_topics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  promptTemplate: text("prompt_template").notNull(),
  category: text("category").notNull(),
  active: boolean("active").notNull().default(true),
  priority: integer("priority").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsroomSettings = pgTable("newsroom_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  articlesPerDay: integer("articles_per_day").notNull().default(3),
  autoPublish: boolean("auto_publish").notNull().default(false),
  defaultWordCount: integer("default_word_count").notNull().default(1200),
  generateImages: boolean("generate_images").notNull().default(true),
  imageStyle: text("image_style").notNull().default("medical illustration, clean, professional, modern"),
  aiModel: text("ai_model").notNull().default("claude-sonnet-4-5-20250514"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsroomArticles = pgTable("newsroom_articles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  section: text("section").notNull().default("news"),
  author: text("author").notNull().default("InformedMedicine AI Newsroom"),
  readTime: integer("read_time").notNull().default(5),
  views: integer("views").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  status: articleStatusEnum("status").notNull().default("draft"),
  topicId: uuid("topic_id"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  faqData: jsonb("faq_data").$type<Array<{question: string; answer: string}>>(),
  structuredData: jsonb("structured_data"),
  generatedAt: timestamp("generated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const newsroomGenerationLog = pgTable("newsroom_generation_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: uuid("topic_id"),
  articleId: uuid("article_id"),
  status: text("status").notNull(), // "success" | "failed" | "skipped"
  tokensUsed: integer("tokens_used").notNull().default(0),
  imageGenerated: boolean("image_generated").notNull().default(false),
  costEstimate: text("cost_estimate").notNull().default("0.00"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Snake_case aliases (used by API routes)
export const newsroom_topics = newsroomTopics;
export const newsroom_settings = newsroomSettings;
export const newsroom_articles = newsroomArticles;
export const newsroom_generation_log = newsroomGenerationLog;

// Snake_case aliases (used by API routes)
export const newsroom_topics = newsroomTopics;
export const newsroom_settings = newsroomSettings;
export const newsroom_articles = newsroomArticles;
export const newsroom_generation_log = newsroomGenerationLog;
// Type exports
export type NewsroomTopic = typeof newsroomTopics.$inferSelect;
export type NewNewsroomTopic = typeof newsroomTopics.$inferInsert;
export type NewsroomSettings = typeof newsroomSettings.$inferSelect;
export type NewsroomArticle = typeof newsroomArticles.$inferSelect;
export type NewNewsroomArticle = typeof newsroomArticles.$inferInsert;
export type GenerationLog = typeof newsroomGenerationLog.$inferSelect;
