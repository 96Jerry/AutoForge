export const transformDate1 = (date: string) => {
  const [year, month, day] = date.split('-');
  const monthName = new Date(date).toLocaleString('en-US', { month: 'long' });

  return `${monthName} ${day}${getOrdinalSuffix(day)}`;
};

export const getOrdinalSuffix = (day: string) => {
  const lastDigit = day[day.length - 1];

  if (day === '11' || day === '12' || day === '13') {
    return 'th';
  }

  switch (lastDigit) {
    case '1':
      return 'st';
    case '2':
      return 'nd';
    case '3':
      return 'rd';
    default:
      return 'th';
  }
};

export const transformDate2 = (date: string) => {
  const [year, month, day] = date.split('-');
  const monthName = new Date(date).toLocaleString('en-US', { month: 'long' });

  return `${monthName.slice(0, 3)} ${day}${getOrdinalSuffix(day)}`;
};
