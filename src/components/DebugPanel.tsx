type DebugPanelProps = {
  currentSegmentId: string;
  storyStepIndex: number;
  onAdvanceStory: () => void;
  onReset: () => void;
};

export function DebugPanel({ currentSegmentId, storyStepIndex, onAdvanceStory, onReset }: DebugPanelProps) {
  return (
    <aside className="debug-panel">
      <strong>Debug</strong>
      <span>
        {currentSegmentId} / {storyStepIndex}
      </span>
      <button type="button" onClick={onAdvanceStory}>
        继续剧情
      </button>
      <button type="button" onClick={onReset}>
        重置
      </button>
    </aside>
  );
}
