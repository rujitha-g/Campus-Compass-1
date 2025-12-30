import { db } from "./db";
import {
  locations, occupancy,
  type Location, type InsertLocation,
  type Occupancy, type InsertOccupancy
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  getOccupancy(locationId: number): Promise<Occupancy | undefined>;
  updateOccupancy(locationId: number, data: Partial<InsertOccupancy>): Promise<Occupancy>;
}

export class DatabaseStorage implements IStorage {
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }

  async getOccupancy(locationId: number): Promise<Occupancy | undefined> {
    const [record] = await db.select().from(occupancy).where(eq(occupancy.locationId, locationId));
    return record;
  }

  async updateOccupancy(locationId: number, data: Partial<InsertOccupancy>): Promise<Occupancy> {
    // Check if exists first
    const existing = await this.getOccupancy(locationId);
    
    if (existing) {
      const [updated] = await db
        .update(occupancy)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(occupancy.locationId, locationId))
        .returning();
      return updated;
    } else {
      // Create initial occupancy record if it doesn't exist
      // We need 'level' and 'percentage' to be present if creating new
      if (!data.level || data.percentage === undefined) {
         throw new Error("Cannot create occupancy without level and percentage");
      }
      
      const [created] = await db.insert(occupancy).values({
        locationId,
        level: data.level,
        percentage: data.percentage,
      }).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
