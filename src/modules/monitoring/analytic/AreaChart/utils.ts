export const getTimeFormat = (chartData: { timestamp: number }[]) => {
  if (chartData.length === 0) return "MMM D";

  const timestamps = chartData.map((d) => d.timestamp);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const rangeInMs = maxTime - minTime;

  // Convert to hours
  const rangeInHours = rangeInMs / (1000 * 60 * 60);
  const rangeInDays = rangeInHours / 24;

  // Determine format based on range
  if (rangeInHours <= 24) {
    // Less than a day - show hours
    return "HH:mm";
  } else if (rangeInDays <= 7) {
    // Less than a week - show day and time
    return "MMM D, HH:mm";
  } else if (rangeInDays <= 30) {
    // Less than a month - show date
    return "MMM D";
  } else if (rangeInDays <= 90) {
    // Less than 3 months - show date
    return "MMM D";
  } else {
    // Longer ranges - show month
    return "MMM YYYY";
  }
};
