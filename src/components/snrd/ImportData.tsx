import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const importTypes = [
  { id: 'clients', label: 'Клиенты', icon: 'Users', description: 'Импорт списка клиентов из Excel/CSV', fields: ['Наименование', 'Контактное лицо', 'Телефон', 'Email', 'ИНН', 'Адрес'] },
  { id: 'employees', label: 'Сотрудники', icon: 'UserCheck', description: 'Импорт выездных сотрудников', fields: ['ФИО', 'Должность', 'Телефон', 'Email', 'График', 'Компетенции'] },
  { id: 'equipment', label: 'Оборудование', icon: 'Wind', description: 'Импорт каталога оборудования клиентов', fields: ['Бренд', 'Модель', 'Серийный №', 'Клиент', 'Адрес объекта', 'Дата установки'] },
  { id: 'stock', label: 'Номенклатура склада', icon: 'Package', description: 'Импорт товаров и ЗИП из прайс-листа', fields: ['Артикул', 'Наименование', 'Единица', 'Кол-во', 'Цена закупки', 'Категория'] },
  { id: 'service-types', label: 'Виды работ', icon: 'ClipboardList', description: 'Импорт справочника услуг', fields: ['Название', 'Код', 'Длительность', 'Стоимость', 'Группа'] },
  { id: 'work-orders', label: 'История нарядов', icon: 'FileText', description: 'Импорт архива нарядов из другой системы', fields: ['Номер', 'Дата', 'Клиент', 'Объект', 'Статус', 'Сумма'] },
];

const importHistory = [
  { id: 'IMP-006', date: '12.05.2026 09:30', type: 'Клиенты', file: 'clients_may_2026.xlsx', rows: 87, success: 85, errors: 2, status: 'Завершён' },
  { id: 'IMP-005', date: '05.05.2026 14:20', type: 'Номенклатура склада', file: 'stock_catalog_v3.csv', rows: 234, success: 234, errors: 0, status: 'Завершён' },
  { id: 'IMP-004', date: '28.04.2026 10:00', type: 'Сотрудники', file: 'engineers_list.xlsx', rows: 15, success: 14, errors: 1, status: 'Завершён с ошибками' },
  { id: 'IMP-003', date: '20.04.2026 16:45', type: 'Оборудование', file: 'equipment_database.xlsx', rows: 412, success: 400, errors: 12, status: 'Завершён с ошибками' },
  { id: 'IMP-002', date: '15.04.2026 11:15', type: 'Виды работ', file: 'services_catalog.csv', rows: 48, success: 48, errors: 0, status: 'Завершён' },
  { id: 'IMP-001', date: '01.04.2026 09:00', type: 'История нарядов', file: 'archive_2025.xlsx', rows: 1240, success: 1240, errors: 0, status: 'Завершён' },
];

const statusColor: Record<string, string> = {
  'Завершён': 'bg-green-100 text-green-700',
  'Завершён с ошибками': 'bg-yellow-100 text-yellow-700',
  'В обработке': 'bg-blue-100 text-blue-700',
  'Ошибка': 'bg-red-100 text-red-700',
};

const ImportData = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const selected = importTypes.find(t => t.id === selectedType);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите тип данных для импорта</h3>
        <div className="grid grid-cols-3 gap-4">
          {importTypes.map(type => (
            <button
              key={type.id}
              onClick={() => { setSelectedType(type.id); setUploaded(false); }}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedType === type.id ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Icon name={type.icon as never} size={20} className={selectedType === type.id ? 'text-blue-600' : 'text-gray-500'} />
                </div>
                <span className="font-medium text-gray-900">{type.label}</span>
              </div>
              <p className="text-sm text-gray-500">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name={selected.icon as never} size={20} className="text-blue-600" />
              Импорт: {selected.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Ожидаемые поля:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selected.fields.map(f => (
                    <Badge key={f} className="bg-gray-100 text-gray-700">{f}</Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Icon name="Download" size={14} className="mr-1" />
                    Скачать шаблон Excel
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="FileText" size={14} className="mr-1" />
                    Скачать шаблон CSV
                  </Button>
                </div>
              </div>

              <div>
                {!uploaded ? (
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); setUploaded(true); }}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Icon name="Upload" size={32} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-1">Перетащите файл сюда</p>
                    <p className="text-sm text-gray-500 mb-4">или нажмите для выбора</p>
                    <Button size="sm" onClick={() => setUploaded(true)}>
                      Выбрать файл
                    </Button>
                    <p className="text-xs text-gray-400 mt-2">Поддерживаются: .xlsx, .xls, .csv</p>
                  </div>
                ) : (
                  <div className="border-2 border-green-300 bg-green-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Icon name="FileCheck" size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">clients_demo.xlsx</p>
                        <p className="text-sm text-gray-500">Найдено 87 строк данных</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Всего строк:</span>
                        <span className="font-medium">87</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Готово к импорту:</span>
                        <span className="font-medium text-green-600">85</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ошибки/дубликаты:</span>
                        <span className="font-medium text-red-600">2</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Icon name="Upload" size={14} className="mr-1" />
                        Импортировать (85)
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setUploaded(false)}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>История импортов</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">ID</th>
                <th className="pb-3 font-medium">Дата</th>
                <th className="pb-3 font-medium">Тип данных</th>
                <th className="pb-3 font-medium">Файл</th>
                <th className="pb-3 font-medium text-right">Строк</th>
                <th className="pb-3 font-medium text-right">Успешно</th>
                <th className="pb-3 font-medium text-right">Ошибок</th>
                <th className="pb-3 font-medium">Статус</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {importHistory.map(h => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="py-3 text-gray-500">{h.id}</td>
                  <td className="py-3 text-gray-600">{h.date}</td>
                  <td className="py-3 font-medium">{h.type}</td>
                  <td className="py-3 text-gray-600">{h.file}</td>
                  <td className="py-3 text-right">{h.rows}</td>
                  <td className="py-3 text-right text-green-600 font-medium">{h.success}</td>
                  <td className="py-3 text-right text-red-600 font-medium">{h.errors > 0 ? h.errors : '—'}</td>
                  <td className="py-3">
                    <Badge className={statusColor[h.status] || 'bg-gray-100 text-gray-700'}>{h.status}</Badge>
                  </td>
                  <td className="py-3">
                    {h.errors > 0 && (
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        <Icon name="AlertCircle" size={12} className="mr-1" />
                        Ошибки
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportData;
