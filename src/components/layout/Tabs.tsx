interface TabProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  className?: string;
  onTabClick: (tabId: string) => void;
  variation?: "light" | "dark";
}

export function Tabs({ tabs, activeTab, className, onTabClick, variation = "light" }: TabProps) {
  const bgClass = variation === "light" ? "bg-base-100" : "bg-primary";
  const tabClass = variation === "light" ? "text-base-content" : "text-primary-content";
  const activeTabClass =
    variation === "light"
      ? "bg-primary text-primary-content"
      : "bg-secondary text-secondary-content";

  return (
    <div className={`${bgClass} px-2 py-1.5 rounded-lg border ${className}`}>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab text-xs py-1.5 px-3 font-semibold ${activeTab === tab.id ? `rounded-sm ${activeTabClass}` : ""} ${tabClass} `}
          onClick={() => onTabClick(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

interface BaseTabProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

export function BaseTabs({ tabs, activeTab, onTabClick }: BaseTabProps) {
  return (
    <div className="w-full flex border-b">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab text-sm py-1.5 px-3 font-semibold text-gray-700 ${activeTab === tab.id && "text-primary border-b-2 border-primary"}`}
          onClick={() => onTabClick(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
