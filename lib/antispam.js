const submissions = new Map();
const SPAM_LIMIT = 3; // макс заявок
const SPAM_WINDOW = 60000; // за 1 минуту

export function checkSpam(userId, username) {
  const now = Date.now();
  const userSubmissions = submissions.get(userId) || [];
  
  const recentSubmissions = userSubmissions.filter(time => now - time < SPAM_WINDOW);
  
  if (recentSubmissions.length >= SPAM_LIMIT) {
    return {
      isSpam: true,
      message: `⏳ Слишком много заявок! Подождите ${Math.ceil((SPAM_WINDOW - (now - recentSubmissions[0])) / 1000)} секунд.`
    };
  }
  
  recentSubmissions.push(now);
  submissions.set(userId, recentSubmissions);
  
  setTimeout(() => {
    const current = submissions.get(userId) || [];
    submissions.set(userId, current.filter(time => Date.now() - time < SPAM_WINDOW));
  }, SPAM_WINDOW);
  
  return { isSpam: false };
}
