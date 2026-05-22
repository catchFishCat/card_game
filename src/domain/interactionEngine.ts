import type { CardInstance, GameCommand, GameState, InteractionAttempt, InteractionRule } from './types';

export type InteractionResolution = {
  state: GameState;
  commands: GameCommand[];
  rule: InteractionRule;
  attempt: InteractionAttempt;
};

export function clearValidTargetHighlights(state: GameState): GameState {
  return {
    ...state,
    cardInstances: state.cardInstances.map((card) => ({ ...card, highlightState: undefined }))
  };
}

export function applyValidTargetHighlights(state: GameState, sourceInstanceId: string): GameState {
  const source = findInstance(state, sourceInstanceId);
  if (!source || !source.enabled) return clearValidTargetHighlights(state);

  const sourceDefinition = state.cards[source.definitionId];
  const rules = findAvailableRulesForSource(state, sourceDefinition.id);
  const targetRuleIds = new Map(rules.map((rule) => [rule.targetCardId, rule.id]));

  return {
    ...state,
    cardInstances: state.cardInstances.map((card) => {
      const ruleId = targetRuleIds.get(card.definitionId);
      return {
        ...card,
        highlightState: ruleId && card.visible && card.enabled ? { kind: 'validTarget', ruleId } : undefined
      };
    })
  };
}

export function resolveInteraction(state: GameState, sourceInstanceId: string, targetInstanceId: string): InteractionResolution | undefined {
  const source = findInstance(state, sourceInstanceId);
  const target = findInstance(state, targetInstanceId);
  if (!source || !target || !source.enabled || !target.enabled) return undefined;

  const rule = state.interactionRules.find(
    (candidate) =>
      candidate.sourceCardId === source.definitionId &&
      candidate.targetCardId === target.definitionId &&
      isRuleAvailable(state, candidate)
  );
  if (!rule) return undefined;

  const attempt = getNextAttempt(state, rule);
  if (!attempt?.enabled) return undefined;

  const current = state.interactionStates[rule.id] ?? { ruleId: rule.id, count: 0, completed: false };
  const nextCount = current.count + 1;
  const repeatEnabled = rule.sequence.some((item) => item.attempt === 'repeat' && item.enabled);
  const numberedEnabledCount = rule.sequence.filter((item) => typeof item.attempt === 'number' && item.enabled).length;
  const completed = Boolean(rule.afterComplete?.disableRule || (!repeatEnabled && nextCount >= numberedEnabledCount));

  return {
    state: clearValidTargetHighlights({
      ...state,
      interactionStates: {
        ...state.interactionStates,
        [rule.id]: {
          ruleId: rule.id,
          count: nextCount,
          completed,
          lastTriggeredAt: Date.now()
        }
      }
    }),
    commands: attempt.results,
    rule,
    attempt
  };
}

function findAvailableRulesForSource(state: GameState, sourceCardId: string) {
  return state.interactionRules.filter((rule) => rule.sourceCardId === sourceCardId && isRuleAvailable(state, rule));
}

function isRuleAvailable(state: GameState, rule: InteractionRule) {
  const interactionState = state.interactionStates[rule.id];
  if (interactionState?.completed) return false;
  if (!getNextAttempt(state, rule)?.enabled) return false;
  return (rule.conditions ?? []).every((condition) => {
    if (condition.type === 'flagEquals') return state.flags[condition.key] === condition.value;
    if (condition.type === 'cardVisible') return state.cardInstances.some((card) => card.definitionId === condition.cardId && card.visible === condition.visible);
    return true;
  });
}

function getNextAttempt(state: GameState, rule: InteractionRule) {
  const count = state.interactionStates[rule.id]?.count ?? 0;
  const nextNumber = count + 1;
  return rule.sequence.find((attempt) => attempt.attempt === nextNumber) ?? rule.sequence.find((attempt) => attempt.attempt === 'repeat');
}

function findInstance(state: GameState, instanceId: string): CardInstance | undefined {
  return state.cardInstances.find((card) => card.instanceId === instanceId && card.visible);
}
