import { useState } from "react";
import { Shield, ChevronDown, ChevronUp, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ActionType = "create" | "update" | "delete" | "status_change" | "login";
type EntityType = "WorkOrder" | "Client" | "Application" | "Employee" | "Contract" | "Invoice";

interface FieldChange {
  field: string;
  from: string;
  to: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: ActionType;
  entity: EntityType;
  entityId: string;
  description: string;
  ip: string;
  changes?: FieldChange[];
}

const MOCK_AUDIT_DATA: AuditEntry[] = [
  {
    id: "a001",
    timestamp: "2026-05-15T09:02:14.000Z",
    user: "Иванов Алексей",
    action: "status_change",
    entity: "WorkOrder",
    entityId: "WO-2026-000045",
    description: "Статус наряда изменён с «В работе» на «Завершён»",
    ip: "192.168.1.14",
    changes: [
      { field: "status", from: "IN_PROGRESS", to: "COMPLETED" },
      { field: "completedAt", from: "—", to: "2026-05-15T09:02:14Z" },
    ],
  },
  {
    id: "a002",
    timestamp: "2026-05-15T08:55:30.000Z",
    user: "Смирнова Ольга",
    action: "create",
    entity: "Application",
    entityId: "APP-2026-000312",
    description: "Создана новая заявка от клиента ООО «АрктикХолод»",
    ip: "192.168.1.22",
  },
  {
    id: "a003",
    timestamp: "2026-05-15T08:40:11.000Z",
    user: "Петров Дмитрий",
    action: "update",
    entity: "Client",
    entityId: "CLT-000087",
    description: "Обновлены контактные данные клиента",
    ip: "10.0.0.5",
    changes: [
      { field: "phone", from: "+79161234567", to: "+79169876543" },
      { field: "email", from: "old@example.com", to: "new@example.com" },
    ],
  },
  {
    id: "a004",
    timestamp: "2026-05-15T08:21:00.000Z",
    user: "Козлова Марина",
    action: "login",
    entity: "Employee",
    entityId: "EMP-000034",
    description: "Успешный вход в систему",
    ip: "172.16.0.3",
  },
  {
    id: "a005",
    timestamp: "2026-05-15T08:15:44.000Z",
    user: "Иванов Алексей",
    action: "update",
    entity: "WorkOrder",
    entityId: "WO-2026-000045",
    description: "Добавлены материалы к наряду: хладагент R-410A 0.5 кг",
    ip: "192.168.1.14",
    changes: [
      { field: "materialsCount", from: "2", to: "3" },
      { field: "totalCost", from: "3500.00", to: "4200.00" },
    ],
  },
  {
    id: "a006",
    timestamp: "2026-05-15T07:58:22.000Z",
    user: "Администратор",
    action: "create",
    entity: "Employee",
    entityId: "EMP-000041",
    description: "Создан новый сотрудник: Романов Сергей Викторович",
    ip: "10.0.0.1",
  },
  {
    id: "a007",
    timestamp: "2026-05-14T17:33:05.000Z",
    user: "Смирнова Ольга",
    action: "update",
    entity: "Contract",
    entityId: "CTR-2025-000019",
    description: "Продлён договор на обслуживание, новый срок окончания — 31.12.2026",
    ip: "192.168.1.22",
    changes: [
      { field: "endDate", from: "2025-12-31", to: "2026-12-31" },
      { field: "amount", from: "120000.00", to: "145000.00" },
    ],
  },
  {
    id: "a008",
    timestamp: "2026-05-14T16:10:00.000Z",
    user: "Петров Дмитрий",
    action: "delete",
    entity: "Application",
    entityId: "APP-2026-000298",
    description: "Удалена дублирующая заявка",
    ip: "10.0.0.5",
  },
  {
    id: "a009",
    timestamp: "2026-05-14T15:45:18.000Z",
    user: "Козлова Марина",
    action: "create",
    entity: "Invoice",
    entityId: "INV-2026-000781",
    description: "Выставлен счёт клиенту на сумму 18 500 ₽",
    ip: "172.16.0.3",
  },
  {
    id: "a010",
    timestamp: "2026-05-14T14:22:37.000Z",
    user: "Иванов Алексей",
    action: "status_change",
    entity: "WorkOrder",
    entityId: "WO-2026-000044",
    description: "Статус наряда изменён с «Назначен» на «В пути»",
    ip: "192.168.1.14",
    changes: [
      { field: "status", from: "ASSIGNED", to: "EN_ROUTE" },
    ],
  },
  {
    id: "a011",
    timestamp: "2026-05-14T13:05:50.000Z",
    user: "Администратор",
    action: "update",
    entity: "Employee",
    entityId: "EMP-000022",
    description: "Изменена роль сотрудника: добавлена роль «Старший техник»",
    ip: "10.0.0.1",
    changes: [
      { field: "role", from: "TECHNICIAN", to: "SENIOR_TECHNICIAN" },
    ],
  },
  {
    id: "a012",
    timestamp: "2026-05-14T12:00:00.000Z",
    user: "Смирнова Ольга",
    action: "login",
    entity: "Employee",
    entityId: "EMP-000015",
    description: "Успешный вход в систему",
    ip: "192.168.1.22",
  },
  {
    id: "a013",
    timestamp: "2026-05-14T11:48:14.000Z",
    user: "Петров Дмитрий",
    action: "create",
    entity: "WorkOrder",
    entityId: "WO-2026-000046",
    description: "Создан наряд на плановое ТО оборудования Daikin FTXS35K",
    ip: "10.0.0.5",
  },
  {
    id: "a014",
    timestamp: "2026-05-14T10:30:22.000Z",
    user: "Козлова Марина",
    action: "update",
    entity: "Invoice",
    entityId: "INV-2026-000775",
    description: "Статус оплаты счёта изменён на «Оплачен»",
    ip: "172.16.0.3",
    changes: [
      { field: "paymentStatus", from: "PENDING", to: "PAID" },
      { field: "paidAt", from: "—", to: "2026-05-14T10:30:00Z" },
    ],
  },
  {
    id: "a015",
    timestamp: "2026-05-14T09:15:05.000Z",
    user: "Иванов Алексей",
    action: "update",
    entity: "WorkOrder",
    entityId: "WO-2026-000043",
    description: "Загружены фотографии выполненных работ (3 фото)",
    ip: "192.168.1.14",
  },
  {
    id: "a016",
    timestamp: "2026-05-13T18:00:00.000Z",
    user: "Администратор",
    action: "create",
    entity: "Contract",
    entityId: "CTR-2026-000025",
    description: "Заключён новый договор на обслуживание с ООО «ТехноГрупп»",
    ip: "10.0.0.1",
  },
  {
    id: "a017",
    timestamp: "2026-05-13T16:44:30.000Z",
    user: "Смирнова Ольга",
    action: "delete",
    entity: "Client",
    entityId: "CLT-000103",
    description: "Удалён дублирующий профиль клиента (объединён с CLT-000087)",
    ip: "192.168.1.22",
  },
  {
    id: "a018",
    timestamp: "2026-05-13T15:20:11.000Z",
    user: "Петров Дмитрий",
    action: "status_change",
    entity: "Application",
    entityId: "APP-2026-000305",
    description: "Статус заявки изменён с «Новая» на «Назначена»",
    ip: "10.0.0.5",
    changes: [
      { field: "status", from: "NEW", to: "ASSIGNED" },
      { field: "assignedTo", from: "—", to: "Иванов Алексей" },
    ],
  },
  {
    id: "a019",
    timestamp: "2026-05-13T13:05:44.000Z",
    user: "Козлова Марина",
    action: "login",
    entity: "Employee",
    entityId: "EMP-000034",
    description: "Успешный вход в систему",
    ip: "172.16.0.3",
  },
  {
    id: "a020",
    timestamp: "2026-05-13T09:00:00.000Z",
    user: "Администратор",
    action: "update",
    entity: "Employee",
    entityId: "EMP-000041",
    description: "Завершена процедура адаптации нового сотрудника",
    ip: "10.0.0.1",
    changes: [
      { field: "onboardingStatus", from: "IN_PROGRESS", to: "COMPLETED" },
    ],
  },
];

const PAGE_SIZE = 10;

const ACTION_LABELS: Record<ActionType, string> = {
  create: "Создание",
  update: "Изменение",
  delete: "Удаление",
  status_change: "Смена статуса",
  login: "Вход в систему",
};

const ACTION_COLORS: Record<ActionType, string> = {
  create: "bg-green-100 text-green-700 border-green-200",
  update: "bg-blue-100 text-blue-700 border-blue-200",
  delete: "bg-red-100 text-red-700 border-red-200",
  status_change: "bg-purple-100 text-purple-700 border-purple-200",
  login: "bg-gray-100 text-gray-600 border-gray-200",
};

const ENTITY_LABELS: Record<EntityType, string> = {
  WorkOrder: "Наряд",
  Client: "Клиент",
  Application: "Заявка",
  Employee: "Сотрудник",
  Contract: "Договор",
  Invoice: "Счёт",
};

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return { date, time };
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function AuditLog() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters
  const filtered = MOCK_AUDIT_DATA.filter((entry) => {
    if (dateFrom) {
      const entryDate = entry.timestamp.slice(0, 10);
      if (entryDate < dateFrom) return false;
    }
    if (dateTo) {
      const entryDate = entry.timestamp.slice(0, 10);
      if (entryDate > dateTo) return false;
    }
    if (entityFilter !== "all" && entry.entity !== entityFilter) return false;
    if (actionFilter !== "all" && entry.action !== actionFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !entry.user.toLowerCase().includes(q) &&
        !entry.description.toLowerCase().includes(q) &&
        !entry.entityId.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // Stats
  const totalEntries = filtered.length;
  const entriesToday = filtered.filter((e) => isToday(e.timestamp)).length;
  const uniqueUsersToday = new Set(
    filtered.filter((e) => isToday(e.timestamp)).map((e) => e.user)
  ).size;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleExportCsv() {
    toast.success("CSV-файл журнала аудита сформирован и готов к загрузке");
  }

  function handleFilterChange() {
    setCurrentPage(1);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Журнал аудита</h1>
            <p className="text-sm text-gray-500">Полная история изменений системы</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Экспорт CSV
        </Button>
      </div>

      {/* Filter row */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Дата с</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); handleFilterChange(); }}
              className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Дата по</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); handleFilterChange(); }}
              className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Тип сущности</label>
            <select
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); handleFilterChange(); }}
              className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все сущности</option>
              {(Object.keys(ENTITY_LABELS) as EntityType[]).map((key) => (
                <option key={key} value={key}>{ENTITY_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Тип действия</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); handleFilterChange(); }}
              className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все действия</option>
              {(Object.keys(ACTION_LABELS) as ActionType[]).map((key) => (
                <option key={key} value={key}>{ACTION_LABELS[key]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Поиск</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
              placeholder="Пользователь, ID, описание..."
              className="h-9 px-3 rounded-md border border-gray-200 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalEntries}</div>
          <div className="text-xs text-gray-500 mt-1">Всего записей</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{entriesToday}</div>
          <div className="text-xs text-gray-500 mt-1">Событий сегодня</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{uniqueUsersToday}</div>
          <div className="text-xs text-gray-500 mt-1">Уникальных пользователей сегодня</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">
                  Время
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">
                  Действие
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Сущность / ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Описание
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    Записи не найдены
                  </td>
                </tr>
              ) : (
                pageItems.map((entry) => {
                  const { date, time } = formatTimestamp(entry.timestamp);
                  const isExpanded = expandedRows.has(entry.id);
                  const hasChanges = entry.changes && entry.changes.length > 0;

                  return (
                    <>
                      <tr
                        key={entry.id}
                        className={`transition-colors ${
                          hasChanges ? "cursor-pointer hover:bg-gray-50" : ""
                        } ${isExpanded ? "bg-gray-50" : ""}`}
                        onClick={() => hasChanges && toggleRow(entry.id)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{time}</div>
                          <div className="text-xs text-gray-400">{date}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-gray-800">{entry.user}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ACTION_COLORS[entry.action]}`}
                          >
                            {ACTION_LABELS[entry.action]}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-gray-700 font-medium">{ENTITY_LABELS[entry.entity]}</div>
                          <div className="text-xs text-blue-600 font-mono">{entry.entityId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{entry.description}</span>
                            {hasChanges && (
                              <span className="text-gray-400 flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-mono text-gray-500">{entry.ip}</span>
                        </td>
                      </tr>
                      {isExpanded && hasChanges && (
                        <tr key={`${entry.id}-expanded`} className="bg-blue-50">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="ml-2">
                              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                Изменения полей:
                              </div>
                              <div className="flex flex-col gap-1.5">
                                {entry.changes!.map((change, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span className="font-mono text-gray-600 w-40 truncate">
                                      {change.field}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-mono max-w-xs truncate">
                                      {change.from}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-mono max-w-xs truncate">
                                      {change.to}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            Показано{" "}
            <span className="font-medium">
              {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span>{" "}
            из{" "}
            <span className="font-medium">{filtered.length}</span> записей
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Назад
            </Button>
            <span className="text-sm text-gray-600 px-2">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1"
            >
              Вперёд
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLog;
