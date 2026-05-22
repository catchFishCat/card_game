import { describe, expect, it } from 'vitest';
import { createInitialState } from './initialState';
import { applyValidTargetHighlights, resolveInteraction } from './interactionEngine';
import type { CardDefinition, InteractionRule } from './types';

const cards: CardDefinition[] = [
  { id: 'source', name: '来源', type: 'skill', zone: 'free' },
  { id: 'target', name: '目标', type: 'location', zone: 'fixed' },
  { id: 'other', name: '其他', type: 'location', zone: 'fixed' }
];

const rules: InteractionRule[] = [
  {
    id: 'rule-a',
    sourceCardId: 'source',
    targetCardId: 'target',
    sequence: [
      { attempt: 1, enabled: true, results: [{ type: 'story.narration', text: '第一次' }] },
      { attempt: 2, enabled: true, results: [{ type: 'story.narration', text: '第二次' }] },
      { attempt: 'repeat', enabled: false, results: [] }
    ]
  }
];

function makeState() {
  return {
    ...createInitialState(cards, rules, { id: 'start', title: 'start', steps: [] }),
    cardInstances: [
      { instanceId: 'source_1', definitionId: 'source', zone: 'free' as const, position: { x: 10, y: 10 }, count: 1, visible: true, enabled: true, zIndex: 1 },
      { instanceId: 'target_1', definitionId: 'target', zone: 'fixed' as const, position: { x: 50, y: 10 }, count: 1, visible: true, enabled: true, zIndex: 2 },
      { instanceId: 'other_1', definitionId: 'other', zone: 'fixed' as const, position: { x: 70, y: 10 }, count: 1, visible: true, enabled: true, zIndex: 3 }
    ]
  };
}

describe('interaction engine', () => {
  it('highlights only valid target cards for the picked source', () => {
    const next = applyValidTargetHighlights(makeState(), 'source_1');
    expect(next.cardInstances.find((card) => card.instanceId === 'target_1')?.highlightState?.ruleId).toBe('rule-a');
    expect(next.cardInstances.find((card) => card.instanceId === 'other_1')?.highlightState).toBeUndefined();
  });

  it('returns the next interaction attempt and increments state', () => {
    const first = resolveInteraction(makeState(), 'source_1', 'target_1');
    expect(first?.attempt.previewText).toBeUndefined();
    expect(first?.commands[0]).toEqual({ type: 'story.narration', text: '第一次' });
    expect(first?.state.interactionStates['rule-a'].count).toBe(1);

    const second = resolveInteraction(first!.state, 'source_1', 'target_1');
    expect(second?.commands[0]).toEqual({ type: 'story.narration', text: '第二次' });
    expect(second?.state.interactionStates['rule-a'].completed).toBe(true);
  });
});
