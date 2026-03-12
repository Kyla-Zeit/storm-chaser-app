import { Cloud, Camera, List, Map } from 'lucide-react';

export type TabId = 'weather' | 'document' | 'log' | 'map';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  reportCount: number;
}

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'document', label: 'Document', icon: Camera },
  { id: 'log', label: 'Log', icon: List },
  { id: 'map', label: 'Map', icon: Map },
];

export function AppNav({ activeTab, onTabChange, reportCount }: Props) {
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 rounded-2xl border border-white/10 bg-background/80 p-2 backdrop-blur-xl shadow-2xl">
      <div className="grid grid-cols-4 gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-150
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'log' && reportCount > 0 && (
                <span className={`
                  absolute top-1.5 right-3 text-[10px] rounded-full px-1.5 min-w-[18px] text-center
                  ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground'}
                `}>
                  {reportCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
