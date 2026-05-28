import courseImg from "@/assets/course.png";
import { Swords } from "lucide-react";
import { Link, useParams } from "react-router";

export default function NoEvents() {
  const { leagueId } = useParams();

  return (
    <div>
      <div
        className="relative w-3/4 rounded-xl bg-center bg-fit welcome-card"
        style={{ backgroundImage: `url(${courseImg})` }}
      >
        <div className="absolute inset-0" />
        <div className="relative z-10 flex h-full p-10">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Ready for your first event? <br />
            </h1>
            <p className="text-gray-300 mb-8">
              Your league is configured and players are warming up. Launch your inaugural event to
              start tracking handicaps and leaderboards.
            </p>
            <div className="flex space-x-3">
              <Link
                to={`/league/${leagueId}/events/create`}
                className="btn btn-secondary text-secondary-content"
              >
                <Swords size={16} /> Create Event
              </Link>
              <button className="btn btn-ghost">Learn More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
