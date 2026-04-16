export const calculateMatchplayPops = (p1: any, p2: any, holes: any) => {
  const p1hcp = Number(p1.handicap);
  const p2hcp = Number(p2.handicap);
  const hcpDiff = Math.abs(p1hcp - p2hcp);
  const sortedHoles = [...holes].sort((a: any, b: any) => a.hcp - b.hcp);

  // Map hole number to number of pops
  const p1PopsMap = new Map<number, number>();
  const p2PopsMap = new Map<number, number>();

  let remainingPops = hcpDiff;
  let holeIndex = 0;

  while (remainingPops > 0) {
    const hole = sortedHoles[holeIndex % sortedHoles.length];
    const currentPops = (p1hcp > p2hcp ? p1PopsMap.get(hole.num) : p2PopsMap.get(hole.num)) || 0;

    if (p1hcp > p2hcp) {
      p1PopsMap.set(hole.num, currentPops + 1);
    } else if (p2hcp > p1hcp) {
      p2PopsMap.set(hole.num, currentPops + 1);
    }

    remainingPops--;
    holeIndex++;
  }

  return [p1PopsMap, p2PopsMap];
};

export const calculateStrokeplayPops = (hcp: number, holes: any) => {
  const sortedHoles = [...holes].sort((a, b) => a.hcp - b.hcp);
  const popsMap = new Map<number, number>();

  while (hcp > 0) {
    for (const hole of sortedHoles) {
      if (hcp <= 0) break;
      popsMap.set(hole.num, (popsMap.get(hole.num) || 0) + 1);
      hcp--;
    }
  }

  return popsMap;
};
