import { useRef, useState } from 'react';
import { CardView } from './CardView';
import type { CardDefinition, CardInstance, Position } from '../domain/types';

type CardBoardProps = {
  instances: CardInstance[];
  definitions: Record<string, CardDefinition>;
  onPickCard: (instanceId: string) => void;
  onMoveCard: (instanceId: string, position: Position) => void;
  onDropCard: (sourceId: string, targetId?: string) => void;
  onInspect: (card: CardInstance) => void;
};

export function CardBoard({ instances, definitions, onPickCard, onMoveCard, onDropCard, onInspect }: CardBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string>();
  const [hoverTargetId, setHoverTargetId] = useState<string>();
  const visibleCards = instances.filter((card) => card.visible);

  function toBoardPosition(clientX: number, clientY: number): Position | undefined {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return undefined;
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100, 4, 96),
      y: clamp(((clientY - rect.top) / rect.height) * 100, 8, 92)
    };
  }

  function findDropTarget(clientX: number, clientY: number, sourceId: string) {
    return document
      .elementsFromPoint(clientX, clientY)
      .map((element) => element.closest<HTMLElement>('[data-card-instance]'))
      .find((element) => element && element.dataset.cardInstance !== sourceId && element.classList.contains('card-view--highlight'))
      ?.dataset.cardInstance;
  }

  return (
    <section className="board" ref={boardRef}>
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
              isDragging={draggingId === card.instanceId}
              isDropPreview={hoverTargetId === card.instanceId}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDraggingId(card.instanceId);
                setHoverTargetId(undefined);
                onPickCard(card.instanceId);
              }}
              onPointerMove={(event) => {
                if (draggingId !== card.instanceId) return;
                const targetId = findDropTarget(event.clientX, event.clientY, card.instanceId);
                setHoverTargetId(targetId);
                const targetCard = targetId ? instances.find((item) => item.instanceId === targetId) : undefined;
                const position = targetCard
                  ? { x: targetCard.position.x, y: clamp(targetCard.position.y + 7, 8, 92) }
                  : toBoardPosition(event.clientX, event.clientY);
                if (position) onMoveCard(card.instanceId, position);
              }}
              onPointerUp={(event) => {
                if (draggingId !== card.instanceId) return;
                event.currentTarget.releasePointerCapture(event.pointerId);
                setDraggingId(undefined);
                const targetId = hoverTargetId ?? findDropTarget(event.clientX, event.clientY, card.instanceId);
                setHoverTargetId(undefined);
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
