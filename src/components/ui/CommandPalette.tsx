import { useState, useEffect, useRef } from "react";
import {
  Search,
  LayoutDashboard,
  Inbox,
  CalendarDays,
  Wrench,
  ClipboardList,
  Users,
  TrendingUp,
  Heart,
  Crown,
  Cpu,
  CalendarClock,
  Thermometer,
  Activity,
  DollarSign,
  BarChart2,
  FileBarChart,
  UserCheck,
  Award,
  GraduationCap,
  UserPlus,
  Plug,
  Zap,
  Shield,
  Key,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  group: string;
}

const ALL_ITEMS: CommandItem[] = [
  // Основное
  { id: "dashboard", label: "Дашборд", icon: LayoutDashboard, group: "Основное" },
  { id: "inbox", label: "Входящие", icon: Inbox, group: "Основное" },
  { id: "dispatch-board", label: "Доска диспетчера", icon: CalendarDays, group: "Основное" },
  { id: "work-orders", label: "Наряды", icon: Wrench, group: "Основное" },
  { id: "applications", label: "Заявки", icon: ClipboardList, group: "Основное" },

  // Клиенты и CRM
  { id: "clients", label: "Клиенты", icon: Users, group: "Клиенты и CRM" },
  { id: "crm", label: "CRM — воронка продаж", icon: TrendingUp, group: "Клиенты и CRM" },
  { id: "customer-health", label: "Здоровье клиентов", icon: Heart, group: "Клиенты и CRM" },
  { id: "memberships", label: "Абонементы", icon: Crown, group: "Клиенты и CRM" },

  // Оборудование
  { id: "equipment", label: "Оборудование", icon: Cpu, group: "Оборудование" },
  { id: "scheduled-maintenance", label: "Плановое ТО", icon: CalendarClock, group: "Оборудование" },
  { id: "refrigerant-compliance", label: "Учёт хладагентов", icon: Thermometer, group: "Оборудование" },
  { id: "reliability-dashboard", label: "Дашборд надёжности", icon: Activity, group: "Оборудование" },

  // Финансы
  { id: "finance", label: "Финансы", icon: DollarSign, group: "Финансы" },
  { id: "cash-flow", label: "Движение денег", icon: BarChart2, group: "Финансы" },
  { id: "reports", label: "Отчёты", icon: FileBarChart, group: "Финансы" },

  // HR
  { id: "hr", label: "HR — персонал", icon: UserCheck, group: "HR" },
  { id: "technician-scorecard", label: "Карточка техника", icon: Award, group: "HR" },
  { id: "lms", label: "Обучение (LMS)", icon: GraduationCap, group: "HR" },
  { id: "employee-onboarding", label: "Адаптация сотрудников", icon: UserPlus, group: "HR" },

  // Настройки
  { id: "integrations", label: "Интеграции", icon: Plug, group: "Настройки" },
  { id: "workflow-builder", label: "Конструктор процессов", icon: Zap, group: "Настройки" },
  { id: "roles", label: "Роли и права", icon: Shield, group: "Настройки" },
  { id: "licensing", label: "Лицензии", icon: Key, group: "Настройки" },
];

const GROUP_ORDER = [
  "Основное",
  "Клиенты и CRM",
  "Оборудование",
  "Финансы",
  "HR",
  "Настройки",
];

interface HighlightedTextProps {
  text: string;
  query: string;
}

function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query.trim()) {
    return <span>{text}</span>;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return <span>{text}</span>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + lowerQuery.length);
  const after = text.slice(index + lowerQuery.length);

  return (
    <span>
      {before}
      <strong className="font-bold text-blue-600">{match}</strong>
      {after}
    </span>
  );
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on query
  const filteredItems = query.trim()
    ? ALL_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase().trim())
      )
    : ALL_ITEMS;

  // Build grouped structure for display
  const groupedItems: { group: string; items: (CommandItem & { flatIndex: number })[] }[] = [];
  let flatIndex = 0;

  for (const group of GROUP_ORDER) {
    const items = filteredItems
      .filter((item) => item.group === group)
      .map((item) => ({ ...item, flatIndex: flatIndex++ }));
    if (items.length > 0) {
      groupedItems.push({ group, items });
    }
  }

  const totalVisible = filteredItems.length;

  // Reset selectedIndex when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector("[data-selected='true']");
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Keyboard event handler
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev <= 0 ? totalVisible - 1 : prev - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev >= totalVisible - 1 ? 0 : prev + 1));
          break;
        case "Enter":
          e.preventDefault();
          if (totalVisible > 0) {
            const item = filteredItems[selectedIndex];
            if (item) {
              onNavigate(item.id);
              onClose();
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, totalVisible, filteredItems, onNavigate, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        style={{ maxHeight: "70vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по системе..."
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Очистить
            </button>
          )}
        </div>

        {/* Items list */}
        <div ref={listRef} className="overflow-y-auto flex-1">
          {totalVisible === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Ничего не найдено по запросу «{query}»
            </div>
          ) : (
            <div className="py-2">
              {groupedItems.map(({ group, items }) => (
                <div key={group}>
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group}
                  </div>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isSelected = item.flatIndex === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-selected={isSelected}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onMouseEnter={() => setSelectedIndex(item.flatIndex)}
                        onClick={() => {
                          onNavigate(item.id);
                          onClose();
                        }}
                      >
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? "text-blue-600" : "text-gray-400"
                          }`}
                        />
                        <span className="text-sm">
                          <HighlightedText text={item.label} query={query} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500 font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500 font-mono">
                ↓
              </kbd>
              навигация
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500 font-mono">
                Enter
              </kbd>
              выбрать
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500 font-mono">
                Esc
              </kbd>
              закрыть
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-500 font-mono text-xs">
              ⌘K
            </kbd>
            <span>быстрый поиск</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
