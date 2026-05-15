import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

type IntegrationSystem = '1c' | 'telegram' | 'whatsapp' | 'email' | 'avito' | 'cdek' | 'osrm' | 'weather';
type LogStatus = 'success' | 'error' | 'warning' | 'pending';

interface LogEntry {
  id: string;
  system: IntegrationSystem;
  operation: string;
  status: LogStatus;
  timestamp: string;
  duration: number;
  requestBody?: string;
  responseBody?: string;
  errorMessage?: string;
  retries: number;
  entityId?: string;
  entityType?: string;
}

const LOGS: LogEntry[] = [
  { id: 'L001', system: '1c', operation: 'POST /odata/acts/upload', status: 'success', timestamp: '2026-05-15 14:32:15', duration: 342, requestBody: '{"act_id": "ACT-2026-441", "work_order": "WO-412"}', responseBody: '{"status": "ok", "1c_id": "10023"}', retries: 0, entityId: 'ACT-2026-441', entityType: 'Акт' },
  { id: 'L002', system: 'telegram', operation: 'sendMessage to chat_id=7812341', status: 'success', timestamp: '2026-05-15 14:31:02', duration: 189, responseBody: '{"ok": true, "result": {"message_id": 5921}}', retries: 0, entityId: 'WO-2026-000412', entityType: 'Наряд' },
  { id: 'L003', system: '1c', operation: 'GET /odata/Contractors', status: 'error', timestamp: '2026-05-15 14:28:55', duration: 5021, errorMessage: 'Connection timeout after 5000ms. 1C server unavailable.', retries: 3, entityType: 'Справочник' },
  { id: 'L004', system: 'cdek', operation: 'GET /v2/orders/{uuid}/statuses', status: 'success', timestamp: '2026-05-15 14:25:10', duration: 412, responseBody: '{"entity": {"uuid": "...", "statuses": [{"code": "ACCEPTED"}]}}', retries: 0, entityId: 'PO-2026-089', entityType: 'Закупка' },
  { id: 'L005', system: 'whatsapp', operation: 'messages.send to +79161234567', status: 'success', timestamp: '2026-05-15 14:22:33', duration: 267, responseBody: '{"messaging_product": "whatsapp", "contacts": [...]}', retries: 0, entityId: 'WO-2026-000410', entityType: 'Наряд' },
  { id: 'L006', system: 'email', operation: 'SMTP send to client@company.ru', status: 'warning', timestamp: '2026-05-15 14:20:01', duration: 1834, errorMessage: 'Soft bounce — mailbox full. Will retry in 1h.', retries: 1, entityType: 'Уведомление' },
  { id: 'L007', system: 'osrm', operation: 'GET /route/v1/driving/{coords}', status: 'success', timestamp: '2026-05-15 14:18:44', duration: 78, responseBody: '{"routes": [{"distance": 12345, "duration": 923}]}', retries: 0, entityType: 'Маршрут' },
  { id: 'L008', system: 'weather', operation: 'GET /forecast?lat=55.75&lon=37.62', status: 'success', timestamp: '2026-05-15 14:15:00', duration: 234, responseBody: '{"list": [...], "city": {"name": "Moscow"}}', retries: 0, entityType: 'Прогноз' },
  { id: 'L009', system: 'avito', operation: 'GET /messenger/v3/accounts/messages', status: 'error', timestamp: '2026-05-15 14:10:22', duration: 2100, errorMessage: 'HTTP 429 Too Many Requests. Rate limit exceeded.', retries: 0, entityType: 'Сообщения' },
  { id: 'L010', system: '1c', operation: 'PUT /odata/WorkOrders/{id}', status: 'success', timestamp: '2026-05-15 14:05:18', duration: 389, requestBody: '{"status": "COMPLETED", "completed_at": "2026-05-15T14:00:00"}', responseBody: '{"status": "ok"}', retries: 0, entityId: 'WO-2026-000399', entityType: 'Наряд' },
  { id: 'L011', system: 'telegram', operation: 'sendMessage to chat_id=5534211', status: 'pending', timestamp: '2026-05-15 14:02:55', duration: 0, retries: 0, entityId: 'WO-2026-000408', entityType: 'Наряд' },
  { id: 'L012', system: 'cdek', operation: 'POST /v2/orders', status: 'success', timestamp: '2026-05-15 13:58:30', duration: 651, responseBody: '{"entity": {"uuid": "abc-123"}, "requests": [{"state": "ACCEPTED"}]}', retries: 0, entityId: 'PO-2026-088', entityType: 'Закупка' },
];

