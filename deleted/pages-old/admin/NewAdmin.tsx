import welcomeImg from "@/assets/welcome.png";
import { ArrowRight, Swords } from "lucide-react";
import { Link } from "react-router";

interface ChecklistCardProps {
  title: string;
  text: string;
  icon: React.ReactNode;
  linkText?: string;
  link?: string;
}

const ChecklistCard = ({ title, text, icon, linkText, link }: ChecklistCardProps) => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-base-300 bg-white p-4 transition-all hover:-translate-y-1 cursor-pointer">
      <div className="bg-slate-200 w-fit text-slate-600 p-2 rounded-md mb-4">{icon}</div>
      <div className="flex grow flex-col">
        <h3 className="font-bold text-md text-gray-800 mb-2">{title}</h3>
        <p className="text-xs text-gray-500 mb-4 grow">{text}</p>
        {linkText && link && (
          <Link
            to={link}
            className="mt-auto text-accent text-xs font-semibold flex gap-1 items-center hover:gap-2 transition-all"
          >
            <span>{linkText}</span>
            <ArrowRight size={16} className="inline-block" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default function NewAdmin() {
  return (
    <div className="flex flex-col">
      <div
        className="relative h-96 w-3/4 rounded-xl bg-center bg-fit welcome-card"
        style={{ backgroundImage: `url(${welcomeImg})` }}
      >
        <div className="absolute inset-0" />

        <div className="relative z-10 flex h-full p-10 w-3/4">
          <div className="flex flex-col">
            <div className="badge bg-accent border-0 text-secondary text-[9px] font-semibold rounded-full mb-5">
              FIRST ROUND
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
              Welcome to <span className="text-secondary">League Night Pro!</span>
            </h1>
            <p className="text-gray-300 mb-8">
              Your championshp starts here. Organize your club, track live scores, and mangage your
              golf community with professional precision.
            </p>
            <div className="flex space-x-3">
              <button className="btn btn-secondary text-secondary-content">
                <Swords size={16} /> Create Your First League
              </button>
              <button className="btn btn-ghost">Learn More</button>
            </div>
          </div>
        </div>
      </div>

      <div className="getting-started">
        <h2 className="text-xl mt-10 mb-5 font-semibold">Getting Started Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChecklistCard
            title="Create Your League"
            text="Set up your first league and invite players to join your golf community."
            icon={<Swords size={18} />}
            linkText="Create League"
            link={"/admin/league/create"}
          />
          <ChecklistCard
            title="Add Players"
            text="Import or add players to your league roster to start tracking their performance and stats throughout the season."
            icon={<Swords size={18} />}
            link="/admin/create-league"
            linkText="Add Players"
          />
          <ChecklistCard
            title="Schedule Events"
            text="Create events and schedule matches for your league for the entire season."
            icon={<Swords size={18} />}
            link="/admin/create-league"
            linkText="Schedule Events"
          />
          <ChecklistCard
            title="Add Scoring System"
            text="Choose from our pre-built scoring systems or create your own custom scoring rules."
            icon={<Swords size={18} />}
            link="/admin/create-league"
            linkText="Set Up Scoring"
          />
        </div>
      </div>
    </div>
  );
}
