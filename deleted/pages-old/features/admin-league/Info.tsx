import Card from "@/components/layout/Card";

interface League {
  id: number;
  name: string;
  description: string;
  type: string;
  numPlayers: number;
  startDate: Date;
  endDate: Date;
  contactFirst: string;
  contactLast: string;
  contactEmail: string;
  contactPhone: string;
}

export default function Info({ league }: { league: any }) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-base-content/70">Description</h3>
          <p className="text-base">{league.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-base-content/70">Type</h3>
            <p className="text-base capitalize">{league.type}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
