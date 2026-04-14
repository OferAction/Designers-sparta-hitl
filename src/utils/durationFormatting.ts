export const formatDuration = (secondsInput: number | string): string => {
  const seconds = typeof secondsInput === "string" ? parseFloat(secondsInput) : secondsInput;

  // Handle invalid or NaN input
  if (isNaN(seconds) || seconds < 0) return "Invalid duration";

  // Convert seconds to total nanoseconds (rounded)
  const totalNanoseconds = BigInt(Math.round(seconds * 1e9));

  if (totalNanoseconds === 0n) return "<1ns";

  // Time unit constants
  const NS = 1n;
  const US = 1_000n;
  const MS = 1_000_000n;
  const S = 1_000_000_000n;
  const M = 60n * S;
  const H = 60n * M;

  // Decompose
  let rem = totalNanoseconds;
  const hours = rem / H;
  rem %= H;
  const minutes = rem / M;
  rem %= M;
  const secondsWhole = rem / S;
  rem %= S;
  const milliseconds = rem / MS;
  rem %= MS;
  const microseconds = rem / US;
  rem %= US;
  const nanoseconds = rem / NS;

  const parts: string[] = [];
  if (hours > 0n) parts.push(`${hours}h`);
  if (minutes > 0n || hours > 0n) parts.push(`${minutes}m`);
  if (secondsWhole > 0n || parts.length > 0) parts.push(`${secondsWhole}s`);

  if (hours === 0n && minutes === 0n && secondsWhole === 0n) {
    if (milliseconds > 0n) parts.push(`${milliseconds.toString().slice(0, 2)}ms`);
    if (secondsWhole === 0n && milliseconds === 0n && microseconds > 0n) parts.push(`${microseconds.toString().slice(0, 2)}µs`);
    if (secondsWhole === 0n && milliseconds === 0n && microseconds === 0n && nanoseconds > 0n) parts.push(`${nanoseconds.toString().slice(0, 2)}ns`);
  }

  return parts.join(" ");
};
