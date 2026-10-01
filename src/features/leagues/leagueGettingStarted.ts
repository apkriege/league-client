type SetupEvent = { id: number; type?: string; eventType?: string; status?: string; flights?: unknown[] };
export function getLeagueGettingStarted(leagueId: number, events: SetupEvent[], hasRecordedScores: boolean) {
  const active = events.filter(event => event.type !== "off" && event.eventType !== "off" && event.status !== "canceled");
  const scored = hasRecordedScores || active.some(event => event.status === "completed");
  const first = active[0];
  return {
    visible: !scored,
    hasEvent: Boolean(first),
    nextAction: !first ? { label: "Create your first event", to: `/league/${leagueId}/events/create` }
      : first.flights?.length ? { label: "Enter your first scores", to: `/league/${leagueId}/events/${first.id}/scores` }
      : { label: "Finish event setup", to: `/league/${leagueId}/events/${first.id}/edit` },
  };
}
