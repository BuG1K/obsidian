enum UserStep {
  AwaitNickname = "await_nickname",
  AwaitContact = "await_contact",
}

const users = new Map();

const getUser = (chatId: number) => {
  if (!users.has(chatId)) {
    users.set(chatId, {
      chatId,
      step: null, // await_nickname | await_contact | await_review | await_promo | null
    });
  }

  return users.get(chatId);
};

const setUser = (chatId: number, patch: object) => {
  const u = getUser(chatId);
  const next = { ...u, ...patch };

  users.set(chatId, next);

  return next;
};

export { UserStep, users, getUser, setUser };