const systemConfig: Record<IntegrationSystem, { label: string; color: string; bg: string; icon: string }> = {
  '1c': { label: '1С:УНФ', color: 'text-yellow-700', bg: 'bg-yellow-50', icon: 'Database' },
  telegram: { label: 'Telegram', color: 'text-blue-600', bg: 'bg-blue-50', icon: 'Send' },
  whatsapp: { label: 'WhatsApp', color: 'text-green-700', bg: 'bg-green-50', icon: 'MessageCircle' },
  email: { label: 'Email', color: 'text-gray-700', bg: 'bg-gray-50', icon: 'Mail' },
  avito: { label: 'Авито', color: 'text-orange-700', bg: 'bg-orange-50', icon: 'ShoppingBag' },
  cdek: { label: 'СДЭК', color: 'text-green-800', bg: 'bg-green-50', icon: 'Truck' },
  osrm: { label: 'OSRM', color: 'text-purple-700', bg: 'bg-purple-50', icon: 'Map' },
  weather: { label: 'Погода', color: 'text-sky-700', bg: 'bg-sky-50', icon: 'Cloud' },
};

const statusConfig: Record<LogStatus, { label: string; color: string; bg: string; icon: string }> = {
  success: { label: 'Успешно', color: 'text-green-700', bg: 'bg-green-100', icon: 'CheckCircle' },
  error: { label: 'Ошибка', color: 'text-red-700', bg: 'bg-red-100', icon: 'XCircle' },
  warning: { label: 'Предупреждение', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: 'AlertTriangle' },
  pending: { label: 'В ожидании', color: 'text-gray-600', bg: 'bg-gray-100', icon: 'Clock' },
};

