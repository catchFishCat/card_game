import type { CardDefinition, CardInstance } from '../domain/types';

type CardDetailPopoverProps = {
  card?: CardInstance;
  definition?: CardDefinition;
  onClose: () => void;
};

export function CardDetailPopover({ card, definition, onClose }: CardDetailPopoverProps) {
  if (!card || !definition) return null;

  const progress = definition.progress
    ? Math.round((((card.progressValue ?? definition.progress.initial ?? 0) / definition.progress.max) * 100))
    : undefined;

  return (
    <aside className="card-detail">
      <button className="card-detail__close" type="button" onClick={onClose} aria-label="关闭详情">
        x
      </button>
      <div className="card-detail__art">{definition.art ? <img src={definition.art} alt="" /> : definition.name}</div>
      <div className="card-detail__body">
        <div className="card-detail__header">
          <strong>{definition.name}</strong>
          <span>{definition.type}</span>
        </div>
        <p>{definition.description ?? '暂无描述。'}</p>
        <small>持有数量：{card.count}</small>
        {definition.progress ? <small>读条进度：{progress}%</small> : null}
      </div>
    </aside>
  );
}
