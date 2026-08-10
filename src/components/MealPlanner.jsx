import { useMemo, useState } from "react";
import { filterRecipes, findRecipe, AGE_STAGE_ORDER } from "../lib/recipes";
import { ArrowLeftIcon, SearchIcon } from "./Icons";

const DAY_LABELS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const MEAL_SLOTS = ["Sarapan", "Camilan Pagi", "Makan Siang", "Makan Malam"];

function startOfWeek(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function MealPlanner({ mealPlan, onChangeMealPlan, activeBaby, prefillRecipeId, onConsumedPrefill }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [picking, setPicking] = useState(
    prefillRecipeId ? { autoRecipeId: prefillRecipeId } : null
  );

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  function slotKey(dateStr, slot) {
    return `${dateStr}|${slot}`;
  }

  function assign(dateStr, slot, recipeId) {
    onChangeMealPlan({ ...mealPlan, [slotKey(dateStr, slot)]: recipeId });
    setPicking(null);
    onConsumedPrefill?.();
  }

  function clear(dateStr, slot) {
    const next = { ...mealPlan };
    delete next[slotKey(dateStr, slot)];
    onChangeMealPlan(next);
  }

  if (picking) {
    return (
      <SlotPicker
        picking={picking}
        activeBaby={activeBaby}
        days={days}
        onCancel={() => {
          setPicking(null);
          onConsumedPrefill?.();
        }}
        onPick={assign}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() - 7);
            setWeekStart(d);
          }}
        >
          ← Minggu lalu
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + 7);
            setWeekStart(d);
          }}
        >
          Minggu depan →
        </button>
      </div>

      {days.map((d, i) => {
        const dateStr = isoDate(d);
        return (
          <div className="day-block" key={dateStr}>
            <div className="day-label">
              {DAY_LABELS[i]}, {d.getDate()}/{d.getMonth() + 1}
            </div>
            {MEAL_SLOTS.map((slot) => {
              const recipeId = mealPlan[slotKey(dateStr, slot)];
              const recipe = recipeId ? findRecipe(recipeId) : null;
              return (
                <div className="slot-row" key={slot}>
                  <span className="slot-meal-label">{slot}</span>
                  <span
                    className={`slot-recipe${recipe ? "" : " empty"}`}
                    onClick={() => setPicking({ dateStr, slot })}
                  >
                    {recipe ? recipe.title : "Pilih resep..."}
                  </span>
                  {recipe && (
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px" }}
                      onClick={() => clear(dateStr, slot)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function SlotPicker({ picking, activeBaby, days, onCancel, onPick }) {
  const [dateStr, setDateStr] = useState(picking.dateStr || isoDate(days[0]));
  const [slot, setSlot] = useState(picking.slot || MEAL_SLOTS[0]);
  const [ageStage, setAgeStage] = useState(null);
  const [query, setQuery] = useState("");
  const [mealType, setMealType] = useState(
    picking.slot === "Camilan Pagi" ? "camilan" : null
  );

  // Hooks must run unconditionally on every render, so this is computed
  // even in "autoRecipeId" mode where it ends up unused.
  const results = useMemo(
    () =>
      filterRecipes({
        ageStage,
        query,
        mealType,
        excludeAllergens: activeBaby?.allergies || [],
      }),
    [ageStage, query, mealType, activeBaby]
  );

  // Came from "Tambah ke rencana" on a recipe's detail page: the recipe is
  // already chosen, only the day/slot need picking.
  if (picking.autoRecipeId) {
    const recipe = findRecipe(picking.autoRecipeId);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0 8px" }}>
          <button className="icon-btn" onClick={onCancel} aria-label="Batal">
            <ArrowLeftIcon style={{ width: 18, height: 18 }} />
          </button>
          <div className="font-display" style={{ fontSize: "1.1rem" }}>Tambah ke rencana</div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 10 }}>{recipe?.title}</div>
          <div className="field">
            <label>Hari</label>
            <select value={dateStr} onChange={(e) => setDateStr(e.target.value)}>
              {days.map((d) => (
                <option key={isoDate(d)} value={isoDate(d)}>
                  {DAY_LABELS[(d.getDay() + 6) % 7]}, {d.getDate()}/{d.getMonth() + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Waktu makan</label>
            <select value={slot} onChange={(e) => setSlot(e.target.value)}>
              {MEAL_SLOTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={() => onPick(dateStr, slot, picking.autoRecipeId)}
          >
            Simpan ke rencana
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0 8px" }}>
        <button className="icon-btn" onClick={onCancel} aria-label="Batal">
          <ArrowLeftIcon style={{ width: 18, height: 18 }} />
        </button>
        <div className="font-display" style={{ fontSize: "1.1rem" }}>Pilih resep</div>
      </div>

      <div style={{ fontSize: "0.82rem", color: "var(--color-ink-soft)", marginBottom: 10 }}>
        Untuk {slot}, {DAY_LABELS[(new Date(dateStr).getDay() + 6) % 7]}
      </div>

      <div style={{ position: "relative" }}>
        <SearchIcon
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: "var(--color-ink-faint)" }}
        />
        <input
          className="search-input"
          style={{ paddingLeft: 38 }}
          placeholder="Cari resep..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="segmented">
        <button
          className={mealType === null ? "active" : ""}
          onClick={() => setMealType(null)}
        >
          Semua Menu
        </button>
        <button
          className={mealType === "utama" ? "active" : ""}
          onClick={() => setMealType("utama")}
        >
          Menu Utama
        </button>
        <button
          className={mealType === "camilan" ? "active" : ""}
          onClick={() => setMealType("camilan")}
        >
          🍪 Camilan
        </button>
      </div>

      <div className="filter-row">
        <div className={`select-pill${ageStage ? " has-value" : ""}`}>
          <select
            value={ageStage || ""}
            onChange={(e) => setAgeStage(e.target.value || null)}
            aria-label="Filter usia"
          >
            <option value="">Semua usia</option>
            {AGE_STAGE_ORDER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {results.map((r) => (
        <button key={r.id} className="recipe-card" onClick={() => onPick(dateStr, slot, r.id)}>
          <div className="recipe-card-body">
            <div className="recipe-card-title">{r.title}</div>
            <span className="badge">{r.age_stage}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