const IntegrationLogs = () => {
  const [systemFilter, setSystemFilter] = useState<IntegrationSystem | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<LogStatus | 'all'>('all');
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const filtered = useMemo(() => LOGS.filter(l => {
    if (systemFilter !== 'all' && l.system !== systemFilter) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (searchQuery && !l.operation.toLowerCase().includes(searchQuery.toLowerCase()) && !l.entityId?.includes(searchQuery)) return false;
    return true;
  }), [systemFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => ({
    total: LOGS.length,
    success: LOGS.filter(l => l.status === 'success').length,
    errors: LOGS.filter(l => l.status === 'error').length,
    warnings: LOGS.filter(l => l.status === 'warning').length,
    avgDuration: Math.round(LOGS.filter(l => l.duration > 0).reduce((s, l) => s + l.duration, 0) / LOGS.filter(l => l.duration > 0).length),
  }), []);

  return (
    <div className="p-6 flex gap-6 h-full overflow-hidden">
      {/* Основная панель */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Метрики */}
        <div className="grid grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Всего запросов', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Успешных', value: stats.success, color: 'text-green-700', bg: 'bg-green-50' },
            { label: 'Ошибок', value: stats.errors, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Предупреждений', value: stats.warnings, color: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Ср. время, мс', value: stats.avgDuration, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(m => (
            <div key={m.label} className={`${m.bg} border border-gray-200 rounded-lg p-3 text-center`}>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск по операции или ID..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={systemFilter} onChange={e => setSystemFilter(e.target.value as IntegrationSystem | 'all')} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700">
            <option value="all">Все системы</option>
            {(Object.keys(systemConfig) as IntegrationSystem[]).map(s => (
              <option key={s} value={s}>{systemConfig[s].label}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as LogStatus | 'all')} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700">
            <option value="all">Все статусы</option>
            {(Object.keys(statusConfig) as LogStatus[]).map(s => (
              <option key={s} value={s}>{statusConfig[s].label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <div
              onClick={() => setAutoRefresh(r => !r)}
              className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${autoRefresh ? 'bg-blue-500' : 'bg-gray-200'}`}
              style={{ height: '18px', width: '32px' }}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            Авто-обновление
          </label>
          <Button variant="outline" size="sm">
            <Icon name="RefreshCw" size={13} className="mr-1.5" />
            Обновить
          </Button>
        </div>

        {/* Таблица */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto h-full">
            <ScrollArea className="h-full">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-36">Время</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-24">Система</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">Операция</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-28">Сущность</th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-28">Статус</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-500 w-20">Время, мс</th>
                    <th className="text-right p-3 text-xs font-medium text-gray-500 w-16">Попытки</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(log => {
                    const sys = systemConfig[log.system];
                    const sts = statusConfig[log.status];
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelected(log)}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${selected?.id === log.id ? 'bg-blue-50' : ''}`}
                      >
                        <td className="p-3 font-mono text-xs text-gray-500">{log.timestamp.split(' ')[1]}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${sys.bg} ${sys.color} font-medium`}>
                            {sys.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-xs text-gray-800 break-all">{log.operation}</span>
                        </td>
                        <td className="p-3">
                          {log.entityId && (
                            <div>
                              <span className="text-xs text-blue-600">{log.entityId}</span>
                              <span className="text-xs text-gray-400 ml-1">({log.entityType})</span>
                            </div>
                          )}
                          {!log.entityId && log.entityType && (
                            <span className="text-xs text-gray-400">{log.entityType}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${sts.bg} ${sts.color}`}>
                            <Icon name={sts.icon} size={11} />
                            {sts.label}
                          </span>
                        </td>
                        <td className={`p-3 text-right font-mono text-xs ${log.duration > 2000 ? 'text-red-600' : log.duration > 500 ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {log.duration > 0 ? log.duration : '—'}
                        </td>
                        <td className="p-3 text-right">
                          {log.retries > 0 && (
                            <span className="text-xs text-orange-600 font-medium">{log.retries}×</span>
                          )}
                          {log.retries === 0 && <span className="text-xs text-gray-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Детальная панель */}
      {selected && (
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Детали запроса</span>
            <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded">
              <Icon name="X" size={15} className="text-gray-400" />
            </button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Система</span>
                  <span className={`font-medium ${systemConfig[selected.system].color}`}>{systemConfig[selected.system].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Время</span>
                  <span className="text-gray-700 font-mono text-xs">{selected.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Длительность</span>
                  <span className={`font-mono text-xs ${selected.duration > 2000 ? 'text-red-600' : 'text-gray-700'}`}>
                    {selected.duration > 0 ? `${selected.duration} мс` : 'В процессе'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Попытки</span>
                  <span className="text-gray-700">{selected.retries + 1}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Операция</p>
                <code className="text-xs bg-gray-100 text-gray-800 p-2 rounded block break-all font-mono">{selected.operation}</code>
              </div>

              {selected.errorMessage && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-1">Ошибка</p>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">{selected.errorMessage}</div>
                </div>
              )}

              {selected.requestBody && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Запрос</p>
                  <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto whitespace-pre-wrap font-mono">
                    {(() => { try { return JSON.stringify(JSON.parse(selected.requestBody!), null, 2); } catch { return selected.requestBody; } })()}
                  </pre>
                </div>
              )}

              {selected.responseBody && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Ответ</p>
                  <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto whitespace-pre-wrap font-mono">
                    {(() => { try { return JSON.stringify(JSON.parse(selected.responseBody!), null, 2); } catch { return selected.responseBody; } })()}
                  </pre>
                </div>
              )}
            </div>
          </ScrollArea>
          {selected.status === 'error' && (
            <div className="p-3 border-t border-gray-100">
              <Button size="sm" className="w-full" variant="outline">
                <Icon name="RefreshCw" size={13} className="mr-1.5" />
                Повторить запрос
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntegrationLogs;
