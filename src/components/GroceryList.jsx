import { useMemo } from "react";
import { findRecipe } from "../lib/recipes";
import { TrashIcon } from "./Icons";

export default function GroceryList({ mealPlan, checked, onChangeChecked, onClearPlan }) {
  const grouped = useMemo(() => {
    const map = new Map(); // itemNameLower -> { label, occurrences: [{amount, recipeTitle}] }

    const recipeIds = new Set(Object.values(mealPlan).filter(Boolean));
    for (const recipeId of recipeIds) {
      const recipe = findRecipe(recipeId);
      if (!recipe) continue;

      const addItem = (name, amount) => {
        const key = name.trim().toLowerCase();
        if (!map.has(key)) map.set(key, { label: name.trim(), occurrences: [] });
        map.get(key).occurrences.push({ amount, recipeTitle: recipe.title });
      };

      for (const group of recipe.ingredient_groups || []) {
        for (const item of group.items || []) {
          addItem(item.item, item.amount);
        }
      }
      if (recipe.fruit) addItem(recipe.fruit.item, recipe.fruit.amount);
    }

    return Array.from(map.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [mealPlan]);

  const hasPlan = Object.keys(mealPlan).length > 0;

  if (!hasPlan) {
    return (
      <div className="empty-state">
        <div className="font-display">Belum ada rencana makan</div>
        <div>Tambahkan resep ke rencana makan mingguan untuk membuat daftar belanja otomatis.</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: "0.82rem", color: "var(--color-ink-faint)" }}>
          {grouped.length} bahan dari rencana makan saat ini
        </div>
        <button className="btn btn-ghost" onClick={onClearPlan}>
          <TrashIcon style={{ width: 14, height: 14 }} />
          Kosongkan
        </button>
      </div>

      {grouped.map((entry) => {
        const isChecked = !!checked[entry.key];
        return (
          <label
            className="card"
            key={entry.key}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 14px",
              opacity: isChecked ? 0.5 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() =>
                onChangeChecked({ ...checked, [entry.key]: !isChecked })
              }
              style={{ marginTop: 3 }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 700,
                  textDecoration: isChecked ? "line-through" : "none",
                }}
              >
                {entry.label}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)", marginTop: 2 }}>
                {entry.occurrences.map((o, i) => (
                  <div key={i}>
                    {o.amount || "secukupnya"} — {o.recipeTitle}
                  </div>
                ))}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
