import { useMemo, useState } from "react";
import RecipeCard from "./RecipeCard";
import { AGE_STAGE_ORDER, filterRecipes } from "../lib/recipes";
import { SearchIcon, HeartIcon } from "./Icons";

export default function RecipeLibrary({
  favoriteIds,
  activeBaby,
  suggestedStage,
  onOpenRecipe,
}) {
  const [ageStage, setAgeStage] = useState(suggestedStage || null);
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [respectAllergies, setRespectAllergies] = useState(true);

  const excludeAllergens = useMemo(() => {
    if (!respectAllergies || !activeBaby) return [];
    return activeBaby.allergies || [];
  }, [respectAllergies, activeBaby]);

  const results = useMemo(
    () =>
      filterRecipes({
        ageStage,
        query,
        excludeAllergens,
        favoritesOnly,
        favoriteIds,
      }),
    [ageStage, query, excludeAllergens, favoritesOnly, favoriteIds]
  );

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 4 }}>
        <SearchIcon
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-ink-faint)",
            width: 18,
            height: 18,
          }}
        />
        <input
          className="search-input"
          style={{ paddingLeft: 38 }}
          placeholder="Cari resep atau bahan..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chip-row">
        <button
          className={`chip${ageStage === null ? " active" : ""}`}
          onClick={() => setAgeStage(null)}
        >
          Semua usia
        </button>
        {AGE_STAGE_ORDER.map((stage) => (
          <button
            key={stage}
            className={`chip${ageStage === stage ? " active" : ""}`}
            onClick={() => setAgeStage(stage === ageStage ? null : stage)}
          >
            {stage}
          </button>
        ))}
        <button
          className={`chip${favoritesOnly ? " active" : ""}`}
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          <HeartIcon
            filled={favoritesOnly}
            style={{ width: 13, height: 13, verticalAlign: -2, marginRight: 3 }}
          />
          Favorit
        </button>
      </div>

      {activeBaby?.allergies?.length > 0 && (
        <label
          className="checkbox-row"
          style={{ marginBottom: 12, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}
        >
          <input
            type="checkbox"
            checked={respectAllergies}
            onChange={(e) => setRespectAllergies(e.target.checked)}
          />
          <span style={{ fontSize: "0.85rem" }}>
            Sembunyikan resep dengan alergen {activeBaby.name ? `${activeBaby.name}` : "bayi"}{" "}
            ({activeBaby.allergies.join(", ")})
          </span>
        </label>
      )}

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="font-display">Tidak ada resep ditemukan</div>
          <div>Coba ubah filter usia, kata kunci, atau nonaktifkan filter alergen.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: "0.8rem", color: "var(--color-ink-faint)", marginBottom: 8 }}>
            {results.length} resep
          </div>
          {results.map((r) => (
            <RecipeCard key={r.id} recipe={r} onClick={() => onOpenRecipe(r.id)} />
          ))}
        </>
      )}
    </div>
  );
}
