export const FAVORITE_LABELS: { [key: string]: string } = {
  favoriteColor: "Favorite Color",
  favoriteFood: "Favorite Food",
  favoriteSnack: "Favorite Snack",
  favoriteActivity: "Favorite Activity",
  favoriteHoliday: "Favorite Holiday",
  favoriteTimeOfDay: "Favorite Time of Day",
  favoriteSeason: "Favorite Season",
  favoriteAnimal: "Favorite Animal",
  favoriteDrink: "Favorite Drink",
  favoritePet: "Favorite Pet",
  favoriteShow: "Favorite Show",
};

export function favoritesObjectToArray(
  favoritesObj: any
): { label: string; value: string }[] {
  return Object.entries(FAVORITE_LABELS)
    .map(([key, label]) =>
      favoritesObj[key] ? { label, value: favoritesObj[key] } : null
    )
    .filter(Boolean) as { label: string; value: string }[];
}

export function getTrimmedText(text: string, limit = 200) {
  if (text.length <= limit) {
    return text;
  }

  return text.substring(0, limit).trim() + "…";
}
