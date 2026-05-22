import type { CardDefinition, CardInstance, EmphasisStyle, GameCommand, GameState, Position, ReplacePreserve } from './types';

let nextInstanceId = 1;

export function runCommands(state: GameState, commands: GameCommand[]): GameState {
  return commands.reduce((current, command) => runCommand(current, command), state);
}

export function resetInstanceIdCounter() {
  nextInstanceId = 1;
}

function runCommand(state: GameState, command: GameCommand): GameState {
  switch (command.type) {
    case 'story.narration':
      return { ...state, storyMode: true, activeLine: { kind: 'narration', text: interpolate(command.text, state) } };
    case 'story.dialogue':
      return {
        ...state,
        storyMode: true,
        activeLine: {
          kind: 'dialogue',
          speakerId: command.speakerId,
          text: interpolate(command.text, state),
          expression: command.expression
        }
      };
    case 'story.goto':
      return { ...state, currentSegmentId: command.segmentId, storyStepIndex: 0 };
    case 'story.enterMode':
      return { ...state, storyMode: true };
    case 'story.exitMode':
      return { ...state, storyMode: false, activeLine: { kind: 'none' } };
    case 'ui.promptName':
      return { ...state, awaitingName: true, storyMode: false, activeLine: { kind: 'none' } };
    case 'effect.screen':
      return { ...state, lastEffect: command.effect };
    case 'effect.camera':
    case 'wait':
      return state;
    case 'card.spawn':
      return spawnCard(state, command.cardId, command.zone, command.position);
    case 'card.remove':
      return removeCard(state, command.cardInstanceId, command.cardId);
    case 'card.consume':
      return consumeCard(state, command.cardInstanceId, command.cardId, command.amount ?? 1, command.removeWhenZero ?? true);
    case 'card.dissolve':
      return command.removeAfter ? removeCard(state, command.cardInstanceId, command.cardId) : state;
    case 'card.breakFrame':
      return emphasizeCard(state, command.cardInstanceId, command.cardId, { kind: 'warning', mode: 'shake' }, command.durationMs);
    case 'card.highlight':
      return setHighlight(state, command.cardInstanceId, command.cardId, command.enabled);
    case 'card.emphasize':
      return emphasizeCard(state, command.cardInstanceId, command.cardId, command.style, command.durationMs);
    case 'card.move':
      return moveCard(state, command.cardInstanceId, command.cardId, command.to);
    case 'card.rename':
      return renameCard(state, command.cardInstanceId, command.cardId, command.name);
    case 'card.replace':
      return replaceCard(state, command.cardInstanceId, command.fromCardId, command.toCardId, command.preserve);
    case 'card.transform':
      return transformCard(state, command.cardInstanceId, command.fromCardId, command.toCardId, command.patch);
    case 'card.setEnabled':
      return patchInstances(state, command.cardInstanceId, command.cardId, (card) => ({ ...card, enabled: command.enabled }));
    case 'card.setVisible':
      return patchInstances(state, command.cardInstanceId, command.cardId, (card) => ({ ...card, visible: command.visible }));
    case 'card.setZone':
      return patchInstances(state, command.cardInstanceId, command.cardId, (card) => ({ ...card, zone: command.zone }));
    case 'state.setFlag':
      return { ...state, flags: { ...state.flags, [command.key]: command.value } };
    case 'state.increment': {
      const current = Number(state.flags[command.key] ?? 0);
      return { ...state, flags: { ...state.flags, [command.key]: current + (command.amount ?? 1) } };
    }
  }
}

function spawnCard(state: GameState, cardId: string, zone?: CardInstance['zone'], position?: Position): GameState {
  const definition = state.cards[cardId];
  if (!definition) return state;

  if (definition.stackable) {
    const existing = state.cardInstances.find((card) => card.definitionId === cardId && card.visible);
    if (existing) {
      return {
        ...state,
        cardInstances: state.cardInstances.map((card) =>
          card.instanceId === existing.instanceId ? { ...card, count: card.count + (definition.defaultCount ?? 1) } : card
        )
      };
    }
  }

  const instance: CardInstance = {
    instanceId: `${cardId}_${nextInstanceId++}`,
    definitionId: cardId,
    zone: zone ?? definition.zone,
    position: position ?? definition.defaultPosition ?? { x: 50, y: 50 },
    count: definition.defaultCount ?? 1,
    progressValue: definition.progress?.initial,
    visible: true,
    enabled: true,
    zIndex: state.cardInstances.length + 1
  };

  return { ...state, cardInstances: [...state.cardInstances, instance] };
}

