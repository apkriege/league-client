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

const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;

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
          label: "Decisive swing",
          value: `Hole ${dashboard.decisiveSwing.hole}`,
          detail: `${dashboard.decisiveSwing.winner} gained ${dashboard.decisiveSwing.strokes} net ${dashboard.decisiveSwing.strokes === 1 ? "stroke" : "strokes"} on ${dashboard.decisiveSwing.runnerUp}.`,
          tone: "text-emerald-600",
        }
      : null,
    dashboard.hardestHole
      ? {
          icon: AlertTriangle,
          label: "Field test",
          value: `Hole ${dashboard.hardestHole.hole}`,
          detail: `${signed(dashboard.hardestHole.averageGrossToPar)} average gross to par made it the hardest hole.`,
          tone: "text-amber-600",
        }
      : null,
    dashboard.opportunityHole
      ? {
          icon: Sparkles,
          label: "Green light",
          value: `Hole ${dashboard.opportunityHole.hole}`,
          detail: `${dashboard.opportunityHole.birdiesOrBetter} gross red ${dashboard.opportunityHole.birdiesOrBetter === 1 ? "number was" : "numbers were"} made there.`,
          tone: "text-violet-600",
        }
      : null,
    dashboard.chaosHole
      ? {
          icon: Flame,
          label: "Chaos hole",
          value: `Hole ${dashboard.chaosHole.hole}`,
          detail: `A ${dashboard.chaosHole.grossRange}-stroke field range created the widest split.`,
          tone: "text-orange-600",
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
        {!story ? (
          <EventInsightEmpty>Complete hole scores to unlock the event story.</EventInsightEmpty>
        ) : (
          <>
            <div className="border-b border-slate-100 bg-slate-950 px-5 py-5 text-white sm:px-6">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Headline</p>
              <p className="mt-2 max-w-3xl text-base font-black leading-6">{story.headline}</p>
            </div>
            <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
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
          </>
        )}
      </EventInsightSection>

      <EventInsightSection
        title="Defining holes"
        description="Where separation, opportunity, and volatility showed up"
        action={<Crosshair size={15} className="text-emerald-600" />}
      >
        {moments.length === 0 ? (
          <EventInsightEmpty>Hole-by-hole scores unlock the defining moments.</EventInsightEmpty>
        ) : (
          <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-4">
            {moments.map((moment) => {
              const Icon = moment.icon;
              return (
                <article key={moment.label} className="bg-white p-4 sm:p-5">
                  <Icon size={15} className={moment.tone} strokeWidth={2.5} />
                  <p className="mt-4 text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">{moment.label}</p>
                  <p className="mt-1 text-lg font-black text-slate-950">{moment.value}</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">{moment.detail}</p>
                </article>
              );
            })}
          </div>
        )}
      </EventInsightSection>
    </div>
  );
}
