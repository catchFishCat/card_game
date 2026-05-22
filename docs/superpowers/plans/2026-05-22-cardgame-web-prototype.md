# Cardgame Web Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable Web prototype for `福瑞勇者从不战败`: story playback -> card interaction -> next story segment, covering `1-1` and `1-2`.

**Architecture:** Use a small React + TypeScript + Vite app with a data-driven domain layer. Story playback, interaction rules, card state, and command execution live outside UI components so a future editor can read and write the same structures.

**Tech Stack:** React, TypeScript, Vite, Vitest, CSS modules/plain CSS, HTML5 pointer events.

---

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`: Vite HTML entry.
- Create `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`: TypeScript, Vite, and test config.
- Create `src/main.tsx`: React entry.
- Create `src/App.tsx`: app shell and game state wiring.
- Create `src/styles.css`: global layout, cards, story overlay, highlight and emphasis effects.
- Create `src/domain/types.ts`: shared data types: cards, commands, story segments, interaction rules, runtime state.
- Create `src/domain/initialState.ts`: initial `GameState`.
- Create `src/domain/commandRunner.ts`: applies `GameCommand` arrays to state.
- Create `src/domain/interactionEngine.ts`: computes valid targets and resolves interactions.
- Create `src/domain/storyPlayer.ts`: advances story steps and queues commands.
- Create `src/content/cards.ts`: card definitions for the first prototype.
- Create `src/content/story.ts`: story segments for `1-1` and `1-2`.
- Create `src/content/interactions.ts`: `1-1` and `1-2` interaction rules, including A-G.
- Create `src/components/CardView.tsx`: card rendering, optional progress bar, pointer hooks.
- Create `src/components/CardBoard.tsx`: fixed/free zones, dragging, drop handling.
- Create `src/components/CardDetailPopover.tsx`: card detail popover.
- Create `src/components/StoryOverlay.tsx`: system-doc story layout with black bars and dialogue boxes.
- Create `src/components/NamePrompt.tsx`: name input.
- Create `src/components/DebugPanel.tsx`: prototype reset and state inspection.
- Create `src/assets/card-faces/README.md`: documents generated art requirements.
- Test `src/domain/commandRunner.test.ts`.
- Test `src/domain/interactionEngine.test.ts`.
- Test `src/domain/storyPlayer.test.ts`.

## Task 1: Scaffold The Web App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json`:

```json
{
  "name": "card-game-prototype",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "typescript": "^5.8.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "vitest": "^3.0.0",
    "jsdom": "^26.0.0"
  }
}
```

- [ ] **Step 2: Create HTML and TypeScript config**

Create `index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>福瑞勇者从不战败 - Web 原型</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "src"]
}
```

- [ ] **Step 3: Create Vite and Vitest config**

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173
  }
});
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

- [ ] **Step 4: Create minimal React entry**

Create `src/main.tsx`:

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `src/App.tsx`:

```tsx
export function App() {
  return (
    <main className="app-shell">
      <h1>福瑞勇者从不战败</h1>
      <p>Web 原型初始化完成。</p>
    </main>
  );
}
```

Create `src/styles.css`:

```css
:root {
  color: #f4efe4;
  background: #151511;
  font-family: Inter, "Microsoft YaHei", system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button,
input {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 32px;
}
```

- [ ] **Step 5: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and npm reports installed packages without vulnerabilities that block local development.

- [ ] **Step 6: Verify scaffold**

Run:

```bash
npm test
npm run build
```

Expected: Vitest reports no test files or passes cleanly, and Vite creates `dist/`.

- [ ] **Step 7: Commit scaffold**

```bash
git add package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts src
git commit -m "feat: scaffold web prototype"
```

## Task 2: Define Domain Types And Initial State

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/initialState.ts`
- Test: `src/domain/types.test.ts`

- [ ] **Step 1: Write type smoke test**

Create `src/domain/types.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { CardDefinition, GameCommand, InteractionRule } from './types';

