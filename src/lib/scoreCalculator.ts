export const calculateScore = (clicks: number, timeSeconds: number): { score: number; letterRank: string } => {
  let score = 1000;
  
  // Click penalty
  if (clicks > 5) {
    score -= (clicks - 5) * 50;
  }
  
  // Time bonus
  if (timeSeconds < 60) {
    score += 200;
  } else if (timeSeconds < 120) {
    score += 100;
  }
  
  score = Math.max(100, score);
  
  let letterRank = "C";
  if (score >= 900) letterRank = "S";
  else if (score >= 700) letterRank = "A";
  else if (score >= 400) letterRank = "B";
  
  return { score, letterRank };
};
