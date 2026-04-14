export const formatSampleCount = (count: number): string => {
  if (count >= 10000) {
    return `${(count / 1000)?.toFixed(0)}k`;
  }
  return count.toLocaleString();
};
