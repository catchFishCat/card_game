import { runCommands } from './commandRunner';
import type { GameState, StorySegment } from './types';

export function advanceStory(state: GameState, segments: StorySegment[]): GameState {
  const segment = segments.find((item) => item.id === state.currentSegmentId);
  if (!segment) return state;

  const step = segment.steps[state.storyStepIndex];
  if (!step) {
    if (segment.next) {
      return { ...state, currentSegmentId: segment.next, storyStepIndex: 0 };
    }
    if (state.storyMode && state.activeLine.kind !== 'none') {
      return runCommands(state, [{ type: 'story.exitMode' }]);
    }
    return state;
  }

  const beforeSegmentId = state.currentSegmentId;
  const next = runCommands(state, step);
  if (next.currentSegmentId !== beforeSegmentId) {
    return { ...next, storyStepIndex: 0 };
  }
  return { ...next, storyStepIndex: state.storyStepIndex + 1 };
}
