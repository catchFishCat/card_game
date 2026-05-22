import { describe, expect, it } from 'vitest';
import { runCommands } from './commandRunner';
import { createInitialState } from './initialState';
import type { CardDefinition, GameState } from './types';

const cards: CardDefinition[] = [
  { id: 'unknown_harvey', name: '???', type: 'character', zone: 'fixed' },
  { id: 'harvey', name: '哈维', type: 'character', zone: 'fixed' },
  { id: 'skill_self', name: '技能：我', type: 'skill', zone: 'free' },
  { id: 'protagonist', name: '主角卡', type: 'protagonist', zone: 'fixed' }
];

function stateWithCards(): GameState {
  const state = createInitialState(cards, [], { id: 'start', title: 'start', steps: [] });
  return {
    ...state,
    cardInstances: [
      {
        instanceId: 'inst_unknown',
        definitionId: 'unknown_harvey',
        zone: 'fixed',
        position: { x: 10, y: 20 },
        count: 1,
        visible: true,
        enabled: true,
        zIndex: 3
      },
      {
        instanceId: 'inst_self',
        definitionId: 'skill_self',
        zone: 'free',
        position: { x: 100, y: 200 },
        count: 1,
        visible: true,
        enabled: true,
        zIndex: 4
      }
    ]
  };
}

describe('runCommands', () => {
  it('spawns cards and enters story mode', () => {
    const next = runCommands(stateWithCards(), [
      { type: 'story.enterMode' },
      { type: 'card.spawn', cardId: 'protagonist', zone: 'fixed', position: { x: 30, y: 40 } }
    ]);

    expect(next.storyMode).toBe(true);
    expect(next.cardInstances.some((card) => card.definitionId === 'protagonist')).toBe(true);
  });

  it('replaces a card while preserving position and zone', () => {
    const next = runCommands(stateWithCards(), [
      {
        type: 'card.replace',
        cardInstanceId: 'inst_unknown',
        toCardId: 'harvey',
        preserve: { position: true, zone: true, zIndex: true, visibility: true }
      }
    ]);

    const card = next.cardInstances.find((item) => item.instanceId === 'inst_unknown');
    expect(card?.definitionId).toBe('harvey');
    expect(card?.position).toEqual({ x: 10, y: 20 });
    expect(card?.zone).toBe('fixed');
  });

  it('dissolves and removes a card when removeAfter is true', () => {
    const next = runCommands(stateWithCards(), [
      { type: 'card.dissolve', cardInstanceId: 'inst_self', removeAfter: true }
    ]);

    expect(next.cardInstances.some((card) => card.instanceId === 'inst_self')).toBe(false);
  });

  it('sets emphasis separately from valid-target highlight', () => {
    const next = runCommands(stateWithCards(), [
      {
        type: 'card.emphasize',
        cardInstanceId: 'inst_unknown',
        style: { kind: 'guide', mode: 'pulseGlow' }
      }
    ]);

    const card = next.cardInstances.find((item) => item.instanceId === 'inst_unknown');
    expect(card?.emphasisState?.style.kind).toBe('guide');
    expect(card?.highlightState).toBeUndefined();
  });
});
