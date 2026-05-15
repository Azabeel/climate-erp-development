import { useState, useMemo } from 'react';
import { WorkOrder, Employee } from '@/types/snrd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface WorkOrdersListProps {
  workOrders: WorkOrder[];
  employees: Employee[];
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  onEdit: (workOrder: WorkOrder) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

const STATUS_OPTIONS = ['all', 'Назначен', 'Принят', 'В пути', 'В работе', 'Выполнен', 'Отменен'];
const KANBAN_COLUMNS = ['Назначен', 'В пути', 'В работе', 'Выполнен'];

const WorkOrdersList = ({
  workOrders,
  employees,
  getStatusColor,
  getPriorityColor,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: WorkOrdersListProps) => {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<'number' | 'plannedStartTime'>('number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.fullName : '—';
  };

  const filteredOrders = useMemo(() => {
    return workOrders
      .filter(order => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const valA = sortField === 'number' ? a.number : (a.plannedStartTime || '');
        const valB = sortField === 'number' ? b.number : (b.plannedStartTime || '');
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [workOrders, searchQuery, statusFilter, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filteredOrders.length) setSelected(new Set());
    else setSelected(new Set(filteredOrders.map(o => o.id)));
  };

  const bulkDelete = () => {
    selected.forEach(id => onDelete(id));
    toast.success(`Удалено нарядов: ${selected.size}`);
    setSelected(new Set());
  };

  const formatDateTime = (dt?: string) => dt
    ? new Date(dt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '—';

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <Icon
      name={sortField === field ? (sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'}
      size={12}
      className="inline ml-1 text-gray-400"
    />
  );

  return (
    <div className="p-6">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Наряды</h2>
          <p className="text-sm text-gray-500 mt-0.5">Управление нарядами для выездных сотрудников</p>
        </div>
        <Button size="sm">
          <Icon name="Plus" size={14} className="mr-1.5" />
          Создать наряд
        </Button>
      </div>

      {/* Фильтры */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по нарядам..."
            className="pl-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'Все статусы' : s}</option>
          ))}
        </select>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          {(['list', 'kanban'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5 ${view === v ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Icon name={v === 'list' ? 'LayoutList' : 'Columns'} size={14} />
              {v === 'list' ? 'Список' : 'Канбан'}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-xs text-blue-700 font-medium">Выбрано: {selected.size}</span>
            <button onClick={bulkDelete} className="text-xs text-red-600 hover:underline">Удалить</button>
            <button onClick={() => { toast.info(`Экспорт ${selected.size} нарядов`); }} className="text-xs text-blue-600 hover:underline">Экспорт</button>
            <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600">
              <Icon name="X" size={12} />
            </button>
          </div>
        )}
      </div>

      {view === 'list' ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === filteredOrders.length && filteredOrders.length > 0}
                      onChange={selectAll}
                      className="rounded border-gray-300 text-blue-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => toggleSort('number')}>
                    Номер <SortIcon field="number" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Описание</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Инженер</th>
                  <th className="px-4 py-3 text-left cursor-pointer select-none text-xs font-medium text-gray-500 uppercase tracking-wider" onClick={() => toggleSort('plannedStartTime')}>
                    Плановое время <SortIcon field="plannedStartTime" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map(order => (
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${selected.has(order.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 font-mono text-xs">{order.number}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-700 truncate">{order.notes || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Icon name="User" size={12} className="text-gray-500" />
                        </div>
                        <span className="text-gray-700 text-xs">{getEmployeeName(order.employeeId)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 text-xs">
                        <div>{formatDateTime(order.plannedStartTime)}</div>
                        {order.plannedEndTime && (
                          <div className="text-gray-400">до {formatDateTime(order.plannedEndTime)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(order)} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700">
                          <Icon name="Edit2" size={14} />
                        </button>
                        <button
                          onClick={() => { if (confirm('Удалить наряд?')) onDelete(order.id); }}
                          className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="text-center py-16">
                <Icon name="ClipboardList" size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm">Наряды не найдены</p>
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Показано: {filteredOrders.length} из {workOrders.length}
          </div>
        </>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {KANBAN_COLUMNS.map(col => {
            const colOrders = filteredOrders.filter(o => o.status === col);
            return (
              <div key={col} className="w-60 flex-shrink-0">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold text-gray-600">{col}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{colOrders.length}</span>
                </div>
                <div className="space-y-2">
                  {colOrders.map(order => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm cursor-pointer transition-shadow" onClick={() => onEdit(order)}>
                      <div className="font-mono text-xs text-gray-400 mb-1">{order.number}</div>
                      <p className="text-sm text-gray-800 line-clamp-2 mb-2">{order.notes || 'Без описания'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{getEmployeeName(order.employeeId).split(' ')[0]}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                  {colOrders.length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-lg">
                      Нет нарядов
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkOrdersList;
