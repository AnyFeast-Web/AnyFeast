from typing import List, Dict, Optional
from pydantic import BaseModel
from datetime import datetime

class MacroMeal(BaseModel):
    name: str
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int

class DateRange(BaseModel):
    start_date: datetime
    end_date: datetime

class NutritionTargets(BaseModel):
    calories: int
    protein_g: int
    carbs_g: int
    fat_g: int

class MealPlanBase(BaseModel):
    client_id: str
    title: str
    status: str = "draft"
    date_range: DateRange
    # grid: Dict[str, Dict[str, List[MacroMeal]]] # Day -> MealType -> Meals
    grid: Dict[str, Dict[str, List[MacroMeal]]]
    total_nutrition_targets: Optional[NutritionTargets] = None

class MealPlanCreate(MealPlanBase):
    pass

class MealPlanResponse(MealPlanBase):
    id: str
    nutritionist_id: str
    created_at: datetime
    updated_at: datetime
