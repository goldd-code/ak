export function getNextOccurrence(dueDate: string, frequency: string): Date {
  const date = new Date(dueDate + 'T00:00:00Z');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  if (frequency === 'none') return date;
  
  let nextDate = new Date(date);
  
  while (nextDate < today) {
    if (frequency === 'daily') {
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    } else if (frequency === 'weekly') {
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
    } else if (frequency === 'monthly') {
      const originalDay = date.getUTCDate();
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
      
      const daysInMonth = new Date(
        nextDate.getUTCFullYear(), 
        nextDate.getUTCMonth() + 1, 
        0
      ).getUTCDate();
      
      if (originalDay > daysInMonth) {
        nextDate.setUTCDate(daysInMonth);
      } else {
        nextDate.setUTCDate(originalDay);
      }
    } else if (frequency === 'yearly') {
      const originalDay = date.getUTCDate();
      const originalMonth = date.getUTCMonth();
      nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1);
      
      if (originalMonth === 1 && originalDay === 29) {
        const isLeap = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (!isLeap(nextDate.getUTCFullYear())) {
          nextDate.setUTCDate(28);
        }
      }
    }
  }
  return nextDate;
}

export function getCountdownInfo(subscription: any) {
  const nextDueDate = getNextOccurrence(subscription.dueDate, subscription.repeat);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  
  const timeDiff = nextDueDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  let text = '';
  let cssClass = '';
  
  if (daysLeft < 0) {
    text = 'Overdue!';
    cssClass = 'countdown-red';
  } else if (daysLeft === 0) {
    text = 'Today!';
    cssClass = 'countdown-red';
  } else if (daysLeft === 1) {
    text = 'Tomorrow';
    cssClass = 'countdown-red';
  } else if (daysLeft <= 3) {
    text = `${daysLeft} days left`;
    cssClass = 'countdown-orange';
  } else {
    text = `${daysLeft} days left`;
    cssClass = 'countdown-green';
  }
  
  return { 
    text, 
    cssClass, 
    daysLeft,
    nextDueDate
  };
}

export function formatDate(date: Date): string {
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}

export function getFrequencyShortcut(frequency: string): string {
  const map: { [key: string]: string } = {
    monthly: '/mo',
    weekly: '/wk',
    daily: '/day',
    yearly: '/yr',
    none: 'one-time'
  };
  return map[frequency] || frequency;
}