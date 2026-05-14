import { useState } from 'react';
import { Search, MapPin, Clock, User, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Application, Employee } from '@/types/snrd';

interface AssignExecutorsProps {
  applications: Application[];
  employees: Employee[];
  getPriorityColor: (priority: string) => string;
}

interface EmployeeMatch {
  employee: Employee;
  matchScore: number;
  distance: number;
  availability: string;
  reasons: string[];
}

const AssignExecutors = ({ applications, employees, getPriorityColor }: AssignExecutorsProps) => {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const unassignedApplications = applications.filter(app =>
    app.status === 'Новая'
  );

  const calculateMatches = (app: Application): EmployeeMatch[] => {
    return employees
      .map(employee => {
        const reasons: string[] = [];
        let score = 50;

        const isAvailable = employee.status === 'На смене';

        if (employee.competencies.includes(app.serviceTypeId)) {
          score += 30;
          reasons.push('Соответствует тип услуги');
        }

        if (employee.territory) {
          score += 20;
          reasons.push('Рабочая территория');
        }

        if (app.priority === 'Высокий' || app.priority === 'Срочно' || app.priority === 'Аварийный') {
          score += 15;
          reasons.push('Приоритетная заявка');
        }

        if (isAvailable) {
          score += 10;
          reasons.push('Доступен');
        }

        const distance = Math.floor(Math.random() * 25) + 1;
        if (distance < 10) {
          score += 10;
          reasons.push('Близко к объекту');
        }

        return {
          employee,
          matchScore: Math.min(score, 100),
          distance,
          availability: isAvailable ? 'Доступен' : 'Занят',
          reasons,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const filteredApplications = unassignedApplications.filter(app =>
    app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.serviceTypeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMatchColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Назначение исполнителей</h2>
        <p className="text-gray-600 mt-1">Подбор оптимальных сотрудников для выполнения заявок</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Поиск заявок..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200 max-h-[calc(100vh-280px)] overflow-y-auto">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApplication(app)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedApplication?.id === app.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.number || app.id}</h3>
                    <p className="text-sm text-gray-600">Клиент: {app.clientId}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(app.priority)}`}>
                    {app.priority}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{app.objectId || 'Объект не указан'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>{app.createdAt}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                    {app.serviceTypeId}
                  </span>
                </div>
              </div>
            ))}

            {filteredApplications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Нет неназначенных заявок
              </div>
            )}
          </div>
        </div>

        <div>
          {selectedApplication ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Подбор сотрудников для: {selectedApplication.id}
                </h3>
                <p className="text-sm text-blue-700">
                  {selectedApplication.description || `Заявка № ${selectedApplication.number}`}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200 max-h-[calc(100vh-380px)] overflow-y-auto">
                {calculateMatches(selectedApplication).map((match, index) => (
                  <div key={match.employee.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{match.employee.fullName}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${match.employee.status === 'На смене' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {match.availability}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <User size={14} />
                            <span>{match.employee.position}</span>
                            <span className="text-gray-400">•</span>
                            <MapPin size={14} />
                            <span>{match.distance} км</span>
                          </div>

                          <div className="space-y-1 mb-2">
                            {match.reasons.map((reason, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                                {reason}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-2">
                            <TrendingUp size={14} className={getMatchColor(match.matchScore)} />
                            <span className={`text-sm font-semibold px-2 py-1 rounded ${getMatchColor(match.matchScore)}`}>
                              Соответствие: {match.matchScore}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => {
                          console.log('Assign', match.employee.id, 'to', selectedApplication.id);
                        }}
                      >
                        <ArrowRight size={16} className="mr-2" />
                        Назначить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <User className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Выберите заявку
              </h3>
              <p className="text-gray-600">
                Выберите заявку из списка слева для подбора исполнителей
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignExecutors;
