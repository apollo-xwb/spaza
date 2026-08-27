export type MenuCategory = "Burgers" | "Wings" | "Sides" | "Drinks";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  emoji: string;
}

export const CATEGORIES: MenuCategory[] = [
  "Burgers",
  "Wings",
  "Sides",
  "Drinks",
];

/** Prices are in KES (Kenyan Shilling). */
export const MENU: MenuItem[] = [
  {
    id: "smash-classic",
    name: "Classic Smash",
    description: "Double smashed beef, cheddar, house sauce, toasted bun.",
    price: 850,
    category: "Burgers",
    emoji: "🍔",
  },
  {
    id: "peri-chicken",
    name: "Peri-Peri Chicken",
    description: "Flame-grilled chicken fillet, peri mayo, slaw.",
    price: 780,
    category: "Burgers",
    emoji: "🐔",
  },
  {
    id: "veg-stack",
    name: "Veg Stack",
    description: "Crispy halloumi, roast pepper, rocket, garlic aioli.",
    price: 720,
    category: "Burgers",
    emoji: "🥬",
  },
  {
    id: "wings-6",
    name: "Rock Wings (6)",
    description: "Six wings tossed in your choice of hot or BBQ glaze.",
    price: 560,
    category: "Wings",
    emoji: "🍗",
  },
  {
    id: "wings-12",
    name: "Rock Wings (12)",
    description: "Twelve wings for the crew — double the fire.",
    price: 980,
    category: "Wings",
    emoji: "🔥",
  },
  {
    id: "loaded-fries",
    name: "Loaded Fries",
    description: "Skin-on fries, cheese sauce, crispy onions, chives.",
    price: 420,
    category: "Sides",
    emoji: "🍟",
  },
  {
    id: "onion-rings",
    name: "Onion Rings",
    description: "Beer-battered rings with smoky dip.",
    price: 350,
    category: "Sides",
    emoji: "🧅",
  },
  {
    id: "cola",
    name: "Cola",
    description: "Ice-cold 330ml can.",
    price: 150,
    category: "Drinks",
    emoji: "🥤",
  },
  {
    id: "lemonade",
    name: "House Lemonade",
    description: "Fresh-squeezed, lightly sparkling.",
    price: 220,
    category: "Drinks",
    emoji: "🍋",
  },
];

export function getMenuItem(id: string): MenuItem | undefined {
  return MENU.find((item) => item.id === id);
}

export function formatKES(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}
