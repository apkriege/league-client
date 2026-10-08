import { useFormContext } from "react-hook-form";
import type { HandicapSettings } from "@/features/leagues/handicapSettings";
import type { Player } from "@/types/league";

export function useHandicapBasis() {
  const { getValues, setValue } = useFormContext<HandicapSettings & { players: Player[] }>();
  return (basis: 9 | 18) => {
    const previous = getValues("handicapHoleBasis") || 18;
    const players = getValues("players") ?? [];
    if (basis !== previous && players.length) {
      setValue("players", players.map((player) => ({ ...player,
        handicap: player.handicap == null ? null : Math.round(player.handicap * basis / previous * 100) / 100,
      })), { shouldDirty: true });
    }
    setValue("handicapHoleBasis", basis, { shouldDirty: true });
  };
}
