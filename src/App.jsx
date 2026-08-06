import { useEffect, useState } from "react";
import { storage } from "./lib/storage";
import { ageInMonths, stageForMonths } from "./lib/age";
import { findRecipe } from "./lib/recipes";

import BottomNav from "./components/BottomNav";
import RecipeLibrary from "./components/RecipeLibrary";
import RecipeDetail from "./components/RecipeDetail";
import MealPlanner from "./components/MealPlanner";
import GroceryList from "./components/GroceryList";
import Tracker from "./components/Tracker";
import Profile from "./components/Profile";
import InfoGuide from "./components/InfoGuide";

const TAB_META = {
  recipes: { title: "Resep MPASI", subtitle: "Untuk bayi, balita & ibu hamil" },
  planner: { title: "Rencana Makan", subtitle: "Susun menu seminggu ke depan" },
  grocery: { title: "Daftar Belanja", subtitle: "Otomatis dari rencana makan" },
  tracker: { title: "Riwayat Makan", subtitle: "Pantau makanan & reaksi" },
  info: { title: "Info & Tips", subtitle: "GTM, alergi, tekstur, dan lainnya" },
  profile: { title: "Profil Anak", subtitle: "Usia, tahapan tekstur & alergi" },
};

export default function App() {
  const [tab, setTab] = useState("recipes");
  const [openRecipeId, setOpenRecipeId] = useState(null);
  const [plannerPrefillId, setPlannerPrefillId] = useState(null);

  const [babies, setBabies] = useState(() => storage.read(storage.KEYS.babies, []));
  const [activeBabyId, setActiveBabyId] = useState(() =>
    storage.read(storage.KEYS.activeBabyId, null)
  );
  const [favorites, setFavorites] = useState(() => storage.read(storage.KEYS.favorites, []));
  const [mealPlan, setMealPlan] = useState(() => storage.read(storage.KEYS.mealPlan, {}));
  const [groceryChecked, setGroceryChecked] = useState(() =>
    storage.read(storage.KEYS.groceryChecked, {})
  );
  const [trackerEntries, setTrackerEntries] = useState(() =>
    storage.read(storage.KEYS.trackerEntries, [])
  );

  useEffect(() => storage.write(storage.KEYS.babies, babies), [babies]);
  useEffect(() => storage.write(storage.KEYS.activeBabyId, activeBabyId), [activeBabyId]);
  useEffect(() => storage.write(storage.KEYS.favorites, favorites), [favorites]);
  useEffect(() => storage.write(storage.KEYS.mealPlan, mealPlan), [mealPlan]);
  useEffect(
    () => storage.write(storage.KEYS.groceryChecked, groceryChecked),
    [groceryChecked]
  );
  useEffect(
    () => storage.write(storage.KEYS.trackerEntries, trackerEntries),
    [trackerEntries]
  );

  const activeBaby = babies.find((b) => b.id === activeBabyId) || null;
  const suggestedStage = activeBaby
    ? stageForMonths(ageInMonths(activeBaby.birthdate))
    : null;

  function toggleFavorite(recipeId) {
    setFavorites((f) =>
      f.includes(recipeId) ? f.filter((id) => id !== recipeId) : [...f, recipeId]
    );
  }

  function openRecipe(id) {
    setOpenRecipeId(id);
  }

  function goToTab(key) {
    setTab(key);
    setOpenRecipeId(null);
  }

  const meta = TAB_META[tab];
  const openRecipe_ = openRecipeId ? findRecipe(openRecipeId) : null;

  return (
    <div className="app-shell">
      <div className="app-header">
        <h1 className="app-title">{openRecipe_ ? "Resep" : meta.title}</h1>
        <div className="app-subtitle">
          {openRecipe_ ? "Detail resep" : meta.subtitle}
        </div>
      </div>

      <div className="app-content">
        {openRecipe_ ? (
          <RecipeDetail
            recipe={openRecipe_}
            isFavorite={favorites.includes(openRecipe_.id)}
            onToggleFavorite={() => toggleFavorite(openRecipe_.id)}
            onBack={() => setOpenRecipeId(null)}
            onAddToPlan={() => {
              setPlannerPrefillId(openRecipe_.id);
              setTab("planner");
              setOpenRecipeId(null);
            }}
            onLogEaten={() =>
              setTrackerEntries((entries) => [
                {
                  id: crypto.randomUUID(),
                  date: new Date().toISOString().slice(0, 10),
                  foodName: openRecipe_.title,
                  reaction: "suka",
                  note: "",
                  babyId: activeBaby?.id || null,
                  babyName: activeBaby?.name || null,
                },
                ...entries,
              ])
            }
          />
        ) : tab === "recipes" ? (
          <RecipeLibrary
            favoriteIds={favorites}
            activeBaby={activeBaby}
            suggestedStage={suggestedStage}
            onOpenRecipe={openRecipe}
          />
        ) : tab === "planner" ? (
          <MealPlanner
            mealPlan={mealPlan}
            onChangeMealPlan={setMealPlan}
            activeBaby={activeBaby}
            prefillRecipeId={plannerPrefillId}
            onConsumedPrefill={() => setPlannerPrefillId(null)}
          />
        ) : tab === "grocery" ? (
          <GroceryList
            mealPlan={mealPlan}
            checked={groceryChecked}
            onChangeChecked={setGroceryChecked}
            onClearPlan={() => {
              if (confirm("Kosongkan seluruh rencana makan dan daftar belanja?")) {
                setMealPlan({});
                setGroceryChecked({});
              }
            }}
          />
        ) : tab === "tracker" ? (
          <Tracker
            entries={trackerEntries}
            onChangeEntries={setTrackerEntries}
            activeBaby={activeBaby}
          />
        ) : tab === "info" ? (
          <InfoGuide />
        ) : (
          <Profile
            babies={babies}
            activeBabyId={activeBabyId}
            onChangeBabies={setBabies}
            onSetActive={setActiveBabyId}
          />
        )}
      </div>

      <BottomNav active={tab} onChange={goToTab} />
    </div>
  );
}
