import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // e.g., 'library', 'cafeteria', 'classroom'
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  floor: text("floor"), // e.g., '1', '2', 'Basement'
});

export const occupancy = pgTable("occupancy", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  level: text("level").notNull(), // 'low', 'moderate', 'high', 'critical'
  percentage: integer("percentage").notNull(), // 0-100
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export const insertOccupancySchema = createInsertSchema(occupancy).omit({ id: true, updatedAt: true });

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type Occupancy = typeof occupancy.$inferSelect;
export type InsertOccupancy = z.infer<typeof insertOccupancySchema>;
