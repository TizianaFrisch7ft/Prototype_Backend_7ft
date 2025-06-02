const rulesStore: Record<string, string> = {};

export const saveRulesText = (id: string, text: string): void => {
  rulesStore[id] = text;
};

export const getRulesText = (id: string): string | null => {
  return rulesStore[id] || null;
};
