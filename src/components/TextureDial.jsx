import { TEXTURE_STEPS, textureStepIndex } from "../lib/age";

// Renders a 4-segment dial showing where a recipe sits on the
// disaring -> dicincang halus -> dicincang kasar -> masakan biasa
// progression. For "ibu hamil" recipes (not on this scale) renders nothing.
export default function TextureDial({ ageStage, showLabel = true }) {
  const idx = textureStepIndex(ageStage);
  if (idx === -1) return null;

  return (
    <span className="texture-dial" title={TEXTURE_STEPS[idx].label}>
      {TEXTURE_STEPS.map((step, i) => (
        <span key={step.stage} className={`seg${i <= idx ? " filled" : ""}`} />
      ))}
      {showLabel && (
        <span className="texture-dial-label">{TEXTURE_STEPS[idx].short}</span>
      )}
    </span>
  );
}
