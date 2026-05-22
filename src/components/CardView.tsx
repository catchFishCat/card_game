import type { PointerEvent } from 'react';
import type { CardDefinition, CardInstance } from '../domain/types';

type CardViewProps = {
  card: CardInstance;
  definition: CardDefinition;
  isDragging?: boolean;
  isDropPreview?: boolean;
  onPointerDown?: (event: PointerEvent, card: CardInstance) => void;
  onPointerMove?: (event: PointerEvent, card: CardInstance) => void;
  onPointerUp?: (event: PointerEvent, card: CardInstance) => void;
  onInspect?: (card: CardInstance) => void;
};

const typeLabel: Record<CardDefinition['type'], string> = {
  protagonist: '主角',
  skill: '技能',
  location: '地点',
  item: '物品',
  character: '角色',
  hint: '提示'
};

export function CardView({
  card,
  definition,
  isDragging,
  isDropPreview,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onInspect
}: CardViewProps) {
  const progress = definition.progress
    ? Math.round((((card.progressValue ?? definition.progress.initial ?? 0) / definition.progress.max) * 100))
    : undefined;
  const className = [
    'card-view',
    `card-view--${definition.type}`,
    card.highlightState ? 'card-view--highlight' : '',
    card.emphasisState ? 'card-view--emphasis' : '',
    isDragging ? 'card-view--dragging' : '',
    isDropPreview ? 'card-view--drop-preview' : '',
    !card.enabled ? 'card-view--disabled' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={className}
      data-card-instance={card.instanceId}
      style={{ left: `${card.position.x}%`, top: `${card.position.y}%`, zIndex: card.zIndex }}
      type="button"
      title={`${definition.name}：${definition.description ?? ''}`}
      onPointerDown={(event) => onPointerDown?.(event, card)}
      onPointerMove={(event) => onPointerMove?.(event, card)}
      onPointerUp={(event) => onPointerUp?.(event, card)}
      onDoubleClick={() => onInspect?.(card)}
    >
      <span className="card-view__art">{definition.art ? <img src={definition.art} alt="" /> : <span>{artGlyph(definition)}</span>}</span>
      <span className="card-view__type">{typeLabel[definition.type]}</span>
      <strong className="card-view__name">{definition.name}</strong>
      {definition.progress ? (
        <span className="card-view__progress" aria-label={`进度 ${progress}%`}>
          <span style={{ width: `${progress}%` }} />
        </span>
      ) : null}
      {card.count > 1 ? <span className="card-view__count">{card.count}</span> : null}
    </button>
  );
}

function artGlyph(definition: CardDefinition) {
  if (definition.id === 'tree') return '树';
  if (definition.id === 'grass') return '草';
  if (definition.id === 'tattoo') return '纹';
  if (definition.id === 'hands') return '掌';
  if (definition.id === 'black_sun') return '黑日';
  if (definition.id === 'unknown_harvey') return '?';
  if (definition.id === 'harvey') return '哈维';
  if (definition.id === 'skill_self') return '我';
  return '洛德';
}
