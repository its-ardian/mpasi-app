// Maps a birthdate to an age-in-months figure, and that figure to the
// age_stage buckets actually used in combined_recipes.json.

export function ageInMonths(birthdateStr, today = new Date()) {
  if (!birthdateStr) return null;
  const birth = new Date(birthdateStr);
  if (Number.isNaN(birth.getTime())) return null;

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
}

// Order matters: this is also used to render the age-stage progression.
export const AGE_STAGES = ["6-8 bulan", "9-11 bulan", "12-23 bulan", "2-5 tahun"];

export function stageForMonths(months) {
  if (months === null) return null;
  if (months < 6) return "belum-mpasi";
  if (months <= 8) return "6-8 bulan";
  if (months <= 11) return "9-11 bulan";
  if (months <= 23) return "12-23 bulan";
  if (months <= 60) return "2-5 tahun";
  return "lebih-5-tahun";
}

export function stageLabel(stage) {
  switch (stage) {
    case "belum-mpasi":
      return "Belum waktunya MP-ASI (ASI eksklusif)";
    case "lebih-5-tahun":
      return "Di atas 5 tahun";
    default:
      return stage;
  }
}

// Texture progression, grounded in the Kemenkes texture-by-age table.
// Index = stage's position on the 4-step texture dial.
export const TEXTURE_STEPS = [
  { stage: "6-8 bulan", label: "Disaring", short: "Saring" },
  { stage: "9-11 bulan", label: "Dicincang Halus", short: "Cincang" },
  { stage: "12-23 bulan", label: "Dicincang Kasar", short: "Cincang Kasar" },
  { stage: "2-5 tahun", label: "Masakan Biasa", short: "Biasa" },
];

export function textureStepIndex(ageStage) {
  return TEXTURE_STEPS.findIndex((t) => t.stage === ageStage);
}
