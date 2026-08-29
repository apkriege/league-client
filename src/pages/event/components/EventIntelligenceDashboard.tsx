import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Activity, BookOpen, Swords, Trophy } from "lucide-react";
import EventRecap from "@/features/league-intelligence/components/EventRecap";
import { buildEventDashboard } from "@/features/league-intelligence/eventDashboard";
import type { EventInsightInput } from "@/features/league-intelligence/types";
import type { SkinsDrawerContent } from "./EventSkins";
import EventMatchupsPanel from "./EventMatchupsPanel";
import EventPerformancePanel from "./EventPerformancePanel";
import EventResultsPanel from "./EventResultsPanel";
import EventStoryPanel from "./EventStoryPanel";

type EventInsightView = "results" | "story" | "performance" | "matchups";

type EventDashboardInput = EventInsightInput & {
  holes: number;
  startSide?: string;
};

const views: Array<{
  id: EventInsightView;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Trophy;
}> = [
  {
    id: "results",
    label: "Results and leaderboard",
    shortLabel: "Results",
    description: "Podium, margins and full field",
    icon: Trophy,
  },
  {
    id: "story",
    label: "How the round unfolded",
    shortLabel: "Story",
    description: "Turning points and defining holes",
    icon: BookOpen,
  },
  {
    id: "performance",
    label: "Who played well",
    shortLabel: "Impact",
    description: "Awards, player impact and hole data",
    icon: Activity,
  },
  {
    id: "matchups",
    label: "Matchups and skins",
    shortLabel: "Battles",
    description: "Head-to-head drama and winning holes",
    icon: Swords,
  },
];

export default function EventIntelligenceDashboard({
  event,
  leagueId,
  onOpenSkins,
}: {
  event: EventDashboardInput;
  leagueId: number;
  onOpenSkins: (content: SkinsDrawerContent) => void;
}) {
  const [view, setView] = useState<EventInsightView>("results");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dashboard = useMemo(() => buildEventDashboard(event), [event]);
  const scores = event.metrics?.scores ?? [];
  const handleTabKeyDown = (keyboardEvent: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(keyboardEvent.key)) return;
    keyboardEvent.preventDefault();
    const nextIndex = keyboardEvent.key === "Home"
      ? 0
      : keyboardEvent.key === "End"
        ? views.length - 1
        : (index + (keyboardEvent.key === "ArrowRight" ? 1 : -1) + views.length) % views.length;
    setView(views[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section aria-label="Event intelligence" className="space-y-5">
      <EventRecap
        event={event}
        overview={{
          players: scores.length,
          grossSkins: event.metrics?.skins?.playerSkins?.length ?? 0,
          netSkins: event.metrics?.skins?.playerNetSkins?.length ?? 0,
          holes: event.holes,
          startSide: event.startSide === "back" ? "back" : "front",
        }}
      />

      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5 shadow-sm">
        <div className="grid grid-cols-4 gap-1" role="tablist" aria-label="Event intelligence views">
          {views.map((item, index) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                id={`event-intelligence-tab-${item.id}`}
                ref={(node) => { tabRefs.current[index] = node; }}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`event-intelligence-${item.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setView(item.id)}
                onKeyDown={(keyboardEvent) => handleTabKeyDown(keyboardEvent, index)}
                className={`group flex min-w-0 items-center justify-center gap-2 rounded-xl px-1.5 py-2.5 text-left transition sm:px-3 xl:justify-start xl:px-4 ${
                  active
                    ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80"
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                }`}
              >
                <Icon size={15} className={`shrink-0 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold sm:hidden">{item.shortLabel}</span>
                  <span className="hidden truncate text-[11px] font-bold sm:block">{item.label}</span>
                  <span className="hidden truncate text-[9px] text-slate-400 xl:block">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {views.map((item) => (
        <div
          key={item.id}
          id={`event-intelligence-${item.id}`}
          role="tabpanel"
          aria-labelledby={`event-intelligence-tab-${item.id}`}
          hidden={view !== item.id}
        >
          {item.id === "results" ? <EventResultsPanel event={event} /> : null}
          {item.id === "story" ? <EventStoryPanel event={event} dashboard={dashboard} /> : null}
          {item.id === "performance" ? <EventPerformancePanel dashboard={dashboard} leagueId={leagueId} /> : null}
          {item.id === "matchups" ? (
            <EventMatchupsPanel
              event={event}
              dashboard={dashboard}
              leagueId={leagueId}
              onOpenSkins={onOpenSkins}
            />
          ) : null}
        </div>
      ))}

      <p className="px-1 text-[10px] leading-4 text-slate-400">
        Awards and storylines use this event's completed hole scores. Bounce-backs require an over-par hole followed by gross par or better; closing metrics use the final three scored holes. The complete score breakdown remains below.
      </p>
    </section>
  );
}
