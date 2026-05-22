export type CardType = 'protagonist' | 'skill' | 'location' | 'item' | 'character' | 'hint';
export type CardZone = 'fixed' | 'free';

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
  startedAt: number;
  durationMs?: number;
};

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

export type StoryStep = GameCommand[];

export type StorySegment = {
  id: string;
  title: string;
  steps: StoryStep[];
  next?: string;
};

export type InteractionAttempt = {
  attempt: number | 'repeat';
  enabled: boolean;
  previewText?: string;
  results: GameCommand[];
};

export type InteractionCondition =
  | { type: 'flagEquals'; key: string; value: boolean | string | number }
  | { type: 'cardVisible'; cardId: string; visible: boolean };

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
  storyStepIndex: number;
  cards: Record<string, CardDefinition>;
  cardInstances: CardInstance[];
  interactionRules: InteractionRule[];
  interactionStates: Record<string, InteractionState>;
  storyMode: boolean;
  activeLine: DialogueLine;
  flags: Record<string, boolean | string | number>;
  playerName: string;
  awaitingName: boolean;
  lastEffect?: string;
};
