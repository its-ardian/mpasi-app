import data from "../data/combined_recipes.json";

export const ALL_RECIPES = data.recipes;
export const SOURCES = data.sources;

export const AGE_STAGE_ORDER = [
  "6-8 bulan",
  "9-11 bulan",
  "12-23 bulan",
  "2-5 tahun",
  "ibu hamil",
];

export function allAllergens() {
  const set = new Set();
  for (const r of ALL_RECIPES) {
    for (const a of r.allergens || []) set.add(a);
  }
  return Array.from(set).sort();
}

export function findRecipe(id) {
  return ALL_RECIPES.find((r) => r.id === id) || null;
}

export function filterRecipes({ ageStage, query, excludeAllergens, favoritesOnly, favoriteIds }) {
  let list = ALL_RECIPES;

  if (ageStage) {
    list = list.filter((r) => r.age_stage === ageStage);
  }

  if (excludeAllergens && excludeAllergens.length > 0) {
    list = list.filter(
      (r) => !(r.allergens || []).some((a) => excludeAllergens.includes(a))
    );
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter((r) => {
      if (r.title.toLowerCase().includes(q)) return true;
      for (const group of r.ingredient_groups || []) {
        for (const item of group.items || []) {
          if (item.item.toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }

  if (favoritesOnly) {
    list = list.filter((r) => favoriteIds.includes(r.id));
  }

  return list;
}

export function ingredientNames(recipe) {
  const names = [];
  for (const group of recipe.ingredient_groups || []) {
    for (const item of group.items || []) {
      names.push(item.item);
    }
  }
  if (recipe.fruit) names.push(recipe.fruit.item);
  return names;
}
