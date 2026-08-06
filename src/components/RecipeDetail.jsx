import { useState } from "react";
import TextureDial from "./TextureDial";
import { ArrowLeftIcon, HeartIcon, PlusIcon, CheckIcon } from "./Icons";
import { SOURCES } from "../lib/recipes";

const NUTRITION_LABELS = {
  energi_kkal: { label: "Energi", unit: "kkal" },
  protein_g: { label: "Protein", unit: "g" },
  lemak_g: { label: "Lemak", unit: "g" },
  karbohidrat_g: { label: "Karbo", unit: "g" },
  zat_besi_mg: { label: "Zat Besi", unit: "mg" },
  seng_mg: { label: "Seng", unit: "mg" },
};

const AKG_LABELS = {
  energi_percent: "Energi",
  protein_percent: "Protein",
  lemak_percent: "Lemak",
  karbohidrat_percent: "Karbo",
  zat_besi_percent: "Zat Besi",
};

export default function RecipeDetail({
  recipe,
  isFavorite,
  onToggleFavorite,
  onBack,
  onAddToPlan,
  onLogEaten,
}) {
  const [logged, setLogged] = useState(false);
  const source = SOURCES.find((s) => s.source_id === recipe.source_id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 8px" }}>
        <button className="icon-btn" onClick={onBack} aria-label="Kembali">
          <ArrowLeftIcon style={{ width: 18, height: 18 }} />
        </button>
        <button
          className={`icon-btn${isFavorite ? " active" : ""}`}
          onClick={onToggleFavorite}
          aria-label="Simpan ke favorit"
        >
          <HeartIcon filled={isFavorite} style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div className="detail-header">
        <h1 className="font-display" style={{ fontSize: "1.4rem" }}>{recipe.title}</h1>
      </div>

      <div className="recipe-meta-row">
        <span className="badge">{recipe.age_stage}</span>
        <span className="badge kkal">{recipe.servings} porsi</span>
        {recipe.meal_type === "camilan" && <span className="badge">🍪 Camilan</span>}
        <TextureDial ageStage={recipe.age_stage} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onAddToPlan}>
          <PlusIcon style={{ width: 16, height: 16 }} />
          Tambah ke rencana
        </button>
        <button
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={() => {
            onLogEaten();
            setLogged(true);
          }}
        >
          <CheckIcon style={{ width: 16, height: 16 }} />
          {logged ? "Tercatat" : "Catat dimakan"}
        </button>
      </div>

      {recipe.nutrition_per_serving && (
        <>
          <div className="section-title">Gizi per porsi</div>
          <div className="nutrition-grid">
            {Object.entries(recipe.nutrition_per_serving).map(([key, value]) => {
              const meta = NUTRITION_LABELS[key] || { label: key, unit: "" };
              return (
                <div className="nutrition-cell" key={key}>
                  <span className="nutrition-value">{value}{meta.unit}</span>
                  <span className="nutrition-label">{meta.label}</span>
                </div>
              );
            })}
          </div>
          {recipe.energy_contribution_percent != null && (
            <div style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)", marginTop: 8 }}>
              Kontribusi energi sekitar {recipe.energy_contribution_percent}% dari kebutuhan makanan
              tambahan sehari.
            </div>
          )}
        </>
      )}

      {recipe.nutrition_percent_akg && (
        <>
          <div className="section-title">Gizi per porsi (% AKG)</div>
          <div className="nutrition-grid">
            {Object.entries(recipe.nutrition_percent_akg)
              .filter(([key]) => key !== "akg_reference_age")
              .map(([key, value]) => (
                <div className="nutrition-cell" key={key}>
                  <span className="nutrition-value">{value}%</span>
                  <span className="nutrition-label">{AKG_LABELS[key] || key}</span>
                </div>
              ))}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)", marginTop: 8 }}>
            Persentase dari Angka Kecukupan Gizi (AKG) harian untuk usia{" "}
            {recipe.nutrition_percent_akg.akg_reference_age}, bukan nilai gram/kkal absolut.
          </div>
        </>
      )}

      {recipe.allergens?.length > 0 && (
        <>
          <div className="section-title">Alergen</div>
          <div className="allergen-list">
            {recipe.allergens.map((a) => (
              <span className="badge warn" key={a}>⚠ {a}</span>
            ))}
          </div>
        </>
      )}

      <div className="section-title">Bahan</div>
      {(recipe.ingredient_groups || []).map((group, gi) => (
        <div key={gi}>
          {group.group && <div className="ingredient-group-title">{group.group}</div>}
          {group.items.map((item, ii) => (
            <div className="ingredient-row" key={ii}>
              <span>{item.item}</span>
              {item.amount && <span className="ingredient-amount">{item.amount}</span>}
            </div>
          ))}
        </div>
      ))}

      {recipe.fruit && (
        <>
          <div className="ingredient-group-title">Buah</div>
          <div className="ingredient-row">
            <span>{recipe.fruit.item}</span>
            <span className="ingredient-amount">{recipe.fruit.amount}</span>
          </div>
        </>
      )}

      <div className="section-title">Cara Membuat</div>
      {(recipe.step_groups || []).map((group, gi) => (
        <div key={gi}>
          {group.section && <div className="step-group-title">{group.section}</div>}
          <ol className="step-list">
            {group.steps.map((step, si) => (
              <li key={si}>{step}</li>
            ))}
          </ol>
        </div>
      ))}

      {recipe.source_notes && (
        <div className="source-note">ℹ️ Catatan sumber: {recipe.source_notes}</div>
      )}

      <div className="disclaimer">
        Sumber: {source?.source_title || source?.source || "tidak diketahui"}
        {source?.publisher ? ` — ${source.publisher}` : ""}
        {source?.year ? `, ${source.year}` : ""}.
        <br />
        Informasi ini bukan pengganti saran medis. Konsultasikan dengan dokter
        untuk alergi, reaksi, atau masalah tumbuh kembang.
      </div>
    </div>
  );
}
