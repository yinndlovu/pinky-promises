export type FavoritesType = {
  favoriteColor?: string;
  favoriteFood?: string;
  favoriteSnack?: string;
  favoriteActivity?: string;
  favoriteHoliday?: string;
  favoriteTimeOfDay?: string;
  favoriteSeason?: string;
  favoriteAnimal?: string;
  favoriteDrink?: string;
  favoritePet?: string;
  favoriteShow?: string;
};

export type FavoriteItem = {
  label: string;
  value: string;
};

export type FavoritesProps = {
  favorites: FavoriteItem[];
  onEdit?: () => void;
};

export type PartnerFavoritesProps = {
  favorites: FavoriteItem[];
};
