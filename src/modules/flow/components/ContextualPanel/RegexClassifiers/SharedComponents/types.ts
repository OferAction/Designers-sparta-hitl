export const relevantMatchOptions = ["any", "first", "last"] as const;
export const flagOptions = ["NOFLAG", "IGNORECASE", "MULTILINE", "DOTALL", "VERBOSE"] as const;

export const defaultRegexAdvancedSettings = {
  context_range: 20,
  relevant_match: "any" as (typeof relevantMatchOptions)[number],
  flags: "NOFLAG" as (typeof flagOptions)[number],
} as const;
