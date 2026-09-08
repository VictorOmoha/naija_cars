export function conversationTarget(params, userId) {
  if (!userId) return null;
  const sellerId = params.get('sellerId');
  const id = sellerId ? [userId, sellerId].sort().join('_') : params.get('conversationId');
  if (!id) return null;
  const participants = id.split('_');
  const otherId = participants.find(participant => participant !== userId);
  if (participants.length !== 2 || !participants.includes(userId) || !otherId
    || ['undefined', 'null'].includes(otherId) || participants.slice().sort().join('_') !== id) return null;
  return { conversationId: id, otherId };
}

export function historyMessages(data) {
  // A new arrival can shift an offset page while older history is loading.
  const unique = new Map();
  for (const page of [...(data?.pages || [])].reverse()) {
    for (const message of page.messages) unique.set(message.id, message);
  }
  return [...unique.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt) || a.id.localeCompare(b.id));
}
