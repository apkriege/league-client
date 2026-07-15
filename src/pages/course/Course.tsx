import Card from "@/components/layout/Card";
import PageHeader from "@/components/layout/PageHeader";
import { useCourse } from "@api/courses/queries";
import { BookOpen, Flag, Globe, Landmark, MapPin, Phone, Route, Trees } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

export default function Course() {
  const { courseId = "" } = useParams();
  const { data: course, isLoading } = useCourse(courseId);
  const [activeTeeIndex, setActiveTeeIndex] = useState(0);

  const tees = useMemo(() => (Array.isArray(course?.tees) ? course.tees : []), [course]);
  const activeTee = tees[activeTeeIndex] ?? tees[0] ?? null;

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500">Loading course...</p>
      </Card>
    );
  }

  if (!course) {
    return (
      <Card>
        <p className="text-sm font-semibold text-gray-800">Course not found</p>
        <p className="text-xs text-gray-500 mt-1">The requested course could not be loaded.</p>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={course.name}
        subTitle={course.club?.name || course.location || "Course Details"}
        icon={<BookOpen size={14} />}
        iconText="COURSE"
      />

      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          {
            label: "Club",
            value: course.club?.name || "—",
            sub: course.club?.location || "linked club",
            icon: <Landmark size={14} className="text-primary" />,
            bg: "bg-primary/5 border-primary/10",
          },
          {
            label: "Layout",
            value: `${course.numHoles || 0} holes`,
            sub: `Par ${course.par || 0}`,
            icon: <Route size={14} className="text-emerald-500" />,
            bg: "bg-emerald-50 border-emerald-100",
          },
          {
            label: "Tees",
            value: tees.length,
            sub: "configured options",
            icon: <Flag size={14} className="text-amber-500" />,
            bg: "bg-amber-50 border-amber-100",
          },
          {
            label: "Access",
            value: formatValue(course.accessType),
            sub: course.phone || "public listing",
            icon: <Globe size={14} className="text-blue-500" />,
            bg: "bg-blue-50 border-blue-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-xs flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg border ${stat.bg}`}>{stat.icon}</div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-base font-bold text-gray-800 leading-tight truncate">
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-4 items-start">
        <div className="space-y-4">
          <Card>
            <p className="section-kicker mb-3">
              Overview
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <InfoRow icon={<Trees size={13} />} label="Club" value={course.club?.name} />
              <InfoRow icon={<MapPin size={13} />} label="Location" value={course.location} />
              <InfoRow icon={<Phone size={13} />} label="Phone" value={course.phone} />
              <InfoRow icon={<Globe size={13} />} label="Access" value={course.accessType} />
            </div>
            {course.description && (
              <div className="mt-4 rounded-xl border border-base-300 bg-base-200/30 px-4 py-3">
                <p className="section-kicker mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700 leading-6">{course.description}</p>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="section-kicker">
                Tee Decks
              </p>
              <p className="text-[11px] text-gray-400">Select a tee to inspect hole data</p>
            </div>

            {tees.length === 0 ? (
              <p className="text-sm text-gray-500">
                No tee data has been configured for this course.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {tees.map((tee: any, index: number) => (
                    <button
                      key={tee.id ?? `${tee.name}-${index}`}
                      type="button"
                      onClick={() => setActiveTeeIndex(index)}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        activeTeeIndex === index
                          ? "border-primary bg-primary/5"
                          : "border-base-300 bg-base-100 hover:bg-base-200/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{tee.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{tee.color} tee</p>
                        </div>
                        <span className="badge badge-outline badge-sm">{tee.distance}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <MiniMetric label="Par" value={tee.par} />
                        <MiniMetric
                          label="Men"
                          value={`${formatValue(tee.ratingMen)} / ${formatValue(tee.slopeMen)}`}
                        />
                        <MiniMetric
                          label="Women"
                          value={`${formatValue(tee.ratingWomen)} / ${formatValue(tee.slopeWomen)}`}
                        />
                        <MiniMetric label="Holes" value={tee.holes?.length ?? 0} />
                      </div>
                    </button>
                  ))}
                </div>

                {activeTee &&
                  (() => {
                    const holes: any[] = (activeTee.holes || [])
                      .slice()
                      .sort((a: any, b: any) => a.num - b.num);
                    const front = holes.filter((h) => h.num <= 9);
                    const back = holes.filter((h) => h.num > 9);
                    const hasBack = back.length > 0;
                    const sum = (arr: any[], key: string) =>
                      arr.reduce((s, h) => s + (Number(h[key]) || 0), 0);
                    const scoreRows = [
                      { key: "num", label: "HOLE" },
                      { key: "dis", label: "DIST" },
                      { key: "par", label: "PAR" },
                      { key: "hcp", label: "HCP" },
                    ];
                    return (
                      <div className="mt-4 rounded-xl border border-base-300 overflow-hidden">
                        <div className="px-4 py-3 border-b border-base-300 bg-base-200/60">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {activeTee.name}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {activeTee.color} tee
                              </p>
                            </div>
                            <div className="flex gap-2 text-[11px] text-gray-500">
                              <span>{formatValue(activeTee.ratingMen)} men</span>
                              <span>·</span>
                              <span>{formatValue(activeTee.ratingWomen)} women</span>
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse">
                            <tbody>
                              {scoreRows.map(({ key, label }) => {
                                const isHoleRow = key === "num";
                                const isNumeric = key === "dis" || key === "par";
                                return (
                                  <tr
                                    key={key}
                                    className={`border-b border-base-300 last:border-b-0${isHoleRow ? " bg-base-200/50" : ""}`}
                                  >
                                    <td className="sticky left-0 z-10 bg-base-200/80 px-3 py-2 font-bold text-[10px] uppercase tracking-widest text-gray-400 border-r border-base-300 whitespace-nowrap">
                                      {label}
                                    </td>
                                    {front.map((hole: any) => (
                                      <td
                                        key={hole.num}
                                        className={`px-2 py-2 text-center border-r border-base-200 min-w-[36px]${isHoleRow ? " font-bold text-gray-500" : " text-gray-700"}`}
                                      >
                                        {formatValue(hole[key])}
                                      </td>
                                    ))}
                                    <td
                                      className={`px-3 py-2 text-center font-bold border-r border-base-300 min-w-[42px]${isHoleRow ? " text-gray-500 bg-base-200/80" : " text-gray-700 bg-base-200/60"}`}
                                    >
                                      {isHoleRow ? "OUT" : isNumeric ? sum(front, key) : "—"}
                                    </td>
                                    {hasBack &&
                                      back.map((hole: any) => (
                                        <td
                                          key={hole.num}
                                          className={`px-2 py-2 text-center border-r border-base-200 min-w-[36px]${isHoleRow ? " font-bold text-gray-500" : " text-gray-700"}`}
                                        >
                                          {formatValue(hole[key])}
                                        </td>
                                      ))}
                                    {hasBack && (
                                      <td
                                        className={`px-3 py-2 text-center font-bold border-r border-base-300 min-w-[42px]${isHoleRow ? " text-gray-500 bg-base-200/80" : " text-gray-700 bg-base-200/60"}`}
                                      >
                                        {isHoleRow ? "IN" : isNumeric ? sum(back, key) : "—"}
                                      </td>
                                    )}
                                    {hasBack && (
                                      <td
                                        className={`px-3 py-2 text-center font-bold min-w-[42px]${isHoleRow ? " text-gray-900 bg-base-200/80" : " text-gray-900 bg-base-200/60"}`}
                                      >
                                        {isHoleRow ? "TOT" : isNumeric ? sum(holes, key) : "—"}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
              </>
            )}
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-4">
          <Card>
            <p className="section-kicker mb-3">
              Rating Snapshot
            </p>
            {activeTee ? (
              <div className="space-y-2 text-sm">
                <SnapshotRow label="Men Rating" value={activeTee.ratingMen} />
                <SnapshotRow label="Men Slope" value={activeTee.slopeMen} />
                <SnapshotRow
                  label="Front Men"
                  value={`${formatValue(activeTee.ratingFrontMen)} / ${formatValue(activeTee.slopeFrontMen)}`}
                />
                <SnapshotRow
                  label="Back Men"
                  value={`${formatValue(activeTee.ratingBackMen)} / ${formatValue(activeTee.slopeBackMen)}`}
                />
                <SnapshotRow label="Women Rating" value={activeTee.ratingWomen} />
                <SnapshotRow label="Women Slope" value={activeTee.slopeWomen} />
                <SnapshotRow
                  label="Front Women"
                  value={`${formatValue(activeTee.ratingFrontWomen)} / ${formatValue(activeTee.slopeFrontWomen)}`}
                />
                <SnapshotRow
                  label="Back Women"
                  value={`${formatValue(activeTee.ratingBackWomen)} / ${formatValue(activeTee.slopeBackWomen)}`}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tee selected.</p>
            )}
          </Card>

          <Card>
            <p className="section-kicker mb-3">
              Course Facts
            </p>
            <div className="space-y-2 text-sm">
              <SnapshotRow label="Par" value={course.par} />
              <SnapshotRow label="Holes" value={course.numHoles} />
              <SnapshotRow label="Tees" value={tees.length} />
              <SnapshotRow label="Club" value={course.club?.name} />
              <SnapshotRow label="Location" value={course.location || course.club?.location} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: unknown }) {
  return (
    <div className="rounded-xl border border-base-300 bg-base-200/30 px-3 py-2.5">
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-800">{formatValue(value)}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-lg bg-base-200/60 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-widest text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-700 mt-0.5">{formatValue(value)}</p>
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-base-200 pb-2 last:border-b-0 last:pb-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-800 text-right">{formatValue(value)}</span>
    </div>
  );
}
