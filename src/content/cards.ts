import type { CardDefinition } from '../domain/types';

export const cards: CardDefinition[] = [
  {
    id: 'protagonist',
    name: '主角卡',
    type: 'protagonist',
    description: '洛德当前身体与意识的核心卡。许多探索判断从这里发起。',
    zone: 'fixed',
    defaultPosition: { x: 50, y: 20 },
    highlightStyle: { kind: 'validTarget', mode: 'softGlow' },
    interactions: {
      asSourceRuleIds: ['1-2:protagonist-tree', '1-2:protagonist-tattoo', '1-2:protagonist-hands', '1-2:protagonist-grass'],
      asTargetRuleIds: ['1-1:self-protagonist']
    }
  },
  {
    id: 'skill_self',
    name: '技能：我',
    type: 'skill',
    description: '刚醒来时唯一能确认的东西。拖到主角卡上完成自我确认。',
    zone: 'free',
    defaultPosition: { x: 50, y: 60 },
    interactions: { asSourceRuleIds: ['1-1:self-protagonist'] }
  },
  {
    id: 'hands',
    name: '技能：双手',
    type: 'skill',
    description: '坚实、有力，肉垫饱满。看起来很适合攀爬。',
    zone: 'free',
    defaultPosition: { x: 63, y: 54 },
    interactions: {
      asSourceRuleIds: ['1-2:hands-grass', '1-2:hands-tattoo', '1-2:hands-tree'],
      asTargetRuleIds: ['1-2:protagonist-hands']
    }
  },
  {
    id: 'tree',
    name: '地点：树',
    type: 'location',
    description: '与洛德记忆中的树木不同。枝干很高，也许能看到更远的地方。',
    zone: 'fixed',
    defaultPosition: { x: 45, y: 34 },
    highlightStyle: { kind: 'validTarget', mode: 'softGlow' },
    interactions: {
      asTargetRuleIds: ['1-2:protagonist-tree', '1-2:hands-tree']
    }
  },
  {
    id: 'grass',
    name: '地点：草地',
    type: 'location',
    description: '芬芳、柔软、让人安心的草地。',
    zone: 'fixed',
    defaultPosition: { x: 54, y: 70 },
    highlightStyle: { kind: 'validTarget', mode: 'outline' },
    interactions: {
      asTargetRuleIds: ['1-2:protagonist-grass', '1-2:hands-grass']
    }
  },
  {
    id: 'tattoo',
    name: '物品：纹身',
    type: 'item',
    description: '腹部绒毛之间的不明纹路。也许只是纹身，也许不是。',
    zone: 'fixed',
    defaultPosition: { x: 61, y: 34 },
    highlightStyle: { kind: 'validTarget', mode: 'outline' },
    interactions: {
      asTargetRuleIds: ['1-2:protagonist-tattoo', '1-2:hands-tattoo']
    }
  },
  {
    id: 'black_sun',
    name: '提示：黑日',
    type: 'hint',
    description: '树冠尽头出现的巨大黑色太阳。它像灾厄，也像某种召唤。',
    zone: 'fixed',
    defaultPosition: { x: 73, y: 20 },
    highlightStyle: { kind: 'validTarget', mode: 'softGlow' }
  },
  {
    id: 'unknown_harvey',
    name: '???',
    type: 'character',
    description: '一个突然出现的陌生身影。名字还没有被揭开。',
    zone: 'fixed',
    defaultPosition: { x: 27, y: 22 }
  },
  {
    id: 'harvey',
    name: '哈维',
    type: 'character',
    description: '知道洛德处境的角色。第一版原型停在他登场后。',
    zone: 'fixed',
    defaultPosition: { x: 27, y: 22 }
  },
  {
    id: 'sample_progress',
    name: '提示：读条样例',
    type: 'hint',
    description: '用于验证卡牌进度条是可选字段。正式内容不一定出现。',
    zone: 'free',
    defaultPosition: { x: 84, y: 68 },
    progress: { kind: 'read', max: 100, initial: 42 }
  }
];
