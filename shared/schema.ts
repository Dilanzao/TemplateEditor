import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Variable format schema
export const variableFormatSchema = z.object({
  fontFamily: z.string().default('Arial'),
  fontSize: z.number().default(12),
  fontWeight: z.string().optional(),
  fontStyle: z.string().optional(),
  textDecoration: z.string().optional(),
  textAlign: z.string().optional(),
  color: z.string().default('#000000'),
});

export type VariableFormat = z.infer<typeof variableFormatSchema>;

// Variable schema
export const variableSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  value: z.string().min(1, "Value is required"),
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  format: variableFormatSchema,
});

export type Variable = z.infer<typeof variableSchema>;

// Template schema
export const templateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().default("Untitled Document"),
  pageSize: z.string().default("a4"),
  backgroundImage: z.string().optional(),
  showBackgroundInOutput: z.boolean().default(true),
  variables: z.array(variableSchema).default([]),
});

export type Template = z.infer<typeof templateSchema>;

// Database schema
export const templates = pgTable("templates", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  pageSize: text("page_size").notNull(),
  backgroundImage: text("background_image"),
  showBackgroundInOutput: boolean("show_background_in_output").notNull().default(true),
  variables: jsonb("variables").notNull().default([]),
  userId: text("user_id").notNull(), // For future auth implementation
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type TemplateDB = typeof templates.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
