# Алгоритм умного планирования

## Входные данные
- workOrderId — наряд для планирования
- dateFrom, dateTo — желаемый диапазон (опционально, по умолчанию: сегодня + 7 дней)

## Шаг 1: Расчёт total_duration

```
tasks = work_order.services (отсортированы по sort_order)

Для каждой задачи:
  duration = base_duration_minutes
  для каждого applied_modifier:
    duration += modifier.add_minutes
    duration *= modifier.multiply_factor

Построить критический путь:
  sequential_chain = []
  parallel_groups = {}  // группы параллельных задач

  for task in tasks:
    if task.execution_type == SEQUENTIAL:
      sequential_chain.append(task.duration)
    if task.execution_type == PARALLEL:
      parallel_groups[group_id].append(task.duration)
    if task.execution_type == REQUIRES_TWO:
      sequential_chain.append(task.duration)
      work_order.requires_two_engineers = TRUE

  total = sum(sequential_chain) + sum(max(group) for group in parallel_groups)
  total += 15 // буфер на переезд внутри объекта
```

## Шаг 2: Фильтрация инженеров

```
Для каждого активного инженера (is_active=true, use_in_auto_scheduler=true):

  1. Если work_order.requires_two_engineers:
     skip (обрабатывается отдельно — ищем пары)

  2. Проверить компетенции:
     required = UNION(service.required_competencies for service in work_order.services)
     if NOT (engineer.has_all_competencies OR engineer.competencies ⊇ required):
       skip

  3. Проверить сертификаты для бренда оборудования:
     brand_id = work_order.equipment.brand_id
     cert = engineer.certifications WHERE brand_id = ? AND expires_at > NOW()
     if NOT cert EXISTS:
       skip (добавить в список "нет сертификата" для UI предупреждения)
```

## Шаг 3: Поиск свободных окон

```
Для каждого подходящего инженера:
  schedule = EngineerSchedule(engineer_id, dates in [dateFrom, dateTo])
  existing_orders = WorkOrder WHERE engineer_id = ? 
                    AND scheduled_start IN [dateFrom, dateTo]
                    AND status NOT IN [CANCELLED]
  
  busy_slots = merge(existing_orders.time_ranges)
  free_slots = schedule.working_hours MINUS busy_slots
  
  valid_slots = [slot for slot in free_slots
                 if slot.duration >= total_duration + travel_time_estimate]
  
  // Важно: ищем вставку МЕЖДУ нарядами, не только в конец
  // Если инженер работает 9:00-18:00 и есть наряды 10:00-12:00 и 15:00-17:00,
  // то доступные окна: 9:00-10:00, 12:00-15:00, 17:00-18:00
```

## Шаг 4: Расчёт времени в пути

```
Для каждого валидного слота:
  prev_location = 
    if предыдущий наряд EXISTS:
      prev_order.location.coordinates
    else:
      engineer.home/office coordinates (по DayStartType)
  
  // Запрос к OSRM API
  route = osrm.route(prev_location, work_order.location.coordinates)
  travel_minutes = route.duration / 60
  
  // Корректируем: начало работы = начало слота + travel_minutes
  actual_work_start = slot.start + travel_minutes
  actual_work_end = actual_work_start + total_duration
  
  // Слот валиден если actual_work_end <= slot.end
  if actual_work_end > slot.end:
    skip этот слот
```

## Шаг 5: Проверка SLA

```
Для каждого валидного варианта:
  sla = work_order.sla_config
  
  ttf_deadline = work_order.created_at + sla.ttf_hours (в рабочих часах SLA)
  
  sla_compliance = actual_work_end <= ttf_deadline ? 1.0 : 0.0
  
  if sla_compliance == 0.0:
    // Вариант нарушает SLA — показываем, но помечаем предупреждением
    variant.sla_warning = TRUE
```

## Шаг 6: Скоринг и выбор топ-3

```
Для каждого варианта рассчитать score:

  // Нормализация для сравнения вариантов
  max_travel = max(travel_km for all variants)
  max_workload = max(engineer.today_workload for all engineers)
  
  score = 
    (sla_compliance * 40) +
    ((1 - travel_km / max_travel) * 30) +
    ((1 - engineer.today_workload / max_workload) * 20) +
    (cert_match_bonus * 10)  // 1.0 если все сертификаты в норме с запасом > 30 дней
  
  Отсортировать по score DESC
  Взять топ-3
```

## Шаг 7: Формирование объяснений (на русском)

```
Для каждого из топ-3:
  explanation = buildExplanation(variant):
    parts = []
    
    if sla_ok:
      parts.add("SLA выполняется с запасом {hours} ч")
    else:
      parts.add("⚠️ Нарушение SLA на {minutes} мин")
    
    parts.add("Время в пути: {travel_minutes} мин")
    
    if rank == 1:
      if best_geo: parts.add("Ближайший по маршруту")
      if best_sla: parts.add("Лучшее соответствие SLA")
    
    return join(parts, ", ")
```

## Ответ API

```json
{
  "suggestions": [
    {
      "rank": 1,
      "engineer": {
        "id": "...",
        "fullName": "Иванов Алексей Петрович",
        "phone": "+7...",
        "currentLocation": { "lat": 55.75, "lng": 37.61 }
      },
      "scheduledStart": "2025-06-15T10:00:00+03:00",
      "scheduledEnd": "2025-06-15T12:45:00+03:00",
      "travelMinutes": 25,
      "travelKm": 8.3,
      "slaCompliant": true,
      "slaWarning": false,
      "score": 87.5,
      "explanation": "Ближайший по маршруту, SLA с запасом 6 ч, время в пути 25 мин"
    },
    { "rank": 2, ... },
    { "rank": 3, ... }
  ],
  "totalDurationMinutes": 150,
  "hasParallelTasks": true,
  "requiresTwoEngineers": false,
  "calculatedAt": "2025-06-15T09:00:00+03:00"
}
```

## Случай REQUIRES_TWO_ENGINEERS

```
Получить все пары (engineer_i, engineer_j) из доступных инженеров
Для каждой пары:
  free_slots = INTERSECTION(
    engineer_i.free_slots,
    engineer_j.free_slots
  )
  Найти общие слоты длиной >= total_duration
  Рассчитать score как среднее двух инженеров
  
Вернуть топ-3 пар
```
