import { WorkOrder, Employee } from '@/types/snrd';
import { Search, Edit2, Trash2, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

const WorkOrdersList = ({
  workOrders,
  employees,
  getStatusColor,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: WorkOrdersListProps) => {
  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.fullName : 'Неизвестен';
  };

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Наряды</h2>
          <p className="text-gray-600 mt-1">Управление нарядами для выездных сотрудников</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Поиск по нарядам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Все статусы</option>
          <option value="Назначен">Назначен</option>
          <option value="Принят">Принят</option>
          <option value="В пути">В пути</option>
          <option value="Выполнен">Выполнен</option>
          <option value="Отменен">Отменен</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Наряд
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сотрудник
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Локация
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Плановое время
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{order.number}</span>
                    <span className="text-sm text-gray-500">{order.notes}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{getEmployeeName(order.employeeId)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">{order.applicationId || '—'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">
                        {order.plannedStartTime ? new Date(order.plannedStartTime).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                      <span className="text-xs text-gray-500">
                        до {order.plannedEndTime ? new Date(order.plannedEndTime).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(order)}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Удалить наряд?')) onDelete(order.id);
                      }}
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Наряды не найдены</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Показано нарядов: {filteredOrders.length} из {workOrders.length}
      </div>
    </div>
  );
};

export default WorkOrdersList;
