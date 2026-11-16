export function isCurrentZenzapResponse(requestTopic, currentTopic, requestSequence, latestSequence) {
  return Boolean(requestTopic) && requestTopic === currentTopic && requestSequence === latestSequence;
}
