import type { DialogueLine } from '../domain/types';

type StoryOverlayProps = {
  activeLine: DialogueLine;
  speakerName?: string;
};

const speakerNames: Record<string, string> = {
  protagonist: '洛德',
  unknown_harvey: '???',
  harvey: '哈维'
};

export function StoryOverlay({ activeLine, speakerName }: StoryOverlayProps) {
  const isProtagonist = activeLine.kind === 'dialogue' && activeLine.speakerId === 'protagonist';
  const displayName =
    activeLine.kind === 'dialogue'
      ? isProtagonist
        ? speakerName ?? speakerNames.protagonist
        : speakerNames[activeLine.speakerId] ?? activeLine.speakerId
      : undefined;

  return (
    <div className="story-overlay">
      <div className="story-overlay__bar story-overlay__bar--top" />
      <div className="story-overlay__bar story-overlay__bar--bottom" />
      {activeLine.kind === 'narration' ? <div className="story-overlay__narration">{activeLine.text}</div> : null}
      {activeLine.kind === 'dialogue' && isProtagonist ? (
        <div className="story-box story-box--hero">
          <div className="story-box__avatar">头像</div>
          <div className="story-box__text">
            <strong>{displayName}</strong>
            <p>{activeLine.text}</p>
          </div>
        </div>
      ) : null}
      {activeLine.kind === 'dialogue' && !isProtagonist ? (
        <div className="story-box story-box--npc">
          <div className="story-box__text">
            <strong>{displayName}</strong>
            <p>{activeLine.text}</p>
          </div>
          <div className="story-box__avatar">头像</div>
        </div>
      ) : null}
    </div>
  );
}
