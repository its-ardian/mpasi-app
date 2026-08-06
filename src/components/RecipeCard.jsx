import TextureDial from "./TextureDial";

export default function RecipeCard({ recipe, onClick }) {
  const kcal = recipe.nutrition_per_serving?.energi_kkal;

  return (
    <button className="recipe-card" onClick={onClick}>
      <div className="recipe-card-body">
        <div className="recipe-card-title">{recipe.title}</div>
        <div className="recipe-meta-row">
          <span className="badge">{recipe.age_stage}</span>
          {recipe.meal_type === "camilan" && <span className="badge">🍪 Camilan</span>}
          {kcal != null && <span className="badge kkal">{kcal} kkal</span>}
          {recipe.allergens?.length > 0 && (
            <span className="badge warn">⚠ {recipe.allergens.length} alergen</span>
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          <TextureDial ageStage={recipe.age_stage} />
        </div>
      </div>
    </button>
  );
}
