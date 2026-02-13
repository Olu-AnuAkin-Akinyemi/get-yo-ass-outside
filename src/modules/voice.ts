/**
 * "The Voice" Module
 * Firm but caring prompts to get outside
 */

/**
 * Collection of prompts inspired by Black mothers, aunties, and grandmas
 * Firm, direct, but caring — never mean
 */
const prompts: string[] = [
  "You've been inside all day. That's enough. Get up.",
  "Phone down. Grass up. Let's go.",
  "Fresh air won't kill you, but that screen time might.",
  "I know you see the sun outside. Go touch some grass.",
  "When's the last time you saw a tree up close? Mm-hmm, that's what I thought.",
  "You got two good legs. Use 'em. Outside. Now.",
  "All that scrolling and you ain't moved an inch. Let's fix that.",
  "The park ain't gonna visit itself. Get moving.",
  "Eyes on a screen all day? Go rest 'em on some nature.",
  "You smell that? No? 'Cause you been inside. Go get some fresh air.",
  "Your body needs sunlight like plants need water. Go get some.",
  "Sitting inside looking at outside ain't the same. You know better.",
  "That vitamin D deficiency talking? Get outside.",
  "The birds are chirping and you in here on that phone. Come on now.",
  "Nature calling and you keep sending it to voicemail. Answer it."
];

/**
 * Get a random prompt from the collection
 * @returns A random prompt string
 */
export const getRandomPrompt = (): string => {
  const randomIndex = Math.floor(Math.random() * prompts.length);
  const prompt = prompts[randomIndex];
  
  // Fallback in case array is empty (should never happen)
  return prompt ?? 'You know what you need to do. Get outside.';
};

/**
 * Get all prompts (useful for testing or cycling through them)
 * @returns Array of all prompt strings
 */
export const getAllPrompts = (): string[] => {
  return [...prompts]; // Return a copy
};
