interface TabProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onTabClick }: TabProps) {
  return (
    <div className="bg-base-100 text-base-content px-2 py-2 rounded-md border">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab text-base-content ${activeTab === tab.id ? "tab-active bg-primary text-primary-content rounded-md py-1" : ""}`}
          onClick={() => onTabClick(tab.id)}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}
