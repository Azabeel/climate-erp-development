import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface WarrantyClaim {
  id: string;
  orderNumber: string;
  client: string;
  equipment: string;
  installDate: string;
  warrantyEnd: string;
  claimDate?: string;
  status: 'active' | 'claimed' | 'expired' | 'resolved';
  issue?: string;
  daysLeft: number;
}

const CLAIMS: WarrantyClaim[] = [
  { id: 'w1', orderNumber: 'WO-2025-000187', client: 'ООО Альфа', equipment: 'Daikin FTXB35C', installDate: '15.11.2025', warrantyEnd: '15.11.2026', status: 'active', daysLeft: 185 },
  { id: 'w2', orderNumber: 'WO-2026-000007', client: 'ТЦ Мираж', equipment: 'Mitsubishi MSZ-LN35VG (3 ед.)', installDate: '10.02.2026', warrantyEnd: '10.02.2028', status: 'active', daysLeft: 637 },
  { id: 'w3', orderNumber: 'WO-2025-000142', client: 'ООО Берег', equipment: 'Gree GSH-09CR', installDate: '05.09.2025', warrantyEnd: '05.09.2026', status: 'claimed', claimDate: '10.05.2026', issue: 'Посторонний шум при работе компрессора', daysLeft: 114 },
  { id: 'w4', orderNumber: 'WO-2025-000088', client: 'ИП Смирнов', equipment: 'Haier AS18TT4HRA', installDate: '12.05.2025', warrantyEnd: '12.05.2026', status: 'claimed', claimDate: '08.05.2026', issue: 'Не охлаждает, ошибка E1', daysLeft: 2 },
  { id: 'w5', orderNumber: 'WO-2024-000312', client: 'Петров И.И.', equipment: 'LG S09EQ', installDate: '03.04.2024', warrantyEnd: '03.04.2026', status: 'resolved', daysLeft: -41 },
  { id: 'w6', orderNumber: 'WO-2024-000298', client: 'ООО Гранд', equipment: 'Samsung AR09TXHQASINUA', installDate: '15.02.2024', warrantyEnd: '15.02.2025', status: 'expired', daysLeft: -454 },
];

const getStatusInfo = (status: WarrantyClaim['status']) => ({
  active: { label: 'Действующая', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={14} className="text-green-600" /> },
  claimed: { label: 'Гарантийный случай', cls: 'bg-yellow-100 text-yellow-700', icon: <AlertTriangle size={14} className="text-yellow-600" /> },
  resolved: { label: 'Закрыта', cls: 'bg-gray-100 text-gray-600', icon: <CheckCircle size={14} className="text-gray-500" /> },
  expired: { label: 'Истекла', cls: 'bg-red-100 text-red-700', icon: <Clock size={14} className="text-red-600" /> },
}[status]);

const WarrantyTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = CLAIMS.filter(c => {
    const matchSearch = c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    active: CLAIMS.filter(c => c.status === 'active').length,
    claimed: CLAIMS.filter(c => c.status === 'claimed').length,
    expiringSoon: CLAIMS.filter(c => c.status === 'active' && c.daysLeft <= 30).length,
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Гарантийный учёт</h2>
            <p className="text-gray-600 mt-0.5">Отслеживание гарантий и гарантийных случаев</p>
          </div>
        </div>
        <Button onClick={() => toast.info('Регистрация гарантии')}>
          <Plus size={16} className="mr-2" /> Зарегистрировать
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-medium">Активных гарантий</p>
          <p className="text-3xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700 font-medium">Гарантийных случаев</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.claimed}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-700 font-medium">Истекает &lt;30 дней</p>
          <p className="text-3xl font-bold text-orange-700">{stats.expiringSoon}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700 font-medium">Всего записей</p>
          <p className="text-3xl font-bold text-blue-700">{CLAIMS.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input placeholder="Поиск по клиенту, оборудованию, наряду..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">Все</option>
          <option value="active">Действующие</option>
          <option value="claimed">Гарантийные случаи</option>
          <option value="resolved">Закрытые</option>
          <option value="expired">Истекшие</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Наряд', 'Клиент', 'Оборудование', 'Дата монтажа', 'Гарантия до', 'Статус', 'Действия'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map(claim => {
              const statusInfo = getStatusInfo(claim.status);
              return (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{claim.orderNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{claim.client}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-900">{claim.equipment}</p>
                    {claim.issue && <p className="text-xs text-red-600 mt-0.5">{claim.issue}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{claim.installDate}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{claim.warrantyEnd}</p>
                    {claim.status === 'active' && claim.daysLeft <= 30 && (
                      <p className="text-xs text-orange-600">⚠ {claim.daysLeft} дней</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {statusInfo?.icon}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo?.cls}`}>{statusInfo?.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {claim.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => toast.success(`Гарантийный случай зарегистрирован для ${claim.orderNumber}`)}>
                        Зарег. случай
                      </Button>
                    )}
                    {claim.status === 'claimed' && (
                      <Button size="sm" onClick={() => toast.success('Наряд на гарантийный ремонт создан')}>
                        Создать наряд
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500">Записи не найдены</div>
        )}
      </div>
    </div>
  );
};

export default WarrantyTracking;
