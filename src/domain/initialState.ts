import type { CardDefinition, GameState, InteractionRule, StorySegment } from './types';

export function createInitialState(
  cards: CardDefinition[],
  interactionRules: InteractionRule[],
  firstSegment: StorySegment
): GameState {
  return {
    currentSegmentId: firstSegment.id,
    storyStepIndex: 0,
    cards: Object.fromEntries(cards.map((card) => [card.id, card])),
    cardInstances: [],
    interactionRules,
    interactionStates: Object.fromEntries(
      interactionRules.map((rule) => [
        rule.id,
        { ruleId: rule.id, count: 0, completed: false }
      ])
    ),
    storyMode: true,
    activeLine: { kind: 'none' },
    flags: {},
    playerName: '洛德',
    awaitingName: false
  };
}
