type EventRouteSegment = {
  position?: number;
  course?: { name?: string | null } | null;
  tee?: { name?: string | null } | null;
};

type RouteEvent = {
  course?: { name?: string | null } | null;
  tee?: { name?: string | null } | null;
  routeSegments?: EventRouteSegment[] | null;
  routeSnapshot?: { version?: number; segments?: EventRouteSegment[] } | null;
};

const orderedSegments = (event: RouteEvent) => {
  const snapshotSegments =
    event.routeSnapshot?.version === 1 && Array.isArray(event.routeSnapshot.segments)
      ? event.routeSnapshot.segments
      : null;
  const segments = snapshotSegments ?? event.routeSegments;
  return Array.isArray(segments)
    ? [...segments].sort(
        (left, right) => Number(left.position || 0) - Number(right.position || 0),
      )
    : [];
};

export const getEventRouteLabel = (event: RouteEvent) => {
  const names = orderedSegments(event)
    .map((segment) => String(segment.course?.name || "").trim())
    .filter(Boolean);
  return names.length > 0 ? names.join(" → ") : String(event.course?.name || "");
};

export const getEventRouteTeeLabel = (event: RouteEvent) => {
  const names = orderedSegments(event)
    .map((segment) => String(segment.tee?.name || "").trim())
    .filter(Boolean);
  if (names.length === 0) return String(event.tee?.name || "");
  return names.every((name) => name === names[0]) ? names[0] : names.join(" → ");
};
