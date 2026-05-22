import type { GameCommand, InteractionRule } from '../domain/types';

function line(text: string): GameCommand[] {
  return [{ type: 'story.narration', text }];
}

function numbered(first: string, second?: string): InteractionRule['sequence'] {
  return [
    { attempt: 1, enabled: true, previewText: first, results: line(first) },
    ...(second ? [{ attempt: 2 as const, enabled: true, previewText: second, results: line(second) }] : []),
    { attempt: 'repeat', enabled: false, previewText: '没有新的反应。', results: [] }
  ];
}

export const interactions: InteractionRule[] = [
  {
    id: '1-1:self-protagonist',
    sourceCardId: 'skill_self',
    targetCardId: 'protagonist',
    label: '教学',
    sequence: [
      {
        attempt: 1,
        enabled: true,
        previewText: '确认“我”。',
        results: [
          { type: 'card.breakFrame', cardId: 'skill_self', durationMs: 450 },
          { type: 'card.dissolve', cardId: 'skill_self', durationMs: 900, removeAfter: true },
          { type: 'ui.promptName', variable: 'playerName' },
          { type: 'story.goto', segmentId: '1-2:start' }
        ]
      }
    ],
    afterComplete: { disableRule: true }
  },
  {
    id: '1-2:protagonist-tree',
    label: 'A',
    sourceCardId: 'protagonist',
    targetCardId: 'tree',
    sequence: numbered('与众不同的树木，从未见过。', '这并非我的故乡。')
  },
  {
    id: '1-2:protagonist-tattoo',
    label: 'B',
    sourceCardId: 'protagonist',
    targetCardId: 'tattoo',
    sequence: numbered('奇怪的纹身。', '福瑞身上具有不明意义的纹身是非常合理的。')
  },
  {
    id: '1-2:protagonist-hands',
    label: 'C',
    sourceCardId: 'protagonist',
    targetCardId: 'hands',
    sequence: numbered('我的双手，坚实，有力，肉垫饱满。', '何不用这双手去爬树呢？')
  },
  {
    id: '1-2:protagonist-grass',
    label: 'D',
    sourceCardId: 'protagonist',
    targetCardId: 'grass',
    sequence: numbered('芬芳的草地，令人安心。')
  },
  {
    id: '1-2:hands-grass',
    label: 'E',
    sourceCardId: 'hands',
    targetCardId: 'grass',
    sequence: numbered('我并不想吃草。', '我还没有饿到这种程度。')
  },
  {
    id: '1-2:hands-tattoo',
    label: 'F',
    sourceCardId: 'hands',
    targetCardId: 'tattoo',
    sequence: numbered('腹部柔软的绒毛，纹身似乎仅仅是纹身。')
  },
  {
    id: '1-2:hands-tree',
    label: 'G',
    sourceCardId: 'hands',
    targetCardId: 'tree',
    sequence: [
      {
        attempt: 1,
        enabled: true,
        previewText: '这副兽人的躯体更加灵活，洛德三两下就爬到了树梢处。',
        results: [
          { type: 'story.narration', text: '这副兽人的躯体更加灵活，{playerName}三两下就爬到了树梢处。' },
          { type: 'story.goto', segmentId: '1-2:black-sun' }
        ]
      },
      { attempt: 'repeat', enabled: false, previewText: '没有新的反应。', results: [] }
    ],
    afterComplete: { disableRule: true }
  }
];
