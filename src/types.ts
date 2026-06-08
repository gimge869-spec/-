export interface FriendBirthday {
  id: string;
  name: string;
  date: string; // "YYYY-MM-DD"
  relationship: string;
  gender: string;
  ageGroup: string;
  memo?: string;
}

export interface GiftRecommendation {
  name: string;
  description: string;
  priceRange: string;
  whyItFits: string;
  tips: string;
  cozyFactor: number; // 1 to 5
}

export interface PredefinedGift {
  id: string;
  name: string;
  category: string; // "beauty" | "living" | "food" | "tech" | "fashion" | "healing" | "hobby"
  genders: string[]; // ["male", "female", "unisex"]
  ageGroups: string[]; // ["10s", "20s", "30s", "40s", "50s", "60s+"]
  budgetCategory: string; // "under_30k" | "30k_50k" | "50k_100k" | "100k_200k" | "over_200k"
  vibes: string[]; // ["practical", "emotional", "funny", "luxurious", "healing"]
  description: string;
  price: string;
  tips: string;
  rating: number; // Cozy level 1 to 5
}
