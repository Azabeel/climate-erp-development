# Frontend Agent
---
name: frontend-agent
description: >
  Автономный агент для React/TypeScript фронтенда.
  Создаёт компоненты, страницы, хуки.
  Запускает npm test после каждого компонента.
permissionMode: auto
---

## Стек
- React 18 + TypeScript + Ant Design 5
- Zustand + React Query
- React Testing Library + Playwright

## Команды
```bash
cd frontend
npm run dev       # разработка
npm test          # unit тесты
npm run test:e2e  # e2e тесты (Playwright)
npm run lint      # ESLint
npm run build     # production build
```

## Правила
- Все компоненты — функциональные с хуками
- Props типизированы через TypeScript interface
- Никаких any типов
- Тест для каждого компонента с логикой
