import { format, formatDistance, isToday, isYesterday, isThisWeek } from 'date-fns';
import { ru } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  
  if (isToday(d)) {
    return `сегодня в ${format(d, 'HH:mm')}`;
  }
  if (isYesterday(d)) {
    return `вчера в ${format(d, 'HH:mm')}`;
  }
  if (isThisWeek(d)) {
    return format(d, 'EEEE в HH:mm', { locale: ru });
  }
  
  return format(d, 'dd MMM yyyy', { locale: ru });
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistance(new Date(date), new Date(), { 
    addSuffix: true,
    locale: ru 
  });
}

export function formatShortDate(date: string | Date): string {
  const d = new Date(date);
  
  if (isToday(d)) return 'Сегодня';
  if (isYesterday(d)) return 'Вчера';
  
  return format(d, 'dd MMM', { locale: ru });
}

export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}