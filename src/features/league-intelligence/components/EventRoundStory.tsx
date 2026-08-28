import { BookOpen, Flame, Sparkles, Swords, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";
import type { EventRoundStory, EventStoryHighlightKind } from "../types";

const highlightStyles: Record<
  EventStoryHighlightKind,
  { icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>; tone: string }
> = {
  hot: { icon: Flame, tone: "text-amber-300" },
  battle: { icon: Swords, tone: "text-blue-200" },
  momentum: { icon: TrendingUp, tone: "text-emerald-300" },
  achievement: { icon: Sparkles, tone: "text-violet-300" },
};

export default function EventRoundStory({ story }: { story: EventRoundStory }) {
  return (
    <div className="relative border-t border-white/10" aria-labelledby="round-story-heading">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-emerald-300">
            <BookOpen size={15} strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Post-round story
            </p>
            <h3 id="round-story-heading" className="mt-0.5 text-sm font-black text-white">
              How the round unfolded
            </h3>
            <p className="mt-0.5 max-w-2xl text-[10px] leading-4 text-slate-400">
              {story.headline}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold text-slate-400">
          {story.highlights.length} defining moments
        </span>
      </div>

      <div className="grid gap-px border-t border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {story.highlights.map((highlight) => {
          const style = highlightStyles[highlight.kind];
          const Icon = style.icon;
          return (
            <article
              key={`${highlight.kind}-${highlight.title}`}
              className="bg-slate-950/70 px-5 py-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className={`flex items-center gap-2 ${style.tone}`}>
                  <Icon size={14} strokeWidth={2.5} />
                  <p className="text-[9px] font-black uppercase tracking-[0.12em]">
                    {highlight.label}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white/[0.07] px-2 py-1 text-[8px] font-bold tabular-nums text-slate-300 ring-1 ring-white/10">
                  {highlight.stat}
                </span>
              </div>
              <h4 className="mt-3 text-[13px] font-black leading-5 text-white">
                {highlight.title}
              </h4>
              <p className="mt-1 text-[10px] leading-4 text-slate-400">{highlight.detail}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
