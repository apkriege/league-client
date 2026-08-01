import type { ReactNode } from "react";
import { Link, useParams } from "react-router";

type PlayerNameLinkProps = {
  playerId?: number | string | null;
  children: ReactNode;
  className?: string;
};

export default function PlayerNameLink({
  playerId,
  children,
  className = "font-semibold text-gray-800 hover:text-slate-900 hover:underline",
}: PlayerNameLinkProps) {
  const { leagueId } = useParams();
  const numericPlayerId = Number(playerId);

  if (!leagueId || !Number.isFinite(numericPlayerId) || numericPlayerId <= 0) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to={`/league/${leagueId}/player/${numericPlayerId}`}
      className={className}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </Link>
  );
}
