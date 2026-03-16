# BugTracker - Профессиональный баг-трекер с Канбан-доской

Полноценный веб-сервис для отслеживания задач и багов, работающий полностью на стороне клиента (PWA).

## 🚀 Возможности

- 📊 **Канбан-доска** с 5 статусами (To Do, In Progress, Testing, Done, Failed)
- 🎯 **Drag & Drop** перетаскивание задач с анимацией
- 📝 **Rich Text Editor** для описания задач (TipTap)
- 📎 **Вложения** файлов (хранятся в IndexedDB)
- 💬 **Комментарии** к задачам
- 📈 **Статистика** с красивыми графиками (Recharts)
- 🔍 **Глобальный поиск** по задачам
- ⌨️ **Горячие клавиши** для быстрой работы
- 🌓 **Темная/светлая тема**
- 📱 **Адаптивный дизайн**
- 💾 **Автосохранение** в localStorage + IndexedDB
- 🚀 **PWA** - работает офлайн

## 🛠 Технологии

- **Frontend**: React + TypeScript
- **Сборка**: Vite
- **Стили**: Tailwind CSS
- **UI Компоненты**: Shadcn/ui
- **Drag & Drop**: @dnd-kit
- **Хранилище**: IndexedDB + localStorage
- **Графики**: Recharts
- **Даты**: date-fns
- **Иконки**: Lucide React

## 📦 Установка

```bash
# Клонирование репозитория
git clone https://github.com/yourusername/bug-tracker.git
cd bug-tracker

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр сборки
npm run preview