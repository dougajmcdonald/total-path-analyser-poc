// Lorcana card data types and validation schemas

import { z } from "zod";

// Rule configuration types
export const ruleConfigSchema = z.enum(["infinity", "core-constructed"]);

export const ruleConfigs = {
  infinity: {
    name: "Infinity",
    description: "All sets (1-9)",
    validSetNums: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  "core-constructed": {
    name: "Core Constructed",
    description: "Sets 5-9 only",
    validSetNums: [5, 6, 7, 8, 9],
  },
};

// Base card schema for the raw API data (PascalCase)
export const RawLorcanaCardSchema = z.object({
  Artist: z.string().optional(),
  Set_Name: z.string(),
  Classifications: z.string().optional(),
  Date_Added: z.string(),
  Set_Num: z.number(),
  Color: z.string(),
  Gamemode: z.string().optional(),
  Franchise: z.string().optional(),
  Image: z.string().url().optional(),
  Cost: z.number(),
  Inkable: z.boolean(),
  Name: z.string(),
  Type: z.enum(["Character", "Action", "Action - Song", "Item", "Location"]),
  Lore: z.number().optional(),
  Rarity: z.enum(["Common", "Uncommon", "Rare", "Super Rare", "Legendary"]),
  Flavor_Text: z.string().optional(),
  Unique_ID: z.string(),
  Card_Num: z.number(),
  Body_Text: z.string().optional(),
  Willpower: z.number().optional(),
  Card_Variants: z.string().optional(),
  Date_Modified: z.string(),
  Strength: z.number().optional(),
  Set_ID: z.string(),
  Move_Cost: z.number().optional(),
  Abilities: z.string().optional(),
});

// Transformed card schema (camelCase)
export const LorcanaCardSchema = z.object({
  artist: z.string().optional(),
  setName: z.string(),
  classifications: z.string().optional(),
  dateAdded: z.string(),
  setNum: z.number(),
  color: z.string(),
  gamemode: z.string().optional(),
  franchise: z.string().optional(),
  image: z.string().url().optional(),
  cost: z.number(),
  inkable: z.boolean(),
  name: z.string(),
  type: z.enum(["character", "action", "action - song", "item", "location"]),
  lore: z.number().optional(),
  rarity: z.enum(["common", "uncommon", "rare", "super rare", "legendary"]),
  flavorText: z.string().optional(),
  uniqueId: z.string(),
  cardNum: z.number(),
  bodyText: z.string().optional(),
  willpower: z.number().optional(),
  cardVariants: z.string().optional(),
  dateModified: z.string(),
  strength: z.number().optional(),
  setId: z.string(),
  moveCost: z.number().optional(),
  abilities: z.string().optional(),
});

// Array schemas
export const RawLorcanaCardsSchema = z.array(RawLorcanaCardSchema);
export const LorcanaCardsSchema = z.array(LorcanaCardSchema);

// Type inference
export const RawLorcanaCard = RawLorcanaCardSchema;
export const LorcanaCard = LorcanaCardSchema;
export const RawLorcanaCards = RawLorcanaCardsSchema;
export const LorcanaCards = LorcanaCardsSchema;

// TypeScript-style type exports (for JSDoc)
/**
 * @typedef {z.infer<typeof RawLorcanaCardSchema>} RawLorcanaCard
 * @typedef {z.infer<typeof LorcanaCardSchema>} LorcanaCard
 * @typedef {z.infer<typeof RawLorcanaCardsSchema>} RawLorcanaCards
 * @typedef {z.infer<typeof LorcanaCardsSchema>} LorcanaCards
 */

// Validation helpers
export function validateRawCard(data) {
  return RawLorcanaCardSchema.parse(data);
}

export function validateCard(data) {
  return LorcanaCardSchema.parse(data);
}

export function validateRawCards(data) {
  return RawLorcanaCardsSchema.parse(data);
}

export function validateCards(data) {
  return LorcanaCardsSchema.parse(data);
}

// Safe validation helpers (returns success/error instead of throwing)
export function safeValidateRawCard(data) {
  return RawLorcanaCardSchema.safeParse(data);
}

export function safeValidateCard(data) {
  return LorcanaCardSchema.safeParse(data);
}

export function safeValidateRawCards(data) {
  return RawLorcanaCardsSchema.safeParse(data);
}

export function safeValidateCards(data) {
  return LorcanaCardsSchema.safeParse(data);
}

// Rule config validation
export function validateRuleConfig(config) {
  return ruleConfigSchema.parse(config);
}

export function safeValidateRuleConfig(config) {
  return ruleConfigSchema.safeParse(config);
}
