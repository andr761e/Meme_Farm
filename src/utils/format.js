const STANDARD_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0
});

const NAMED_NUMBER_SCALES = [
  { value: 1e3, short: "K", long: "Thousand" },
  { value: 1e6, short: "M", long: "Million" },
  { value: 1e9, short: "B", long: "Billion" },
  { value: 1e12, short: "T", long: "Trillion" },
  { value: 1e15, short: "Qa", long: "Quadrillion" },
  { value: 1e18, short: "Qi", long: "Quintillion" },
  { value: 1e21, short: "Sx", long: "Sextillion" },
  { value: 1e24, short: "Sp", long: "Septillion" },
  { value: 1e27, short: "Oc", long: "Octillion" },
  { value: 1e30, short: "No", long: "Nonillion" },
  { value: 1e33, short: "Dc", long: "Decillion" },
  { value: 1e36, short: "Ud", long: "Undecillion" },
  { value: 1e39, short: "Dd", long: "Duodecillion" },
  { value: 1e42, short: "Td", long: "Tredecillion" },
  { value: 1e45, short: "Qad", long: "Quattuordecillion" },
  { value: 1e48, short: "Qid", long: "Quindecillion" },
  { value: 1e51, short: "Sxd", long: "Sexdecillion" },
  { value: 1e54, short: "Spd", long: "Septendecillion" },
  { value: 1e57, short: "Ocd", long: "Octodecillion" },
  { value: 1e60, short: "Nod", long: "Novemdecillion" },
  { value: 1e63, short: "Vg", long: "Vigintillion" }
];
const ILLION_ONES = [
  null,
  { short: "U", long: "Un" },
  { short: "D", long: "Duo" },
  { short: "T", long: "Tre" },
  { short: "Qa", long: "Quattuor" },
  { short: "Qi", long: "Quin" },
  { short: "Sx", long: "Sex" },
  { short: "Sp", long: "Septen" },
  { short: "Oc", long: "Octo" },
  { short: "No", long: "Novem" }
];
const ILLION_TENS = {
  2: { short: "Vg", long: "Vigintillion" },
  3: { short: "Tg", long: "Trigintillion" },
  4: { short: "Qg", long: "Quadragintillion" },
  5: { short: "Qqg", long: "Quinquagintillion" },
  6: { short: "Sg", long: "Sexagintillion" },
  7: { short: "Spg", long: "Septuagintillion" },
  8: { short: "Og", long: "Octogintillion" },
  9: { short: "Ng", long: "Nonagintillion" },
  10: { short: "Ce", long: "Centillion" }
};
const NUMBER_SCALES = createNumberScales();

export function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  const abs = Math.abs(number);

  if (abs >= 1000) {
    return formatScaledNumber(number, "short", 1);
  }

  if (abs >= 100) {
    return STANDARD_FORMATTER.format(number);
  }

  if (abs >= 10) {
    return number.toFixed(number % 1 === 0 ? 0 : 1);
  }

  return number.toFixed(number % 1 === 0 ? 0 : 2);
}

export function formatLongScaleNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  const abs = Math.abs(number);

  if (abs < 1000000) {
    return formatNumber(number);
  }

  return formatScaledNumber(number, "long", 3);
}

export function formatFullNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: number % 1 === 0 ? 0 : 2
  });
}

function formatScaledNumber(number, scaleLabel, maximumFractionDigits) {
  const abs = Math.abs(number);
  const scale = [...NUMBER_SCALES].reverse().find((item) => abs >= item.value);

  if (!scale) {
    return STANDARD_FORMATTER.format(number);
  }

  const scaled = number / scale.value;
  const formatted = scaled.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits
  });

  return `${formatted}${scaleLabel === "short" ? scale.short : ` ${scale.long}`}`;
}

function createNumberScales() {
  const generatedScales = [];

  for (let illionIndex = 21; illionIndex <= 101; illionIndex += 1) {
    const scale = createIllionScale(illionIndex);

    if (scale) {
      generatedScales.push(scale);
    }
  }

  return [...NAMED_NUMBER_SCALES, ...generatedScales];
}

function createIllionScale(illionIndex) {
  const tens = Math.floor(illionIndex / 10);
  const ones = illionIndex % 10;
  const tensScale = ILLION_TENS[tens];

  if (!tensScale) {
    return null;
  }

  const onesScale = ILLION_ONES[ones];
  const exponent = (illionIndex + 1) * 3;

  return {
    value: 10 ** exponent,
    short: onesScale ? `${onesScale.short}${tensScale.short}` : tensScale.short,
    long: onesScale ? `${onesScale.long}${tensScale.long.toLowerCase()}` : tensScale.long
  };
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
