const COMPACT_FORMATTER = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1
});

const STANDARD_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

export function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  const abs = Math.abs(number);

  if (abs >= 1e15) {
    return number.toExponential(2).replace("+", "");
  }

  if (abs >= 1000) {
    return COMPACT_FORMATTER.format(number);
  }

  if (abs >= 100) {
    return STANDARD_FORMATTER.format(number);
  }

  if (abs >= 10) {
    return number.toFixed(number % 1 === 0 ? 0 : 1);
  }

  return number.toFixed(number % 1 === 0 ? 0 : 2);
}

export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainder}s`;
  }

  return `${remainder}s`;
}

