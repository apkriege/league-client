import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLeague,
  updateLeague,
  deleteLeague,
  createLeagueEvent,
  submitEventScores,
  createLeagueEvents,
} from ".";
import type { League } from "@/types/league";

/**
 * Create a new league
 */
export const useCreateLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return await createLeague(data);
    },
    onSuccess: () => {
      // Invalidate the leagues list query to refetch
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
    },
    onError: (error) => {
      console.error("Failed to create league:", error);
    },
  });
};

/**
 * Update an existing league
 */
export const useUpdateLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<League> }) => {
      return await updateLeague(id, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific league query
      queryClient.invalidateQueries({ queryKey: ["league", variables.id] });
      // Invalidate the leagues list
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
    },
    onError: (error) => {
      console.error("Failed to update league:", error);
    },
  });
};

/**
 * Delete a league
 */
export const useDeleteLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteLeague(id);
    },
    onSuccess: (_, id) => {
      // Invalidate the specific league query
      queryClient.invalidateQueries({ queryKey: ["league", id] });
      // Invalidate the leagues list
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
    },
    onError: (error) => {
      console.error("Failed to delete league:", error);
    },
  });
};

// ============================================
// Events
export const useCreateLeagueEvent = (onSuccess: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leagueId, data }: { leagueId: number; data: any }) => {
      return await createLeagueEvent(leagueId, data);
    },
    onSuccess: (_, variables) => {
      // "league", leagueId, "events"
      queryClient.invalidateQueries({ queryKey: ["league", variables.leagueId, "events"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
    },
  });
};

export const useCreateLeagueEvents = (onSuccess: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leagueId, events }: { leagueId: number; events: any[] }) => {
      return await createLeagueEvents(leagueId, events);
    },
    onSuccess: (_, variables) => {
      // Invalidate the events list for the league
      queryClient.invalidateQueries({ queryKey: ["league", variables.leagueId, "events"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error("Failed to create multiple events:", error);
    },
  });
};

// Scores
export const useSubmitEventScores = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leagueId,
      eventId,
      data,
    }: {
      leagueId: number;
      eventId: number;
      data: any;
    }) => {
      // Implement the API call to submit scores
      return await submitEventScores(leagueId, eventId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate queries related to the event scores
      queryClient.invalidateQueries({
        queryKey: ["league", variables.leagueId, "events", variables.eventId],
      });
    },
    onError: (error) => {
      console.error("Failed to submit event scores:", error);
    },
  });
};
