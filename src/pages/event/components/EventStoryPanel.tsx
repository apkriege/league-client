import { AlertTriangle, BookOpen, Crosshair, Flame, Sparkles, Swords, TrendingUp } from "lucide-react";
import { buildEventStory } from "@/features/league-intelligence/eventStory";
import type { buildEventDashboard } from "@/features/league-intelligence/eventDashboard";
import type {
  EventInsightInput,
  EventStoryHighlightKind,
} from "@/features/league-intelligence/types";
import { EventInsightBadge, EventInsightEmpty, EventInsightSection } from "./EventInsightPrimitives";

type EventDashboard = ReturnType<typeof buildEventDashboard>;

const highlightStyle: Record<EventStoryHighlightKind, { icon: typeof Flame; tone: string; surface: string }> = {
  hot: { icon: Flame, tone: "text-orange-600", surface: "from-orange-50" },
  battle: { icon: Swords, tone: "text-blue-600", surface: "from-blue-50" },
  momentum: { icon: TrendingUp, tone: "text-emerald-600", surface: "from-emerald-50" },
  achievement: { icon: Sparkles, tone: "text-violet-600", surface: "from-violet-50" },
};

export default function EventStoryPanel({
  event,
  dashboard,
}: {
  event: EventInsightInput;
  dashboard: EventDashboard;
}) {
  const story = buildEventStory(event);
  const moments = [
    dashboard.decisiveSwing
      ? {
          icon: Crosshair,
          label: "Biggest swing",
          value: `Hole ${dashboard.decisiveSwing.hole}`,
          detail: `${dashboard.decisiveSwing.winner} gained ${dashboard.decisiveSwing.strokes} net ${dashboard.decisiveSwing.strokes === 1 ? "stroke" : "strokes"} on ${dashboard.decisiveSwing.runnerUp}.`,
          tone: "text-emerald-600",
        }
      : null,
    dashboard.mostDoubleBogeys
      ? {
          icon: AlertTriangle,
          label: "Most double bogeys",
          value: `Hole ${dashboard.mostDoubleBogeys.hole}`,
          detail: `${dashboard.mostDoubleBogeys.doublesOrWorse} of ${dashboard.mostDoubleBogeys.scores} gross scores were double bogey or worse.`,
          tone: "text-amber-600",
        }
      : null,
    dashboard.opportunityHole
      ? {
          icon: Sparkles,
          label: "Most birdies",
          value: `Hole ${dashboard.opportunityHole.hole}`,
          detail: `${dashboard.opportunityHole.birdiesOrBetter} of ${dashboard.opportunityHole.scores} gross scores were birdie or better.`,
          tone: "text-violet-600",
        }
      : null,
    dashboard.mostParOrBetter
      ? {
          icon: Crosshair,
          label: "Most pars or better",
          value: `Hole ${dashboard.mostParOrBetter.hole}`,
          detail: `${Math.round(dashboard.mostParOrBetter.parOrBetter / dashboard.mostParOrBetter.scores * 100)}% at gross par or better (${dashboard.mostParOrBetter.parOrBetter} of ${dashboard.mostParOrBetter.scores}).`,
          tone: "text-emerald-600",
        }
      : null,
  ].filter((moment): moment is NonNullable<typeof moment> => moment != null);

  return (
    <div className="space-y-4">
      <EventInsightSection
        title="The round in 30 seconds"
        description="The result, the pressure, and the moments that shaped the event"
        action={<EventInsightBadge><BookOpen size={10} /> Post-round story</EventInsightBadge>}
      >
        {!story || story.highlights.length === 0 ? (
          <EventInsightEmpty>Complete hole scores to unlock the event story.</EventInsightEmpty>
        ) : (
            <div className="grid gap-px bg-slate-100 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
              {story.highlights.map((highlight) => {
                const style = highlightStyle[highlight.kind];
                const Icon = style.icon;
                return (
                  <article key={`${highlight.kind}-${highlight.title}`} className={`bg-linear-to-br ${style.surface} to-white p-4 sm:p-5`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className={`flex items-center gap-2 ${style.tone}`}>
                        <Icon size={14} strokeWidth={2.5} />
                        <p className="text-[9px] font-black uppercase tracking-[0.12em]">{highlight.label}</p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-[8px] font-bold text-slate-600">
                        {highlight.stat}
                      </span>
                    </div>
                    <h4 className="mt-3 text-[13px] font-black leading-5 text-slate-900">{highlight.title}</h4>
                    <p className="mt-1 text-[10px] leading-4 text-slate-500">{highlight.detail}</p>
                  </article>
                );
              })}
            </div>
        )}
      </EventInsightSection>

      <EventInsightSection
        title="Defining holes"
        description="Where players gained strokes, scored well, or ran into trouble"
        action={<Crosshair size={15} className="text-emerald-600" />}
      >
        {moments.length === 0 ? (
          <EventInsightEmpty>Hole-by-hole scores unlock the defining moments.</EventInsightEmpty>
        ) : (
          <div className="grid gap-px bg-slate-100 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {moments.map((moment) => {
              const Icon = moment.icon;
              return (
                <article key={moment.label} className="bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={`shrink-0 ${moment.tone}`} strokeWidth={2.5} />
                    <p className="text-[9px] font-black uppercase tracking-wide text-slate-400">{moment.label}</p>
                    <p className="ml-auto shrink-0 text-xs font-black text-slate-950">{moment.value}</p>
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-slate-500">{moment.detail}</p>
                </article>
              );
            })}
          </div>
        )}
      </EventInsightSection>
    </div>
  );
}
