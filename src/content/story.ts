import type { StorySegment } from '../domain/types';

export const storySegments: StorySegment[] = [
  {
    id: '1-1:intro',
    title: '1-1 醒来',
    steps: [
      [
        { type: 'story.enterMode' },
        { type: 'effect.screen', effect: 'black', durationMs: 500 },
        { type: 'story.narration', text: '黑暗中，你听见自己的心跳。' }
      ],
      [
        { type: 'effect.screen', effect: 'blink', durationMs: 600 },
        { type: 'story.narration', text: '视野一点点恢复，陌生的气味压进胸口。' }
      ],
      [
        { type: 'card.spawn', cardId: 'protagonist', zone: 'fixed', position: { x: 50, y: 20 } },
        { type: 'card.emphasize', cardId: 'protagonist', style: { kind: 'guide', mode: 'pulseGlow' }, durationMs: 1200 },
        { type: 'story.dialogue', speakerId: 'protagonist', text: '我……还活着？' }
      ],
      [
        { type: 'card.spawn', cardId: 'skill_self', zone: 'free', position: { x: 50, y: 60 } },
        { type: 'story.exitMode' },
        { type: 'card.emphasize', cardId: 'skill_self', style: { kind: 'guide', mode: 'pulseGlow' }, durationMs: 1600 },
        { type: 'card.emphasize', cardId: 'protagonist', style: { kind: 'guide', mode: 'pulseGlow' }, durationMs: 1600 }
      ]
    ]
  },
  {
    id: '1-2:start',
    title: '1-2 林间探索',
    steps: [
      [
        { type: 'story.exitMode' },
        { type: 'card.spawn', cardId: 'tree', zone: 'fixed', position: { x: 45, y: 34 } },
        { type: 'card.spawn', cardId: 'tattoo', zone: 'fixed', position: { x: 61, y: 34 } },
        { type: 'card.spawn', cardId: 'hands', zone: 'free', position: { x: 63, y: 55 } },
        { type: 'card.spawn', cardId: 'grass', zone: 'fixed', position: { x: 54, y: 70 } },
        { type: 'card.emphasize', cardId: 'tree', style: { kind: 'guide', mode: 'pulseGlow' }, durationMs: 1400 }
      ]
    ]
  },
  {
    id: '1-2:black-sun',
    title: '1-2 黑日',
    steps: [
      [
        { type: 'card.spawn', cardId: 'black_sun', zone: 'fixed', position: { x: 75, y: 20 } },
        { type: 'card.emphasize', cardId: 'black_sun', style: { kind: 'storyFocus', mode: 'strongGlow' }, durationMs: 1400 },
        { type: 'story.narration', text: '越过树冠，天空中悬着一轮不该存在的黑色太阳。' }
      ],
      [
        { type: 'story.dialogue', speakerId: 'protagonist', text: '那是什么……太阳吗？' }
      ],
      [
        { type: 'card.spawn', cardId: 'unknown_harvey', zone: 'fixed', position: { x: 27, y: 22 } },
        { type: 'card.emphasize', cardId: 'unknown_harvey', style: { kind: 'storyFocus', mode: 'strongGlow' }, durationMs: 1000 },
        { type: 'story.dialogue', speakerId: 'unknown_harvey', text: '别一直盯着它看。你会被它记住。' }
      ],
      [
        { type: 'card.replace', fromCardId: 'unknown_harvey', toCardId: 'harvey', preserve: { position: true, zone: true, visibility: true, zIndex: true } },
        { type: 'story.dialogue', speakerId: 'harvey', text: '总算找到你了，{playerName}。' }
      ],
      [
        { type: 'story.narration', text: '第一版原型到这里暂时结束。卡牌、剧情和交互都已经进入同一套数据驱动流程。' }
      ]
    ]
  }
];