function removeCard(state: GameState, cardInstanceId?: string, cardId?: string): GameState {
  return {
    ...state,
    cardInstances: state.cardInstances.filter((card) => !matchesCard(card, cardInstanceId, cardId))
  };
}

function consumeCard(state: GameState, cardInstanceId: string | undefined, cardId: string | undefined, amount: number, removeWhenZero: boolean): GameState {
  return {
    ...state,
    cardInstances: state.cardInstances
      .map((card) => (matchesCard(card, cardInstanceId, cardId) ? { ...card, count: Math.max(0, card.count - amount) } : card))
      .filter((card) => !removeWhenZero || card.count > 0)
  };
}

function setHighlight(state: GameState, cardInstanceId: string | undefined, cardId: string | undefined, enabled: boolean): GameState {
  return patchInstances(state, cardInstanceId, cardId, (card) => ({
    ...card,
    highlightState: enabled ? { kind: 'validTarget', ruleId: 'manual' } : undefined
  }));
}

function emphasizeCard(
  state: GameState,
  cardInstanceId: string | undefined,
  cardId: string | undefined,
  style: EmphasisStyle,
  durationMs?: number
): GameState {
  return patchInstances(state, cardInstanceId, cardId, (card) => ({
    ...card,
    emphasisState: { style, durationMs, startedAt: Date.now() }
  }));
}

function moveCard(state: GameState, cardInstanceId: string | undefined, cardId: string | undefined, to: Position | { zone: CardInstance['zone'] }): GameState {
  return patchInstances(state, cardInstanceId, cardId, (card) => {
    if ('zone' in to) return { ...card, zone: to.zone };
    return { ...card, position: to };
  });
}

function renameCard(state: GameState, cardInstanceId: string | undefined, cardId: string | undefined, name: string): GameState {
  const matched = state.cardInstances.find((card) => matchesCard(card, cardInstanceId, cardId));
  if (!matched) return state;
  const definition = state.cards[matched.definitionId];
  const renamed: CardDefinition = { ...definition, name };
  return { ...state, cards: { ...state.cards, [matched.definitionId]: renamed } };
}

function replaceCard(
  state: GameState,
  cardInstanceId: string | undefined,
  fromCardId: string | undefined,
  toCardId: string,
  preserve: ReplacePreserve = { position: true, zone: true, visibility: true, zIndex: true }
): GameState {
  const toDefinition = state.cards[toCardId];
  if (!toDefinition) return state;

  return {
    ...state,
    cardInstances: state.cardInstances.map((card) => {
      if (!matchesCard(card, cardInstanceId, fromCardId)) return card;
      return {
        ...card,
        definitionId: toCardId,
        position: preserve.position === false ? toDefinition.defaultPosition ?? card.position : card.position,
        zone: preserve.zone === false ? toDefinition.zone : card.zone,
        count: preserve.count ? card.count : toDefinition.defaultCount ?? 1,
        progressValue: preserve.progress ? card.progressValue : toDefinition.progress?.initial,
        enabled: preserve.enabled === false ? true : card.enabled,
        visible: preserve.visibility === false ? true : card.visible,
        zIndex: preserve.zIndex === false ? state.cardInstances.length + 1 : card.zIndex
      };
    })
  };
}

function transformCard(
  state: GameState,
  cardInstanceId?: string,
  fromCardId?: string,
  toCardId?: string,
  patch?: Partial<CardDefinition>
): GameState {
  let next = toCardId ? replaceCard(state, cardInstanceId, fromCardId, toCardId) : state;
  const matched = next.cardInstances.find((card) => matchesCard(card, cardInstanceId, toCardId ?? fromCardId));
  if (!matched || !patch) return next;
  next = {
    ...next,
    cards: {
      ...next.cards,
      [matched.definitionId]: { ...next.cards[matched.definitionId], ...patch }
    }
  };
  return next;
}

function patchInstances(
  state: GameState,
  cardInstanceId: string | undefined,
  cardId: string | undefined,
  patcher: (card: CardInstance) => CardInstance
): GameState {
  return {
    ...state,
    cardInstances: state.cardInstances.map((card) => (matchesCard(card, cardInstanceId, cardId) ? patcher(card) : card))
  };
}

function matchesCard(card: CardInstance, cardInstanceId?: string, cardId?: string) {
  if (cardInstanceId) return card.instanceId === cardInstanceId;
  if (cardId) return card.definitionId === cardId;
  return false;
}

function interpolate(text: string, state: GameState) {
  return text.replaceAll('{playerName}', state.playerName);
}
