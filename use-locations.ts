import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Define response types explicitly based on the schema if not directly inferable or for ease of use
// We rely on Zod parsing in the queryFn for runtime safety
type Location = typeof api.locations.list.responses[200] extends import("zod").ZodSchema<infer T> ? T[number] : never;
type Occupancy = typeof api.occupancy.get.responses[200] extends import("zod").ZodSchema<infer T> ? T : never;

export function useLocations() {
  return useQuery({
    queryKey: [api.locations.list.path],
    queryFn: async () => {
      const res = await fetch(api.locations.list.path);
      if (!res.ok) throw new Error("Failed to fetch locations");
      const data = await res.json();
      return api.locations.list.responses[200].parse(data);
    },
  });
}

export function useLocation(id: number | null) {
  return useQuery({
    queryKey: [api.locations.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.locations.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch location");
      const data = await res.json();
      return api.locations.get.responses[200].parse(data);
    },
  });
}

export function useOccupancy(locationId: number | null) {
  return useQuery({
    queryKey: [api.occupancy.get.path, locationId],
    enabled: !!locationId,
    refetchInterval: 5000, // Poll every 5 seconds for real-time feel
    queryFn: async () => {
      if (!locationId) return null;
      const url = buildUrl(api.occupancy.get.path, { id: locationId });
      const res = await fetch(url);
      if (res.status === 404) return null; // No occupancy data yet
      if (!res.ok) throw new Error("Failed to fetch occupancy");
      const data = await res.json();
      return api.occupancy.get.responses[200].parse(data);
    },
  });
}

export function useUpdateOccupancy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, level, percentage }: { id: number; level: string; percentage: number }) => {
      const url = buildUrl(api.occupancy.update.path, { id });
      const res = await fetch(url, {
        method: api.occupancy.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, percentage }),
      });
      if (!res.ok) throw new Error("Failed to update occupancy");
      const data = await res.json();
      return api.occupancy.update.responses[200].parse(data);
    },
    onSuccess: (_, variables) => {
      const url = buildUrl(api.occupancy.get.path, { id: variables.id });
      queryClient.invalidateQueries({ queryKey: [url] });
      queryClient.invalidateQueries({ queryKey: [api.locations.list.path] }); // If list shows occupancy summaries
    },
  });
}
