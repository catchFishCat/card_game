import { useMemo, useState } from 'react';
import { CardBoard } from './components/CardBoard';
import { CardDetailPopover } from './components/CardDetailPopover';
import { DebugPanel } from './components/DebugPanel';
import { NamePrompt } from './components/NamePrompt';
import { StoryOverlay } from './components/StoryOverlay';
import { cards, interactions, storySegments } from './content';
import { resetInstanceIdCounter, runCommands } from './domain/commandRunner';
import { createInitialState } from './domain/initialState';
import { applyValidTargetHighlights, clearValidTargetHighlights, resolveInteraction } from './domain/interactionEngine';
import { advanceStory } from './domain/storyPlayer';
import type { CardInstance, Position } from './domain/types';

function makeInitialState() {
  resetInstanceIdCounter();
  return createInitialState(cards, interactions, storySegments[0]);
}

export function App() {
  const initialState = useMemo(() => makeInitialState(), []);
  const [gameState, setGameState] = useState(initialState);
  const [inspectedCard, setInspectedCard] = useState<CardInstance | undefined>();

  function advance() {
    setGameState((state) => advanceStory(state, storySegments));
  }

  function reset() {
    setGameState(makeInitialState());
    setInspectedCard(undefined);
  }

  function handlePickCard(instanceId: string) {
    setGameState((state) => applyValidTargetHighlights(state, instanceId));
  }

  function handleMoveCard(instanceId: string, position: Position) {
    setGameState((state) => ({
      ...state,
      cardInstances: state.cardInstances.map((card) => (card.instanceId === instanceId ? { ...card, position, zIndex: 99 } : card))
    }));
  }

  function handleDropCard(sourceId: string, targetId?: string) {
    setGameState((state) => {
      if (!targetId || sourceId === targetId) return clearValidTargetHighlights(state);
      const resolution = resolveInteraction(state, sourceId, targetId);
      if (!resolution) return clearValidTargetHighlights(state);
      return runCommands(resolution.state, resolution.commands);
    });
  }

  function submitName(name: string) {
    setGameState((state) => {
      const named = {
        ...state,
        playerName: name,
        awaitingName: false,
        cards: {
          ...state.cards,
          protagonist: {
            ...state.cards.protagonist,
            name
          }
        }
      };
      return advanceStory(named, storySegments);
    });
  }

  const inspectedDefinition = inspectedCard ? gameState.cards[inspectedCard.definitionId] : undefined;

  return (
    <main className="prototype">
      <CardBoard
        instances={gameState.cardInstances}
        definitions={gameState.cards}
        onPickCard={handlePickCard}
        onMoveCard={handleMoveCard}
        onDropCard={handleDropCard}
        onInspect={setInspectedCard}
      />
      {gameState.storyMode ? (
        <button className="story-advance-layer" type="button" aria-label="点击继续剧情" onClick={advance} />
      ) : null}
      {gameState.storyMode ? <StoryOverlay activeLine={gameState.activeLine} speakerName={gameState.playerName} /> : null}
      {gameState.awaitingName ? <NamePrompt defaultName={gameState.playerName} onSubmit={submitName} /> : null}
      <CardDetailPopover card={inspectedCard} definition={inspectedDefinition} onClose={() => setInspectedCard(undefined)} />
      <DebugPanel
        currentSegmentId={gameState.currentSegmentId}
        storyStepIndex={gameState.storyStepIndex}
        onAdvanceStory={advance}
        onReset={reset}
      />
    </main>
  );
}
