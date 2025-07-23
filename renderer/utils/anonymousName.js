import axios from "axios";

const adjectives = [
  "Whispering", "Dancing", "Soaring", "Gentle", "Mystic",
  "Radiant", "Serene", "Vibrant", "Cosmic", "Ethereal",
  "Luminous", "Tranquil", "Enchanted", "Harmonious", "Celestial",
  "Dreamy", "Melodic", "Peaceful", "Magical", "Stellar",
  "Wandering", "Floating", "Glowing", "Twinkling", "Breezy",
  "Sparkling", "Misty", "Shimmering", "Drifting", "Gliding",
  "Swaying", "Murmuring", "Rustling", "Swishing", "Sighing",
  "Bubbling", "Gurgling", "Rippling", "Splashing", "Trickling",
  "Humming", "Buzzing", "Chirping", "Singing", "Whistling"
];

const nouns = [
  "Dreamer", "Wanderer", "Explorer", "Seeker", "Traveler",
  "Observer", "Listener", "Thinker", "Creator", "Artist",
  "Poet", "Writer", "Sage", "Mystic", "Visionary",
  "Spirit", "Soul", "Heart", "Mind", "Star",
  "Moon", "Sun", "Cloud", "Wind", "River",
  "Ocean", "Mountain", "Forest", "Garden", "Flower",
  "Tree", "Bird", "Butterfly", "Dragonfly", "Phoenix",
  "Dragon", "Unicorn", "Pegasus", "Griffin", "Angel",
  "Fairy", "Elf", "Dwarf", "Wizard", "Knight",
  "Princess", "Prince", "Queen", "King"
];

// Utility functions for localStorage with expiry
export function setWithExpiry(key, value, ttlMs) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttlMs,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

export function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    localStorage.removeItem(key);
    return null;
  }
}

// Utility function for logout
export function logout() {
  localStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("user-logged-out"));
}

// Generate anonymous name using nickname from localStorage (with expiry)
export const generateAnonymousName = () => {
  let nickname = "Guest";

  try {
    const user = getWithExpiry("user");
    nickname = user?.nickname || "Guest";
  } catch (e) {
    console.warn("Could not parse user from localStorage, using default nickname.");
  }

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  const hash = nickname
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10000;

  return `${adj}${noun}${hash}`;
};

// Validation function
export const isAnonymousName = (name) => {
  const hasAdj = adjectives.some(adj => name.includes(adj));
  const hasNoun = nouns.some(noun => name.includes(noun));
  const endsWithDigits = /\d+$/.test(name);

  return hasAdj && hasNoun && endsWithDigits;
};

// Add a global axios response interceptor for 401 Unauthorized
if (typeof window !== "undefined") {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token expired or unauthorized, reload the page
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
}
