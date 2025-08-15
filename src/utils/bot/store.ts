// bot/store.js
// Простейшее in-memory хранилище пользователей по chatId

export const users = new Map();

/**
 * Получить или создать пользователя
 */
export function getUser(chatId: number) {
  if (!users.has(chatId)) {
    users.set(chatId, {
      chatId,
      nickname: null,
      phone: null,
      bonus: 0,
      lastReview: null,
      lastPromo: null,
      step: null, // await_nickname | await_contact | await_review | await_promo | null
    });
  }
  return users.get(chatId);
}

/**
 * Обновить и сохранить пользователя
 */
export function setUser(chatId: number, patch: object) {
  const u = getUser(chatId);
  const next = { ...u, ...patch };
  users.set(chatId, next);
  return next;
}
