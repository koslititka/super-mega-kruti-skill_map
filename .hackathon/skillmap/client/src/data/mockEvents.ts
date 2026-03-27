export interface MockEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  format: 'Онлайн' | 'Очно';
  direction: string;
  category: 'Вебинар' | 'МК' | 'ДОД' | 'Курс' | 'Профпроба';
  age_group: '6-7 кл' | '8-9 кл' | '10-11 кл';
  organizer: string;
  organizer_email: string;
  registration_link: string | null;
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: 1,
    title: 'Введение в Python: от нуля до первой программы',
    description: 'Разберём переменные, условия, циклы и функции. Напишем свою первую игру на Python — пошагово и без лишней теории.',
    date: '2026-04-05',
    time: '15:00',
    format: 'Онлайн',
    direction: 'Python',
    category: 'Вебинар',
    age_group: '8-9 кл',
    organizer: 'Иннополис',
    organizer_email: 'edu@innopolis.ru',
    registration_link: 'https://example.com/register/1',
  },
  {
    id: 2,
    title: 'GameDev за выходные: создай 2D-платформер',
    description: 'Двухдневный интенсив по разработке игры на Godot. Физика, анимация, уровни — всё с нуля до финального билда.',
    date: '2026-04-12',
    time: '10:00',
    format: 'Онлайн',
    direction: 'GameDev',
    category: 'МК',
    age_group: '8-9 кл',
    organizer: 'GameSchool',
    organizer_email: 'hello@gameschool.ru',
    registration_link: 'https://example.com/register/2',
  },
  {
    id: 3,
    title: 'День открытых дверей — Факультет ИТ Иннополис',
    description: 'Познакомьтесь с факультетом, пообщайтесь со студентами и преподавателями, посмотрите лаборатории и задайте вопросы.',
    date: '2026-04-19',
    time: '11:00',
    format: 'Очно',
    direction: 'Веб',
    category: 'ДОД',
    age_group: '10-11 кл',
    organizer: 'Иннополис',
    organizer_email: 'admission@innopolis.ru',
    registration_link: null,
  },
  {
    id: 4,
    title: 'Data Science: анализ данных для школьников',
    description: 'Работаем с pandas и matplotlib: строим графики, находим закономерности в реальных данных. Без скучной математики.',
    date: '2026-04-26',
    time: '14:00',
    format: 'Онлайн',
    direction: 'Data Science',
    category: 'Курс',
    age_group: '10-11 кл',
    organizer: 'SkillFactory',
    organizer_email: 'info@skillfactory.ru',
    registration_link: 'https://example.com/register/4',
  },
  {
    id: 5,
    title: 'C++ для олимпиадников: разбор задач ОГЭ',
    description: 'Алгоритмы, структуры данных, оптимизация. Разбираем реальные задачи ОГЭ и олимпиад по программированию.',
    date: '2026-05-03',
    time: '16:00',
    format: 'Онлайн',
    direction: 'C++',
    category: 'Вебинар',
    age_group: '8-9 кл',
    organizer: 'Codeforces Edu',
    organizer_email: 'edu@codeforces.com',
    registration_link: 'https://example.com/register/5',
  },
  {
    id: 6,
    title: '3D-моделирование в Blender: первая сцена',
    description: 'Создаём первый 3D-объект, работаем с материалами и освещением. Результат — готовый render для портфолио.',
    date: '2026-05-10',
    time: '13:00',
    format: 'Очно',
    direction: '3D',
    category: 'МК',
    age_group: '6-7 кл',
    organizer: 'Creative Hub',
    organizer_email: 'info@creativehub.ru',
    registration_link: null,
  },
];
