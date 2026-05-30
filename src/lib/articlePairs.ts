export interface ArticlePair {
  from: string;
  to: string;
}

export const ARTICLE_PAIRS: Record<string, ArticlePair[]> = {
  EASY: [
    { from: "Football", to: "FIFA World Cup" },
    { from: "Paris", to: "France" },
    { from: "Piano", to: "Music" },
    { from: "Dog", to: "Animal" },
    { from: "Netflix", to: "Television" },
    { from: "Apple Inc.", to: "Steve Jobs" },
    { from: "Basketball", to: "National Basketball Association" },
    { from: "Coffee", to: "Caffeine" },
    { from: "Sun", to: "Solar System" },
    { from: "London", to: "United Kingdom" },
    { from: "New York City", to: "United States" },
    { from: "YouTube", to: "Google" },
    { from: "Elon Musk", to: "Tesla, Inc." },
    { from: "Albert Einstein", to: "Physics" },
    { from: "Pizza", to: "Italy" },
    { from: "Tennis", to: "Wimbledon Championships" },
    { from: "Tiger", to: "Mammal" },
    { from: "Volcano", to: "Earthquake" },
    { from: "Jazz", to: "Music" },
    { from: "Guitar", to: "Rock music" },
    { from: "Marathon", to: "Athens" },
    { from: "Amazon (company)", to: "Jeff Bezos" },
    { from: "Michael Jordan", to: "Chicago Bulls" },
    { from: "Mount Everest", to: "Nepal" },
    { from: "Chocolate", to: "Cocoa bean" },
  ],
  MEDIUM: [
    { from: "Roman Empire", to: "French Revolution" },
    { from: "William Shakespeare", to: "Hamlet" },
    { from: "DNA", to: "Charles Darwin" },
    { from: "Ludwig van Beethoven", to: "Symphony" },
    { from: "Abraham Lincoln", to: "American Civil War" },
    { from: "Photography", to: "Camera" },
    { from: "Dinosaur", to: "Extinction" },
    { from: "Electricity", to: "Thomas Edison" },
    { from: "Space Shuttle", to: "NASA" },
    { from: "Great Pyramid of Giza", to: "Ancient Egypt" },
    { from: "Attack on Pearl Harbor", to: "World War II" },
    { from: "Gravity", to: "Isaac Newton" },
    { from: "Penguin", to: "Antarctica" },
    { from: "Sushi", to: "Japan" },
    { from: "Democracy", to: "Ancient Greece" },
    { from: "Chess", to: "Russia" },
    { from: "Formula One", to: "Ferrari" },
    { from: "RMS Titanic", to: "Atlantic Ocean" },
    { from: "Harry Potter", to: "J. K. Rowling" },
    { from: "Quantum mechanics", to: "Physics" },
    { from: "Renaissance", to: "Florence" },
    { from: "Sherlock Holmes", to: "Arthur Conan Doyle" },
    { from: "Monopoly (game)", to: "Board game" },
    { from: "Printing press", to: "Johannes Gutenberg" },
    { from: "Moon landing", to: "Neil Armstrong" },
  ],
  HARD: [
    { from: "Photosynthesis", to: "Charles Darwin" },
    { from: "Black hole", to: "Isaac Newton" },
    { from: "Morse code", to: "World War I" },
    { from: "Penicillin", to: "World War II" },
    { from: "Periodic table", to: "Nuclear weapon" },
    { from: "Mesopotamia", to: "Roman Empire" },
    { from: "Viking", to: "Christopher Columbus" },
    { from: "Silk Road", to: "Marco Polo" },
    { from: "Byzantine Empire", to: "Ottoman Empire" },
    { from: "Quantum entanglement", to: "Albert Einstein" },
    { from: "CRISPR", to: "Genetics" },
    { from: "Feudalism", to: "Industrial Revolution" },
    { from: "Aztec", to: "Spanish Inquisition" },
    { from: "Stonehenge", to: "Bronze Age" },
    { from: "Pompeii", to: "Roman Empire" },
    { from: "Smallpox", to: "American Revolution" },
    { from: "Rosetta Stone", to: "Egyptian hieroglyphs" },
    { from: "Fermentation", to: "Louis Pasteur" },
    { from: "Socrates", to: "Plato" },
    { from: "Hippocrates", to: "Medicine" },
    { from: "Genghis Khan", to: "Silk Road" },
    { from: "Black Death", to: "Renaissance" },
    { from: "Alchemy", to: "Chemistry" },
    { from: "Nikola Tesla", to: "Thomas Edison" },
    { from: "Longitude", to: "Navigation" },
  ],
};

export function getRandomPair(difficulty: string): ArticlePair {
  const pairs = ARTICLE_PAIRS[difficulty] ?? ARTICLE_PAIRS["EASY"]!;
  return pairs[Math.floor(Math.random() * pairs.length)]!;
}

export function getAllPairs(): ArticlePair[] {
  return Object.values(ARTICLE_PAIRS).flat();
}