describe('domain types', () => {
  it('allows cards with optional progress and interaction indexes', () => {
    const card: CardDefinition = {
      id: 'skill_hands',
      name: '技能：双手',
      type: 'skill',
      zone: 'free',
      stackable: false,
      highlightStyle: { kind: 'validTarget', mode: 'outline' },
      interactions: { asSourceRuleIds: ['1-2:hands-tree'] }
    };

    expect(card.progress).toBeUndefined();
    expect(card.interactions?.asSourceRuleIds).toContain('1-2:hands-tree');
  });

  it('allows interaction attempts to contain command queues', () => {
    const command: GameCommand = {
      type: 'card.replace',
      fromCardId: 'unknown_harvey',
      toCardId: 'harvey',
      preserve: { position: true, zone: true }
    };

    const rule: InteractionRule = {
      id: 'example',
      sourceCardId: 'skill_hands',
      targetCardId: 'tree',
      sequence: [{ attempt: 1, enabled: true, results: [command] }]
    };

    expect(rule.sequence[0].results[0].type).toBe('card.replace');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/types.test.ts
```

Expected: FAIL because `src/domain/types.ts` does not exist.

- [ ] **Step 3: Implement domain types**

Create `src/domain/types.ts`:

```ts
export type CardType = 'protagonist' | 'skill' | 'location' | 'item' | 'character' | 'hint';
export type CardZone = 'fixed' | 'free';

export type CardDefinition = {
  id: string;
  name: string;
  type: CardType;
  description?: string;
  art?: string;
  zone: CardZone;
  stackable?: boolean;
  defaultCount?: number;
  defaultPosition?: Position;
  tags?: string[];
  progress?: ProgressDefinition;
  highlightStyle?: HighlightStyle;
  interactions?: {
    asSourceRuleIds?: string[];
    asTargetRuleIds?: string[];
  };
};

export type CardInstance = {
  instanceId: string;
  definitionId: string;
  zone: CardZone;
  position: Position;
  count: number;
  progressValue?: number;
  visible: boolean;
  enabled: boolean;
  zIndex: number;
  highlightState?: HighlightState;
  emphasisState?: EmphasisState;
};

export type Position = {
  x: number;
  y: number;
};

export type ProgressDefinition = {
  kind: 'read' | 'charge' | 'duration' | 'custom';
  max: number;
  initial?: number;
};

export type HighlightStyle = {
  kind: 'validTarget';
  mode?: 'outline' | 'softGlow';
  color?: string;
};

export type HighlightState = {
  kind: 'validTarget';
  ruleId: string;
};

export type EmphasisStyle = {
  kind: 'guide' | 'storyFocus' | 'warning' | 'success';
  mode?: 'pulseGlow' | 'strongGlow' | 'scalePulse' | 'arrow' | 'shake';
  color?: string;
};

export type EmphasisState = {
  style: EmphasisStyle;
  expiresAt?: number;
};

export type ReplacePreserve = {
  position?: boolean;
  zone?: boolean;
  count?: boolean;
  progress?: boolean;
  enabled?: boolean;
  visibility?: boolean;
  zIndex?: boolean;
};

export type CardAnimation = {
  kind: 'none' | 'fade' | 'dissolve' | 'break' | 'glow' | 'move' | 'custom';
  durationMs?: number;
};

export type GameCommand =
  | { type: 'story.narration'; text: string }
  | { type: 'story.dialogue'; speakerId: string; text: string; expression?: string }
  | { type: 'story.goto'; segmentId: string }
  | { type: 'story.enterMode' }
  | { type: 'story.exitMode' }
  | { type: 'ui.promptName'; variable: string }
  | { type: 'effect.screen'; effect: 'black' | 'blink' | 'fadeIn' | 'fadeOut' | 'shake'; durationMs?: number }
  | { type: 'effect.camera'; targetCardId?: string; zoom?: number; pan?: Position; durationMs?: number }
  | { type: 'card.spawn'; cardId: string; zone?: CardZone; position?: Position }
  | { type: 'card.remove'; cardInstanceId?: string; cardId?: string; animation?: CardAnimation }
  | { type: 'card.consume'; cardInstanceId?: string; cardId?: string; amount?: number; removeWhenZero?: boolean }
  | { type: 'card.dissolve'; cardInstanceId?: string; cardId?: string; durationMs?: number; removeAfter?: boolean }
  | { type: 'card.breakFrame'; cardInstanceId?: string; cardId?: string; durationMs?: number }
  | { type: 'card.highlight'; cardInstanceId?: string; cardId?: string; enabled: boolean; style?: HighlightStyle }
  | { type: 'card.emphasize'; cardInstanceId?: string; cardId?: string; style: EmphasisStyle; durationMs?: number }
  | { type: 'card.move'; cardInstanceId?: string; cardId?: string; to: Position | { zone: CardZone }; durationMs?: number }
  | { type: 'card.rename'; cardInstanceId?: string; cardId?: string; name: string }
  | { type: 'card.replace'; cardInstanceId?: string; fromCardId?: string; toCardId: string; preserve?: ReplacePreserve; animation?: CardAnimation }
  | { type: 'card.transform'; cardInstanceId?: string; fromCardId?: string; toCardId?: string; patch?: Partial<CardDefinition>; animation?: CardAnimation }
  | { type: 'card.setEnabled'; cardInstanceId?: string; cardId?: string; enabled: boolean }
  | { type: 'card.setVisible'; cardInstanceId?: string; cardId?: string; visible: boolean; animation?: CardAnimation }
  | { type: 'card.setZone'; cardInstanceId?: string; cardId?: string; zone: CardZone }
  | { type: 'state.setFlag'; key: string; value: boolean | string | number }
  | { type: 'state.increment'; key: string; amount?: number }
  | { type: 'wait'; durationMs: number };

export type StorySegment = {
  id: string;
  title: string;
  steps: GameCommand[];
  next?: string;
};

export type InteractionAttempt = {
  attempt: number | 'repeat';
  enabled: boolean;
  previewText?: string;
  results: GameCommand[];
};

export type InteractionRule = {
  id: string;
  sourceCardId: string;
  targetCardId?: string;
  targetZone?: CardZone;
  label?: string;
  conditions?: InteractionCondition[];
  sequence: InteractionAttempt[];
  afterComplete?: { disableRule?: boolean };
};

export type InteractionCondition =
  | { type: 'flagEquals'; key: string; value: boolean | string | number }
  | { type: 'cardVisible'; cardId: string; visible: boolean };

export type InteractionState = {
  ruleId: string;
  count: number;
  completed: boolean;
  lastTriggeredAt?: number;
};

export type DialogueLine =
  | { kind: 'none' }
  | { kind: 'narration'; text: string }
  | { kind: 'dialogue'; speakerId: string; text: string; expression?: string };

export type GameState = {
  currentSegmentId: string;
  cards: Record<string, CardDefinition>;
  cardInstances: CardInstance[];
  interactionRules: InteractionRule[];
  interactionStates: Record<string, InteractionState>;
  storyMode: boolean;
  activeLine: DialogueLine;
  flags: Record<string, boolean | string | number>;
  playerName: string;
  awaitingName: boolean;
};
```

- [ ] **Step 4: Create initial state helper**

Create `src/domain/initialState.ts`:

```ts
import type { CardDefinition, GameState, InteractionRule, StorySegment } from './types';

export function createInitialState(
  cards: CardDefinition[],
  interactionRules: InteractionRule[],
  firstSegment: StorySegment
): GameState {
  return {
    currentSegmentId: firstSegment.id,
    cards: Object.fromEntries(cards.map((card) => [card.id, card])),
    cardInstances: [],
    interactionRules,
    interactionStates: Object.fromEntries(
      interactionRules.map((rule) => [
        rule.id,
        { ruleId: rule.id, count: 0, completed: false }
      ])
    ),
    storyMode: false,
    activeLine: { kind: 'none' },
    flags: {},
    playerName: '洛德',
    awaitingName: false
  };
}
```

- [ ] **Step 5: Run type tests**

Run:

```bash
npm test -- src/domain/types.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit domain types**

```bash
git add src/domain/types.ts src/domain/initialState.ts src/domain/types.test.ts
git commit -m "feat: add game domain types"
```

## Task 3: Implement Command Runner

**Files:**
- Create: `src/domain/commandRunner.ts`
- Test: `src/domain/commandRunner.test.ts`

- [ ] **Step 1: Write command runner tests**

Create `src/domain/commandRunner.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/domain/commandRunner.test.ts
```

Expected: FAIL because `commandRunner.ts` does not exist.

- [ ] **Step 3: Implement command runner**

Create `src/domain/commandRunner.ts`:

```ts
import type { CardInstance, GameCommand, GameState, Position } from './types';

let nextInstanceId = 1;

export function runCommands(state: GameState, commands: GameCommand[]): GameState {
  return commands.reduce((current, command) => runCommand(current, command), state);
}

function runCommand(state: GameState, command: GameCommand): GameState {
  switch (command.type) {
    case 'story.narration':
      return { ...state, activeLine: { kind: 'narration', text: command.text } };
    case 'story.dialogue':
      return {
        ...state,
        activeLine: {
          kind: 'dialogue',
          speakerId: command.speakerId,
          text: interpolate(command.text, state),
          expression: command.expression
        }
      };
    case 'story.goto':
      return { ...state, currentSegmentId: command.segmentId, activeLine: { kind: 'none' } };
    case 'story.enterMode':
      return { ...state, storyMode: true };
    case 'story.exitMode':
      return { ...state, storyMode: false, activeLine: { kind: 'none' } };
    case 'ui.promptName':
      return { ...state, awaitingName: true };
    case 'card.spawn':
      return spawnCard(state, command.cardId, command.zone, command.position);
    case 'card.remove':
      return removeCard(state, command.cardInstanceId, command.cardId);
    case 'card.consume':
      return consumeCard(state, command.cardInstanceId, command.cardId, command.amount ?? 1, command.removeWhenZero ?? true);
    case 'card.dissolve':
      return command.removeAfter ? removeCard(state, command.cardInstanceId, command.cardId) : state;
    case 'card.breakFrame':
      return state;
    case 'card.highlight':
      return updateCard(state, command.cardInstanceId, command.cardId, (card) => ({
        ...card,
        highlightState: command.enabled ? { kind: 'validTarget', ruleId: 'manual' } : undefined
      }));
    case 'card.emphasize':
      return updateCard(state, command.cardInstanceId, command.cardId, (card) => ({
        ...card,
        emphasisState: { style: command.style }
      }));
    case 'card.move':
      return moveCard(state, command.cardInstanceId, command.cardId, command.to);
    case 'card.rename':
      return renameDefinition(state, command.cardId, command.name);
    case 'card.replace':
      return replaceCard(state, command);
    case 'card.transform':
      return command.patch && command.fromCardId
        ? { ...state, cards: { ...state.cards, [command.fromCardId]: { ...state.cards[command.fromCardId], ...command.patch } } }
        : state;
    case 'card.setEnabled':
      return updateCard(state, command.cardInstanceId, command.cardId, (card) => ({ ...card, enabled: command.enabled }));
    case 'card.setVisible':
      return updateCard(state, command.cardInstanceId, command.cardId, (card) => ({ ...card, visible: command.visible }));
    case 'card.setZone':
      return updateCard(state, command.cardInstanceId, command.cardId, (card) => ({ ...card, zone: command.zone }));
    case 'state.setFlag':
      return { ...state, flags: { ...state.flags, [command.key]: command.value } };
    case 'state.increment':
      return {
        ...state,
        flags: {
          ...state.flags,
          [command.key]: Number(state.flags[command.key] ?? 0) + (command.amount ?? 1)
        }
      };
    case 'effect.screen':
    case 'effect.camera':
    case 'wait':
      return state;
  }
}

function spawnCard(
  state: GameState,
  cardId: string,
  zone = state.cards[cardId]?.zone,
  position = state.cards[cardId]?.defaultPosition ?? { x: 50, y: 50 }
): GameState {
  const definition = state.cards[cardId];
  if (!definition) return state;

  const instance: CardInstance = {
    instanceId: `card_${nextInstanceId++}`,
    definitionId: cardId,
    zone,
    position,
    count: definition.defaultCount ?? 1,
    progressValue: definition.progress?.initial,
    visible: true,
    enabled: true,
    zIndex: state.cardInstances.length + 1
  };

  return { ...state, cardInstances: [...state.cardInstances, instance] };
}

function removeCard(state: GameState, instanceId?: string, cardId?: string): GameState {
  return {
    ...state,
    cardInstances: state.cardInstances.filter((card) => {
      if (instanceId) return card.instanceId !== instanceId;
      if (cardId) return card.definitionId !== cardId;
      return true;
    })
  };
}

function consumeCard(state: GameState, instanceId: string | undefined, cardId: string | undefined, amount: number, removeWhenZero: boolean): GameState {
  return {
    ...state,
    cardInstances: state.cardInstances.flatMap((card) => {
      const matches = instanceId ? card.instanceId === instanceId : card.definitionId === cardId;
      if (!matches) return [card];

      const nextCount = Math.max(0, card.count - amount);
      if (nextCount === 0 && removeWhenZero) return [];
      return [{ ...card, count: nextCount }];
    })
  };
}

function updateCard(
  state: GameState,
  instanceId: string | undefined,
  cardId: string | undefined,
  updater: (card: CardInstance) => CardInstance
): GameState {
  return {
    ...state,
    cardInstances: state.cardInstances.map((card) => {
      const matches = instanceId ? card.instanceId === instanceId : card.definitionId === cardId;
      return matches ? updater(card) : card;
    })
  };
}

function moveCard(state: GameState, instanceId: string | undefined, cardId: string | undefined, to: Position | { zone: 'fixed' | 'free' }): GameState {
  return updateCard(state, instanceId, cardId, (card) => {
    if ('zone' in to) return { ...card, zone: to.zone };
    return { ...card, position: to };
  });
}

function renameDefinition(state: GameState, cardId: string | undefined, name: string): GameState {
  if (!cardId || !state.cards[cardId]) return state;
  return {
    ...state,
    cards: {
      ...state.cards,
      [cardId]: { ...state.cards[cardId], name }
    }
  };
}

function replaceCard(
  state: GameState,
  command: Extract<GameCommand, { type: 'card.replace' }>
): GameState {
  const target = state.cardInstances.find((card) => {
    if (command.cardInstanceId) return card.instanceId === command.cardInstanceId;
    return card.definitionId === command.fromCardId;
  });
  if (!target || !state.cards[command.toCardId]) return state;

  const nextDefinition = state.cards[command.toCardId];
  const preserve = command.preserve ?? { position: true, zone: true, visibility: true, zIndex: true };

  return {
    ...state,
    cardInstances: state.cardInstances.map((card) => {
      if (card.instanceId !== target.instanceId) return card;
      return {
        ...card,
        definitionId: command.toCardId,
        position: preserve.position ? card.position : nextDefinition.defaultPosition ?? card.position,
        zone: preserve.zone ? card.zone : nextDefinition.zone,
        count: preserve.count ? card.count : nextDefinition.defaultCount ?? 1,
        progressValue: preserve.progress ? card.progressValue : nextDefinition.progress?.initial,
        enabled: preserve.enabled ? card.enabled : true,
        visible: preserve.visibility ? card.visible : true,
        zIndex: preserve.zIndex ? card.zIndex : state.cardInstances.length + 1
      };
    })
  };
}

function interpolate(text: string, state: GameState): string {
  return text.replaceAll('[NAME]', state.playerName);
}
```

- [ ] **Step 4: Run command runner tests**

Run:

```bash
npm test -- src/domain/commandRunner.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit command runner**

```bash
git add src/domain/commandRunner.ts src/domain/commandRunner.test.ts
git commit -m "feat: add game command runner"
```

## Task 4: Implement Interaction Engine

**Files:**
- Create: `src/domain/interactionEngine.ts`
- Test: `src/domain/interactionEngine.test.ts`

- [ ] **Step 1: Write interaction engine tests**

Create `src/domain/interactionEngine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getValidTargets, resolveInteraction } from './interactionEngine';
import { createInitialState } from './initialState';
import type { CardDefinition, InteractionRule } from './types';

const cards: CardDefinition[] = [
  { id: 'protagonist', name: '主角卡', type: 'protagonist', zone: 'fixed' },
  { id: 'tree', name: '地点：树', type: 'location', zone: 'fixed' },
  { id: 'tattoo', name: '物品：纹身', type: 'item', zone: 'free' },
  { id: 'hands', name: '技能：双手', type: 'skill', zone: 'free' }
];

const rules: InteractionRule[] = [
  {
    id: 'A',
    label: 'A',
    sourceCardId: 'protagonist',
    targetCardId: 'tree',
    sequence: [
      { attempt: 1, enabled: true, results: [{ type: 'story.narration', text: '与众不同的树木，从未见过。' }] },
      { attempt: 2, enabled: true, results: [{ type: 'story.narration', text: '这并非我的故乡。' }] },
      { attempt: 'repeat', enabled: false, results: [] }
    ]
  },
  {
    id: 'B',
    label: 'B',
    sourceCardId: 'protagonist',
    targetCardId: 'tattoo',
    sequence: [{ attempt: 1, enabled: true, results: [{ type: 'story.narration', text: '奇怪的纹身。' }] }]
  },
  {
    id: 'G',
    label: 'G',
    sourceCardId: 'hands',
    targetCardId: 'tree',
    sequence: [
      {
        attempt: 1,
        enabled: true,
        results: [
          { type: 'story.narration', text: '这副兽人的躯体更加灵活，洛德三两下就爬到了树梢处。' },
          { type: 'story.goto', segmentId: '1-2:black-sun' }
        ]
      },
      { attempt: 'repeat', enabled: false, results: [] }
    ]
  }
];

function baseState() {
  const state = createInitialState(cards, rules, { id: 'start', title: 'start', steps: [] });
  return {
    ...state,
    cardInstances: [
      { instanceId: 'protagonist_inst', definitionId: 'protagonist', zone: 'fixed' as const, position: { x: 0, y: 0 }, count: 1, visible: true, enabled: true, zIndex: 1 },
      { instanceId: 'tree_inst', definitionId: 'tree', zone: 'fixed' as const, position: { x: 100, y: 0 }, count: 1, visible: true, enabled: true, zIndex: 2 },
      { instanceId: 'tattoo_inst', definitionId: 'tattoo', zone: 'free' as const, position: { x: 200, y: 0 }, count: 1, visible: true, enabled: true, zIndex: 3 },
      { instanceId: 'hands_inst', definitionId: 'hands', zone: 'free' as const, position: { x: 300, y: 0 }, count: 1, visible: true, enabled: true, zIndex: 4 }
    ]
  };
}

describe('interactionEngine', () => {
  it('highlights valid targets for a picked source card', () => {
    const targets = getValidTargets(baseState(), 'protagonist_inst');
    expect(targets.map((target) => target.targetInstanceId).sort()).toEqual(['tattoo_inst', 'tree_inst']);
  });

  it('returns the first and second attempts in order', () => {
    const first = resolveInteraction(baseState(), 'protagonist_inst', 'tree_inst');
    expect(first?.commands[0]).toEqual({ type: 'story.narration', text: '与众不同的树木，从未见过。' });

    const secondState = first!.state;
    const second = resolveInteraction(secondState, 'protagonist_inst', 'tree_inst');
    expect(second?.commands[0]).toEqual({ type: 'story.narration', text: '这并非我的故乡。' });
  });

  it('stops highlighting after repeat is disabled', () => {
    const first = resolveInteraction(baseState(), 'protagonist_inst', 'tree_inst')!;
    const second = resolveInteraction(first.state, 'protagonist_inst', 'tree_inst')!;
    const targets = getValidTargets(second.state, 'protagonist_inst');
    expect(targets.some((target) => target.targetInstanceId === 'tree_inst')).toBe(false);
  });

  it('can resolve a progression interaction', () => {
    const result = resolveInteraction(baseState(), 'hands_inst', 'tree_inst');
    expect(result?.commands.some((command) => command.type === 'story.goto')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/domain/interactionEngine.test.ts
```

Expected: FAIL because `interactionEngine.ts` does not exist.

- [ ] **Step 3: Implement interaction engine**

Create `src/domain/interactionEngine.ts`:

```ts
import type { CardInstance, GameCommand, GameState, InteractionAttempt, InteractionRule } from './types';

export type ValidTarget = {
  ruleId: string;
  sourceInstanceId: string;
  targetInstanceId: string;
  label?: string;
  previewText?: string;
};

export type InteractionResolution = {
  rule: InteractionRule;
  attempt: InteractionAttempt;
  commands: GameCommand[];
  state: GameState;
};

export function getValidTargets(state: GameState, sourceInstanceId: string): ValidTarget[] {
  const source = state.cardInstances.find((card) => card.instanceId === sourceInstanceId);
  if (!source || !source.enabled || !source.visible) return [];

  return state.interactionRules.flatMap((rule) => {
    if (rule.sourceCardId !== source.definitionId) return [];
    const attempt = getNextAttempt(state, rule);
    if (!attempt?.enabled) return [];

    return state.cardInstances
      .filter((target) => target.definitionId === rule.targetCardId && target.enabled && target.visible)
      .map((target) => ({
        ruleId: rule.id,
        sourceInstanceId,
        targetInstanceId: target.instanceId,
        label: rule.label,
        previewText: attempt.previewText
      }));
  });
}

export function applyValidTargetHighlights(state: GameState, sourceInstanceId: string): GameState {
  const targets = getValidTargets(state, sourceInstanceId);
  const targetIds = new Set(targets.map((target) => target.targetInstanceId));
  const ruleByTarget = new Map(targets.map((target) => [target.targetInstanceId, target.ruleId]));

  return {
    ...state,
    cardInstances: state.cardInstances.map((card) => ({
      ...card,
      highlightState: targetIds.has(card.instanceId)
        ? { kind: 'validTarget', ruleId: ruleByTarget.get(card.instanceId)! }
        : undefined
    }))
  };
}

export function clearValidTargetHighlights(state: GameState): GameState {
  return {
    ...state,
    cardInstances: state.cardInstances.map((card) => ({ ...card, highlightState: undefined }))
  };
}

export function resolveInteraction(
  state: GameState,
  sourceInstanceId: string,
  targetInstanceId: string
): InteractionResolution | undefined {
  const source = findInstance(state, sourceInstanceId);
  const target = findInstance(state, targetInstanceId);
  if (!source || !target) return undefined;

  const rule = state.interactionRules.find((candidate) => {
    return candidate.sourceCardId === source.definitionId && candidate.targetCardId === target.definitionId;
  });
  if (!rule) return undefined;

  const attempt = getNextAttempt(state, rule);
  if (!attempt?.enabled) return undefined;

  const interactionState = state.interactionStates[rule.id] ?? { ruleId: rule.id, count: 0, completed: false };
  const nextCount = interactionState.count + 1;
  const repeatAttempt = rule.sequence.find((item) => item.attempt === 'repeat');
  const completed = rule.afterComplete?.disableRule === true || (repeatAttempt?.enabled === false && !rule.sequence.some((item) => typeof item.attempt === 'number' && item.attempt > nextCount));

  const nextState: GameState = {
    ...clearValidTargetHighlights(state),
    interactionStates: {
      ...state.interactionStates,
      [rule.id]: {
        ruleId: rule.id,
        count: nextCount,
        completed,
        lastTriggeredAt: Date.now()
      }
    }
  };

  return {
    rule,
    attempt,
    commands: attempt.results,
    state: nextState
  };
}

function getNextAttempt(state: GameState, rule: InteractionRule): InteractionAttempt | undefined {
  const interactionState = state.interactionStates[rule.id];
  if (interactionState?.completed) return undefined;

  const nextCount = (interactionState?.count ?? 0) + 1;
  const numbered = rule.sequence.find((attempt) => attempt.attempt === nextCount);
  return numbered ?? rule.sequence.find((attempt) => attempt.attempt === 'repeat');
}

function findInstance(state: GameState, instanceId: string): CardInstance | undefined {
  return state.cardInstances.find((card) => card.instanceId === instanceId);
}
```

- [ ] **Step 4: Run interaction engine tests**

Run:

```bash
npm test -- src/domain/interactionEngine.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit interaction engine**

```bash
git add src/domain/interactionEngine.ts src/domain/interactionEngine.test.ts
git commit -m "feat: add card interaction engine"
```

## Task 5: Add First-Pass Content Data

**Files:**
- Create: `src/content/cards.ts`
- Create: `src/content/story.ts`
- Create: `src/content/interactions.ts`
- Create: `src/content/index.ts`
- Test: `src/content/content.test.ts`

- [ ] **Step 1: Write content validation test**

Create `src/content/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cards, interactions, storySegments } from './index';

describe('prototype content', () => {
  it('contains the first playable story segments', () => {
    expect(storySegments.map((segment) => segment.id)).toEqual(
      expect.arrayContaining(['1-1:intro', '1-2:start', '1-2:black-sun', '1-2:harvey'])
    );
  });

  it('contains the A-G interaction rules for 1-2', () => {
    expect(interactions.map((rule) => rule.label).sort()).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D', 'E', 'F', 'G']));
  });

  it('keeps progress optional on ordinary cards', () => {
    const ordinaryCards = cards.filter((card) => !card.progress);
    expect(ordinaryCards.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run content test to verify it fails**

Run:

```bash
npm test -- src/content/content.test.ts
```

Expected: FAIL because content files do not exist.

- [ ] **Step 3: Create card definitions**

Create `src/content/cards.ts`:

```ts
import type { CardDefinition } from '../domain/types';

export const cards: CardDefinition[] = [
  {
    id: 'protagonist',
    name: '主角卡',
    type: 'protagonist',
    zone: 'fixed',
    description: '玩家当前扮演的主角。',
    defaultPosition: { x: 48, y: 36 },
    highlightStyle: { kind: 'validTarget', mode: 'outline', color: '#f2c14e' },
    interactions: { asSourceRuleIds: ['A', 'B', 'C', 'D'], asTargetRuleIds: ['1-1:self-protagonist-fusion'] }
  },
  {
    id: 'skill_self',
    name: '技能：我',
    type: 'skill',
    zone: 'free',
    description: '最初出现的自我认知技能。',
    defaultPosition: { x: 46, y: 62 },
    interactions: { asSourceRuleIds: ['1-1:self-protagonist-fusion'] }
  },
  {
    id: 'hands',
    name: '技能：双手',
    type: 'skill',
    zone: 'free',
    description: '坚实、有力、肉垫饱满的双手。',
    defaultPosition: { x: 58, y: 62 },
    interactions: { asSourceRuleIds: ['E', 'F', 'G'], asTargetRuleIds: ['C'] }
  },
  {
    id: 'tree',
    name: '地点：树',
    type: 'location',
    zone: 'fixed',
    description: '与众不同的树木，从未见过。',
    defaultPosition: { x: 44, y: 18 },
    interactions: { asTargetRuleIds: ['A', 'G'] }
  },
  {
    id: 'grass',
    name: '地点：草地',
    type: 'location',
    zone: 'fixed',
    description: '芬芳的草地，令人安心。',
    defaultPosition: { x: 56, y: 78 },
    interactions: { asTargetRuleIds: ['D', 'E'] }
  },
  {
    id: 'tattoo',
    name: '物品：纹身',
    type: 'item',
    zone: 'free',
    description: '奇怪的纹身。',
    defaultPosition: { x: 62, y: 18 },
    interactions: { asTargetRuleIds: ['B', 'F'] }
  },
  {
    id: 'black_sun',
    name: '提示：黑日',
    type: 'hint',
    zone: 'fixed',
    description: '一轮黑日悬挂于天空。',
    defaultPosition: { x: 72, y: 18 }
  },
  {
    id: 'unknown_harvey',
    name: '???',
    type: 'character',
    zone: 'fixed',
    description: '出现在草地附近的陌生兽人。',
    defaultPosition: { x: 70, y: 36 }
  },
  {
    id: 'harvey',
    name: '哈维',
    type: 'character',
    zone: 'fixed',
    description: '救下洛德的兽人。',
    defaultPosition: { x: 70, y: 36 }
  }
];
```

- [ ] **Step 4: Create story segments**

Create `src/content/story.ts`:

```ts
import type { StorySegment } from '../domain/types';

export const storySegments: StorySegment[] = [
  {
    id: '1-1:intro',
    title: '1-1 开场',
    steps: [
      { type: 'story.enterMode' },
      { type: 'effect.screen', effect: 'black', durationMs: 500 },
      { type: 'effect.screen', effect: 'blink', durationMs: 500 },
      { type: 'story.narration', text: '在拥有意识的那一刻，身体终于有了实质的反馈。' },
      { type: 'card.spawn', cardId: 'protagonist', zone: 'fixed', position: { x: 48, y: 36 } },
      { type: 'card.spawn', cardId: 'skill_self', zone: 'free', position: { x: 46, y: 62 } },
      { type: 'card.emphasize', cardId: 'skill_self', style: { kind: 'guide', mode: 'pulseGlow' }, durationMs: 1200 },
      { type: 'story.exitMode' }
    ]
  },
  {
    id: '1-2:start',
    title: '1-2 探索开始',
    steps: [
      { type: 'story.exitMode' },
      { type: 'card.spawn', cardId: 'hands', zone: 'free', position: { x: 58, y: 62 } },
      { type: 'card.spawn', cardId: 'tree', zone: 'fixed', position: { x: 44, y: 18 } },
      { type: 'card.spawn', cardId: 'grass', zone: 'fixed', position: { x: 56, y: 78 } },
      { type: 'card.spawn', cardId: 'tattoo', zone: 'free', position: { x: 62, y: 18 } },
      { type: 'story.narration', text: '出现卡牌：双手、树、草地、纹身。' }
    ]
  },
  {
    id: '1-2:black-sun',
    title: '发现黑日',
    steps: [
      { type: 'story.enterMode' },
      { type: 'card.spawn', cardId: 'black_sun', zone: 'fixed', position: { x: 72, y: 18 } },
      { type: 'card.emphasize', cardId: 'black_sun', style: { kind: 'storyFocus', mode: 'strongGlow' }, durationMs: 1000 },
      { type: 'story.narration', text: '太阳是黑色的。' },
      { type: 'story.narration', text: '一轮黑日悬挂于天空。' },
      { type: 'story.goto', segmentId: '1-2:harvey' }
    ]
  },
  {
    id: '1-2:harvey',
    title: '哈维登场',
    steps: [
      { type: 'card.spawn', cardId: 'unknown_harvey', zone: 'fixed', position: { x: 70, y: 36 } },
      { type: 'story.dialogue', speakerId: 'unknown_harvey', text: '喂！那边的！！！' },
      { type: 'card.replace', fromCardId: 'unknown_harvey', toCardId: 'harvey', preserve: { position: true, zone: true, visibility: true, zIndex: true }, animation: { kind: 'glow', durationMs: 700 } },
      { type: 'story.dialogue', speakerId: 'harvey', text: '那么，你怎么称呼？' }
    ]
  }
];
```

- [ ] **Step 5: Create interaction rules**

Create `src/content/interactions.ts`:

```ts
import type { InteractionRule } from '../domain/types';

const noMore = { attempt: 'repeat' as const, enabled: false, previewText: '没有新的反应。', results: [] };

export const interactions: InteractionRule[] = [
  {
    id: '1-1:self-protagonist-fusion',
    sourceCardId: 'skill_self',
    targetCardId: 'protagonist',
    sequence: [
      {
        attempt: 1,
        enabled: true,
        results: [
          { type: 'card.breakFrame', cardId: 'skill_self', durationMs: 500 },
          { type: 'card.dissolve', cardId: 'skill_self', durationMs: 900, removeAfter: true },
          { type: 'card.emphasize', cardId: 'protagonist', style: { kind: 'success', mode: 'strongGlow' }, durationMs: 800 },
          { type: 'ui.promptName', variable: 'playerName' }
        ]
      }
    ],
    afterComplete: { disableRule: true }
  },
  {
    id: 'A',
    label: 'A',
    sourceCardId: 'protagonist',
    targetCardId: 'tree',
    sequence: [
      { attempt: 1, enabled: true, previewText: '与众不同的树木，从未见过。', results: [{ type: 'story.narration', text: '与众不同的树木，从未见过。' }] },
      { attempt: 2, enabled: true, previewText: '这并非我的故乡。', results: [{ type: 'story.narration', text: '这并非我的故乡。' }] },
      noMore
    ]
  },
  {
    id: 'B',
    label: 'B',
    sourceCardId: 'protagonist',
    targetCardId: 'tattoo',
    sequence: [
      { attempt: 1, enabled: true, previewText: '奇怪的纹身。', results: [{ type: 'story.narration', text: '奇怪的纹身。' }] },
      { attempt: 2, enabled: true, previewText: '福瑞身上具有不明意义的纹身是非常合理的。', results: [{ type: 'story.narration', text: '福瑞身上具有不明意义的纹身是非常合理的。' }] },
      noMore
    ]
  },
  {
    id: 'C',
    label: 'C',
    sourceCardId: 'protagonist',
    targetCardId: 'hands',
    sequence: [
      { attempt: 1, enabled: true, previewText: '我的双手，坚实，有力，肉垫饱满。', results: [{ type: 'story.narration', text: '我的双手，坚实，有力，肉垫饱满。' }] },
      { attempt: 2, enabled: true, previewText: '何不用这双手去爬树呢？', results: [{ type: 'story.narration', text: '何不用这双手去爬树呢？' }] },
      noMore
    ]
  },
  {
    id: 'D',
    label: 'D',
    sourceCardId: 'protagonist',
    targetCardId: 'grass',
    sequence: [
      { attempt: 1, enabled: true, previewText: '芬芳的草地，令人安心。', results: [{ type: 'story.narration', text: '芬芳的草地，令人安心。' }] },
      noMore
    ]
  },
  {
    id: 'E',
    label: 'E',
    sourceCardId: 'hands',
    targetCardId: 'grass',
    sequence: [
      { attempt: 1, enabled: true, previewText: '我并不想吃草。', results: [{ type: 'story.narration', text: '我并不想吃草。' }] },
      { attempt: 2, enabled: true, previewText: '我还没有饿到这种程度。', results: [{ type: 'story.narration', text: '我还没有饿到这种程度。' }] },
      noMore
    ]
  },
  {
    id: 'F',
    label: 'F',
    sourceCardId: 'hands',
    targetCardId: 'tattoo',
    sequence: [
      { attempt: 1, enabled: true, previewText: '腹部柔软的绒毛，纹身似乎仅仅是纹身。', results: [{ type: 'story.narration', text: '腹部柔软的绒毛，纹身似乎仅仅是纹身。' }] },
      noMore
    ]
  },
  {
    id: 'G',
    label: 'G',
    sourceCardId: 'hands',
    targetCardId: 'tree',
    sequence: [
      {
        attempt: 1,
        enabled: true,
        previewText: '这副兽人的躯体更加灵活，洛德三两下就爬到了树梢处。',
        results: [
          { type: 'story.narration', text: '这副兽人的躯体更加灵活，洛德三两下就爬到了树梢处。' },
          { type: 'card.remove', cardId: 'tree', animation: { kind: 'fade', durationMs: 300 } },
          { type: 'story.goto', segmentId: '1-2:black-sun' }
        ]
      },
      noMore
    ],
    afterComplete: { disableRule: true }
  }
];
```

- [ ] **Step 6: Create content index**

Create `src/content/index.ts`:

```ts
export { cards } from './cards';
export { interactions } from './interactions';
export { storySegments } from './story';
```

- [ ] **Step 7: Run content tests**

Run:

```bash
npm test -- src/content/content.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit content data**

```bash
git add src/content
git commit -m "feat: add first prototype content"
```

## Task 6: Implement Story Player

**Files:**
- Create: `src/domain/storyPlayer.ts`
- Test: `src/domain/storyPlayer.test.ts`

- [ ] **Step 1: Write story player tests**

Create `src/domain/storyPlayer.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { advanceStory } from './storyPlayer';
import { createInitialState } from './initialState';
import type { StorySegment } from './types';

const segments: StorySegment[] = [
  {
    id: 'start',
    title: 'Start',
    steps: [
      { type: 'story.enterMode' },
      { type: 'story.narration', text: '第一句。' },
      { type: 'story.goto', segmentId: 'next' }
    ]
  },
  {
    id: 'next',
    title: 'Next',
    steps: [{ type: 'story.narration', text: '第二段。' }]
  }
];

describe('advanceStory', () => {
  it('runs the next command in the active segment', () => {
    const state = createInitialState([], [], segments[0]);
    const result = advanceStory(state, segments, 0);
    expect(result.state.storyMode).toBe(true);
    expect(result.nextStepIndex).toBe(1);
  });

  it('supports goto commands', () => {
    const state = createInitialState([], [], segments[0]);
    const first = advanceStory(state, segments, 0);
    const second = advanceStory(first.state, segments, first.nextStepIndex);
    const third = advanceStory(second.state, segments, second.nextStepIndex);
    expect(third.state.currentSegmentId).toBe('next');
    expect(third.nextStepIndex).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/domain/storyPlayer.test.ts
```

Expected: FAIL because `storyPlayer.ts` does not exist.

- [ ] **Step 3: Implement story player**

Create `src/domain/storyPlayer.ts`:

```ts
import { runCommands } from './commandRunner';
import type { GameState, StorySegment } from './types';

export type StoryAdvanceResult = {
  state: GameState;
  nextStepIndex: number;
  reachedEnd: boolean;
};

export function advanceStory(
  state: GameState,
  segments: StorySegment[],
  stepIndex: number
): StoryAdvanceResult {
  const segment = segments.find((item) => item.id === state.currentSegmentId);
  if (!segment) return { state, nextStepIndex: stepIndex, reachedEnd: true };

  const command = segment.steps[stepIndex];
  if (!command) {
    if (segment.next) {
      return {
        state: { ...state, currentSegmentId: segment.next },
        nextStepIndex: 0,
        reachedEnd: false
      };
    }
    return { state, nextStepIndex: stepIndex, reachedEnd: true };
  }

  const nextState = runCommands(state, [command]);
  const nextStepIndex = command.type === 'story.goto' ? 0 : stepIndex + 1;

  return {
    state: nextState,
    nextStepIndex,
    reachedEnd: false
  };
}
```

- [ ] **Step 4: Run story player tests**

Run:

```bash
npm test -- src/domain/storyPlayer.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit story player**

```bash
git add src/domain/storyPlayer.ts src/domain/storyPlayer.test.ts
git commit -m "feat: add story player"
```

## Task 7: Build Core UI Components

**Files:**
- Create: `src/components/CardView.tsx`
- Create: `src/components/CardDetailPopover.tsx`
- Create: `src/components/StoryOverlay.tsx`
- Create: `src/components/NamePrompt.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create CardView**

Create `src/components/CardView.tsx`:

```tsx
import type { CardDefinition, CardInstance } from '../domain/types';

type CardViewProps = {
  card: CardInstance;
  definition: CardDefinition;
  onPointerDown?: (event: React.PointerEvent, card: CardInstance) => void;
  onPointerUp?: (event: React.PointerEvent, card: CardInstance) => void;
  onInspect?: (card: CardInstance) => void;
};

export function CardView({ card, definition, onPointerDown, onPointerUp, onInspect }: CardViewProps) {
  const className = [
    'card-view',
    card.highlightState ? 'card-view--highlight' : '',
    card.emphasisState ? 'card-view--emphasis' : '',
    !card.enabled ? 'card-view--disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      className={className}
      style={{ left: `${card.position.x}%`, top: `${card.position.y}%`, zIndex: card.zIndex }}
      onPointerDown={(event) => onPointerDown?.(event, card)}
      onPointerUp={(event) => onPointerUp?.(event, card)}
      onDoubleClick={() => onInspect?.(card)}
      type="button"
    >
      <div className="card-view__art">
        {definition.art ? <img src={definition.art} alt="" /> : <span>{definition.name}</span>}
      </div>
      <div className="card-view__type">{definition.type}</div>
      <div className="card-view__name">{definition.name}</div>
      {definition.progress ? (
        <div className="card-view__progress">
          <span style={{ width: `${((card.progressValue ?? definition.progress.initial ?? 0) / definition.progress.max) * 100}%` }} />
        </div>
      ) : null}
      {card.count > 1 ? <div className="card-view__count">{card.count}</div> : null}
    </button>
  );
}
```

- [ ] **Step 2: Create CardDetailPopover**

Create `src/components/CardDetailPopover.tsx`:

```tsx
import type { CardDefinition, CardInstance } from '../domain/types';

type CardDetailPopoverProps = {
  card?: CardInstance;
  definition?: CardDefinition;
  onClose: () => void;
};

export function CardDetailPopover({ card, definition, onClose }: CardDetailPopoverProps) {
  if (!card || !definition) return null;

  return (
    <aside className="card-detail">
      <button className="card-detail__close" type="button" onClick={onClose}>×</button>
      <div className="card-detail__art">{definition.art ? <img src={definition.art} alt="" /> : definition.name}</div>
      <div className="card-detail__body">
        <div className="card-detail__header">
          <strong>{definition.name}</strong>
          <span>{definition.type}</span>
        </div>
        <p>{definition.description ?? '暂无描述。'}</p>
        <small>持有数量：{card.count}</small>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create StoryOverlay**

Create `src/components/StoryOverlay.tsx`:

```tsx
import type { DialogueLine } from '../domain/types';

type StoryOverlayProps = {
  activeLine: DialogueLine;
  speakerName?: string;
};

export function StoryOverlay({ activeLine, speakerName }: StoryOverlayProps) {
  if (activeLine.kind === 'none') {
    return (
      <div className="story-overlay story-overlay--empty">
        <div className="story-overlay__bar story-overlay__bar--top" />
        <div className="story-overlay__bar story-overlay__bar--bottom" />
      </div>
    );
  }

  const isProtagonist = activeLine.kind === 'dialogue' && activeLine.speakerId === 'protagonist';

  return (
    <div className="story-overlay">
      <div className="story-overlay__bar story-overlay__bar--top" />
      <div className="story-overlay__bar story-overlay__bar--bottom" />
      {activeLine.kind === 'narration' ? (
        <div className="story-overlay__narration">{activeLine.text}</div>
      ) : isProtagonist ? (
        <div className="story-box story-box--hero">
          <div className="story-box__avatar">头像</div>
          <div className="story-box__text">
            <strong>{speakerName ?? '洛德'}</strong>
            <p>{activeLine.text}</p>
          </div>
        </div>
      ) : (
        <div className="story-box story-box--npc">
          <div className="story-box__text">
            <strong>{speakerName ?? activeLine.speakerId}</strong>
            <p>{activeLine.text}</p>
          </div>
          <div className="story-box__avatar">头像</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Create NamePrompt**

Create `src/components/NamePrompt.tsx`:

```tsx
import { useState } from 'react';

type NamePromptProps = {
  defaultName: string;
  onSubmit: (name: string) => void;
};

export function NamePrompt({ defaultName, onSubmit }: NamePromptProps) {
  const [name, setName] = useState(defaultName);

  return (
    <div className="name-prompt">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(name.trim() || defaultName);
        }}
      >
        <label htmlFor="player-name">你的名字</label>
        <input id="player-name" value={name} onChange={(event) => setName(event.target.value)} />
        <button type="submit">确认</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Add component styles**

Append to `src/styles.css`:

```css
.card-view {
  position: absolute;
  width: 86px;
  min-height: 128px;
  border: 1px solid rgba(220, 198, 137, 0.55);
  background: #17130e;
  color: #f8efd1;
  padding: 0;
  cursor: grab;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

.card-view--highlight {
  outline: 3px solid #f2c14e;
  box-shadow: 0 0 0 4px rgba(242, 193, 78, 0.2);
}

.card-view--emphasis {
  animation: cardPulse 1s infinite;
  box-shadow: 0 0 24px rgba(255, 220, 110, 0.85);
}

.card-view--disabled {
  opacity: 0.45;
  pointer-events: none;
}

.card-view__art {
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(220, 198, 137, 0.35);
  font-size: 13px;
  padding: 6px;
}

.card-view__art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-view__type,
.card-view__name {
  min-height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(220, 198, 137, 0.25);
  font-size: 12px;
}

.card-view__progress {
  height: 5px;
  background: rgba(255, 255, 255, 0.2);
}

.card-view__progress span {
  display: block;
  height: 100%;
  background: #2c80ff;
}

.card-view__count {
  position: absolute;
  right: -8px;
  bottom: -8px;
  min-width: 20px;
  border-radius: 999px;
  background: #f2c14e;
  color: #141414;
  font-size: 12px;
  font-weight: 700;
}

.card-detail {
  position: absolute;
  right: 28px;
  top: 112px;
  width: min(420px, 34vw);
  min-height: 220px;
  display: grid;
  grid-template-columns: 40% 60%;
  border: 1px solid rgba(220, 198, 137, 0.55);
  background: rgba(17, 14, 10, 0.96);
  color: #f8efd1;
  z-index: 30;
}

.card-detail__close {
  position: absolute;
  right: 8px;
  top: 6px;
}

.card-detail__art,
.card-detail__body {
  padding: 18px;
}

.card-detail__art {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(220, 198, 137, 0.35);
}

.story-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}

.story-overlay__bar {
  position: absolute;
  left: 0;
  right: 0;
  height: 7%;
  background: #030303;
}

.story-overlay__bar--top {
  top: 0;
}

.story-overlay__bar--bottom {
  bottom: 0;
}

.story-overlay__narration {
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 12%;
  min-height: 96px;
  border: 1px solid rgba(220, 198, 137, 0.55);
  background: rgba(0, 0, 0, 0.82);
  padding: 24px;
}

.story-box {
  position: absolute;
  left: 8%;
  right: 8%;
  min-height: 118px;
  display: grid;
  border: 1px solid rgba(220, 198, 137, 0.55);
  background: rgba(0, 0, 0, 0.82);
}

.story-box--npc {
  top: 10%;
  grid-template-columns: 1fr 120px;
}

.story-box--hero {
  bottom: 10%;
  grid-template-columns: 120px 1fr;
}

.story-box__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-inline: 1px solid rgba(220, 198, 137, 0.28);
}

.story-box__text {
  padding: 18px 24px;
}

.name-prompt {
  position: absolute;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.name-prompt form {
  display: grid;
  gap: 14px;
  width: 320px;
  border: 1px solid rgba(220, 198, 137, 0.55);
  background: #15110d;
  padding: 24px;
}

@keyframes cardPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

- [ ] **Step 6: Build to verify components compile**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit core UI components**

```bash
git add src/components src/styles.css
git commit -m "feat: add core prototype UI components"
```

## Task 8: Wire The Playable App

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/CardBoard.tsx`
- Create: `src/components/DebugPanel.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create CardBoard**

Create `src/components/CardBoard.tsx`:

```tsx
import { CardView } from './CardView';
import type { CardDefinition, CardInstance } from '../domain/types';

type CardBoardProps = {
  instances: CardInstance[];
  definitions: Record<string, CardDefinition>;
  onPickCard: (instanceId: string) => void;
  onDropCard: (sourceId: string, targetId?: string, position?: { x: number; y: number }) => void;
  onInspect: (card: CardInstance) => void;
};

export function CardBoard({ instances, definitions, onPickCard, onDropCard, onInspect }: CardBoardProps) {
  const visibleCards = instances.filter((card) => card.visible);

  return (
    <section className="board">
      <div className="board__fixed-zone">系统固定卡牌区（地点、重要角色、提示等）</div>
      <div className="board__hint">卡牌可以由玩家自由拖动</div>
      <div className="board__cards">
        {visibleCards.map((card) => {
          const definition = definitions[card.definitionId];
          return (
            <CardView
              key={card.instanceId}
              card={card}
              definition={definition}
              onPointerDown={() => onPickCard(card.instanceId)}
              onPointerUp={(event) => {
                const element = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-card-instance]');
                const targetId = element?.getAttribute('data-card-instance') ?? undefined;
                onDropCard(card.instanceId, targetId);
              }}
              onInspect={onInspect}
            />
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add data attribute to CardView**

Modify the root `<button>` in `src/components/CardView.tsx`:

```tsx
    <button
      className={className}
      data-card-instance={card.instanceId}
      style={{ left: `${card.position.x}%`, top: `${card.position.y}%`, zIndex: card.zIndex }}
      onPointerDown={(event) => onPointerDown?.(event, card)}
      onPointerUp={(event) => onPointerUp?.(event, card)}
      onDoubleClick={() => onInspect?.(card)}
      type="button"
    >
```

- [ ] **Step 3: Create DebugPanel**

Create `src/components/DebugPanel.tsx`:

```tsx
type DebugPanelProps = {
  currentSegmentId: string;
  onAdvanceStory: () => void;
  onReset: () => void;
};

export function DebugPanel({ currentSegmentId, onAdvanceStory, onReset }: DebugPanelProps) {
  return (
    <aside className="debug-panel">
      <strong>Debug</strong>
      <span>{currentSegmentId}</span>
      <button type="button" onClick={onAdvanceStory}>下一步剧情</button>
      <button type="button" onClick={onReset}>重置</button>
    </aside>
  );
}
```

- [ ] **Step 4: Wire App state**

Replace `src/App.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { CardBoard } from './components/CardBoard';
import { CardDetailPopover } from './components/CardDetailPopover';
import { DebugPanel } from './components/DebugPanel';
import { NamePrompt } from './components/NamePrompt';
import { StoryOverlay } from './components/StoryOverlay';
import { cards, interactions, storySegments } from './content';
import { runCommands } from './domain/commandRunner';
import { createInitialState } from './domain/initialState';
import { applyValidTargetHighlights, clearValidTargetHighlights, resolveInteraction } from './domain/interactionEngine';
import { advanceStory } from './domain/storyPlayer';
import type { CardInstance } from './domain/types';

export function App() {
  const initialState = useMemo(() => createInitialState(cards, interactions, storySegments[0]), []);
  const [gameState, setGameState] = useState(initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [inspectedCard, setInspectedCard] = useState<CardInstance | undefined>();

  function advance() {
    setGameState((state) => {
      const result = advanceStory(state, storySegments, stepIndex);
      setStepIndex(result.nextStepIndex);
      return result.state;
    });
  }

  function reset() {
    setGameState(createInitialState(cards, interactions, storySegments[0]));
    setStepIndex(0);
    setInspectedCard(undefined);
  }

  function handlePickCard(instanceId: string) {
    setGameState((state) => applyValidTargetHighlights(state, instanceId));
  }

  function handleDropCard(sourceId: string, targetId?: string) {
    setGameState((state) => {
      if (!targetId || sourceId === targetId) return clearValidTargetHighlights(state);
      const resolution = resolveInteraction(state, sourceId, targetId);
      if (!resolution) return clearValidTargetHighlights(state);
      return runCommands(resolution.state, resolution.commands);
    });
  }

  const inspectedDefinition = inspectedCard ? gameState.cards[inspectedCard.definitionId] : undefined;

  return (
    <main className="prototype">
      <CardBoard
        instances={gameState.cardInstances}
        definitions={gameState.cards}
        onPickCard={handlePickCard}
        onDropCard={handleDropCard}
        onInspect={setInspectedCard}
      />
      {gameState.storyMode ? <StoryOverlay activeLine={gameState.activeLine} /> : null}
      {gameState.awaitingName ? (
        <NamePrompt
          defaultName={gameState.playerName}
          onSubmit={(name) => {
            setGameState((state) =>
              runCommands(
                { ...state, playerName: name, awaitingName: false },
                [{ type: 'story.goto', segmentId: '1-2:start' }]
              )
            );
            setStepIndex(0);
          }}
        />
      ) : null}
      <CardDetailPopover card={inspectedCard} definition={inspectedDefinition} onClose={() => setInspectedCard(undefined)} />
      <DebugPanel currentSegmentId={gameState.currentSegmentId} onAdvanceStory={advance} onReset={reset} />
    </main>
  );
}
```

- [ ] **Step 5: Add board/debug styles**

Append to `src/styles.css`:

```css
.prototype {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #f5f3ef;
  color: #171717;
}

.board {
  position: absolute;
  inset: 0;
  background: #f7f6f2;
}

.board__fixed-zone {
  position: absolute;
  left: 7%;
  right: 7%;
  top: 4%;
  height: 24%;
  border: 1px solid #d8d2c4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
}

.board__hint {
  position: absolute;
  top: 39%;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 20px;
  font-weight: 650;
}

.board__cards {
  position: absolute;
  inset: 0;
}

.debug-panel {
  position: absolute;
  right: 16px;
  top: 16px;
  z-index: 80;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.88);
  color: #111;
}
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit playable wiring**

```bash
git add src/App.tsx src/components/CardBoard.tsx src/components/DebugPanel.tsx src/components/CardView.tsx src/styles.css
git commit -m "feat: wire playable prototype"
```

## Task 9: Add Asset Placeholders And Generated-Art Notes

**Files:**
- Create: `src/assets/card-faces/README.md`
- Create: `src/assets/card-faces/.gitkeep`
- Modify: `src/content/cards.ts`

- [ ] **Step 1: Create generated-art instructions**

Create `src/assets/card-faces/README.md`:

```md
# Card Face Assets

Card face assets are generated images.

Rules:

- Generate only the card face illustration.
- Do not include card name, card type, count, progress bar, description text, or UI labels.
- Use `洛德_720.png` as the style and proportion reference.
- Frontend UI renders all variable text and values.

Initial planned assets:

- `protagonist.png`
- `skill-self.png`
- `hands.png`
- `tree.png`
- `grass.png`
- `tattoo.png`
- `black-sun.png`
- `harvey.png`
```

Create `src/assets/card-faces/.gitkeep` as an empty file.

- [ ] **Step 2: Keep card data compatible with missing art**

Verify `CardView` already renders text fallback when `definition.art` is absent. No code change is needed for this step.

- [ ] **Step 3: Commit asset notes**

```bash
git add src/assets/card-faces
git commit -m "docs: add card face asset notes"
```

## Task 10: Run And Verify In Browser

**Files:**
- No source changes unless verification reveals a bug.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Expected: Vite prints `http://127.0.0.1:5173/`.

- [ ] **Step 2: Open browser and play 1-1**

Open `http://127.0.0.1:5173/`.

Expected:

- The board is visible.
- Use debug `下一步剧情` until protagonist card and `技能：我` appear.
- Drag `技能：我` onto `主角卡`.
- `技能：我` disappears.
- Name prompt appears.
- Submitting name advances to `1-2:start`.

- [ ] **Step 3: Play 1-2 interactions**

Expected:

- `树`、`草地`、`纹身`、`双手` appear.
- Picking `主角卡` highlights `树`、`纹身`、`双手`、`草地` while their interactions are still available.
- Picking `双手` highlights `草地`、`纹身`、`树` while their interactions are still available.
- Triggering `双手 -> 树` advances to black sun story.

- [ ] **Step 4: Verify story overlay layout**

Expected:

- Story mode uses top and bottom black bars.
- NPC dialogue appears at the top with avatar on the right.
- Protagonist dialogue appears at the bottom with avatar on the left.
- Narration uses the story overlay without incorrectly showing both speaker boxes.

- [ ] **Step 5: Final test/build**

Run:

```bash
npm test
npm run build
git status --short
```

Expected: tests and build pass. `git status --short` is empty after commits.

- [ ] **Step 6: Push**

```bash
git push
```

Expected: remote `main` includes all prototype commits.

## Self-Review

Spec coverage:

- Data-driven story and interactions are covered by Tasks 2-6.
- System案 exploration/story/card UI is covered by Tasks 7-8.
- `1-1` and `1-2` content is covered by Task 5.
- Optional progress bars are covered by types, CardView, and tests.
- Card replacement is covered by `card.replace` in Tasks 2-3 and Harvey content in Task 5.
- Valid-target highlight versus stronger emphasis is covered by Tasks 2, 3, 4, 7, and 8.
- Future editor readiness is covered by structured content files and serializable state.

Placeholder scan:

- The plan contains no `TBD`, `TODO`, or unspecified implementation steps.

Type consistency:

- `CardDefinition`, `CardInstance`, `InteractionRule`, `GameCommand`, and `GameState` are defined in Task 2 and reused consistently in later tasks.
