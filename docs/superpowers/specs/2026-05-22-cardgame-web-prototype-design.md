# Cardgame Web Prototype Design

Date: 2026-05-22

## Goal

Build a Web prototype for the first playable slice of `福瑞勇者从不战败`.

The prototype must validate the core loop:

1. Play a story segment.
2. Enter card interaction.
3. Trigger the next story segment from card interaction.

The first content pass includes both `1-1` and `1-2`.

## Source References

Primary Feishu documents:

- Wiki space: `7390585220017209345`
- System doc: `https://my.feishu.cn/wiki/BPZiwa0wMieu1hkq0cFcE3Xan8e`
- Script sheet: `剧情TimeLine`
- Exploration timeline: `探索TimeLine / 1-1 / 1-2`

Local reference images downloaded from the system doc:

- `docs/reference-images/system-normal-explore.png`
- `docs/reference-images/system-story-view.png`
- `docs/reference-images/system-card-detail.png`

Local card style reference:

- `洛德_720.png`

## Confirmed Constraints

- The first implementation is a Web prototype.
- The first version should be data-driven, not hard-coded around only `1-1` and `1-2`.
- A full editor is not part of this first prototype, but it is a confirmed future requirement.
- Data structures must be editor-friendly from the start.
- The card progress bar is optional. It represents special read-time, charge, or progress behavior for some cards only. Normal cards do not show a progress bar.
- Generated card art should only cover the card face illustration. Card name, type, count, optional progress bar, and descriptions are rendered by UI and remain data-driven.

## Architecture

The prototype has four core runtime layers.

### StoryPlayer

Reads story segment data and plays steps in order.

Story steps can include:

- narration
- character dialogue
- screen effects such as blink, fade, shake, focus, black screen
- card generation
- card movement or reveal commands
- story mode enter and exit
- name prompt
- transition to another segment

### CardBoard

Owns the exploration UI defined by the system doc.

The board has two main areas:

- Fixed system card area at the top for locations, important characters, prompts, and other special cards.
- Free card area below for draggable player cards.

Fixed-area cards are positioned by system rules and appear in chronological order. Free-area cards can be dragged by the player. Same-name cards may stack and increase count.

### InteractionEngine

Evaluates card interactions and emits results.

An interaction rule defines:

- source card
- target card or target zone
- conditions
- resulting story segment or effects

Example: dragging skill card `我` onto `主角卡` triggers the `1-1` fusion sequence and then opens the name prompt.

### GameState

Stores runtime progress:

- current story segment
- generated cards
- card positions
- card counts
- stack state
- player name
- whether story mode is active
- which cards are interactable during story mode

## Data Model

### CardDefinition

Static card definition.

Fields:

- `id`
- `name`
- `type`
- `description`
- `art`
- `zone`: fixed or free
- `stackable`
- optional `progress`

`progress` is absent for ordinary cards. When present, the UI renders a progress bar and related value.

### StorySegment

A named sequence of story steps.

Fields:

- `id`
- `title`
- `steps`
- optional `next`

Story segments are content data, not component logic. This keeps the future editor path open.

### StoryStep

A discriminated step object.

Expected step types:

- `narration`
- `dialogue`
- `effect`
- `spawnCard`
- `focusCard`
- `moveCard`
- `renameCard`
- `setInteractable`
- `promptName`
- `enterStoryMode`
- `exitStoryMode`
- `goto`

### InteractionRule

Describes a card interaction.

Fields:

- `id`
- `sourceCardId`
- `targetCardId` or `targetZone`
- optional `conditions`
- `results`

Results use the same command vocabulary as story steps where possible.

### GameProgress

Serializable runtime state.

This is shaped so a future editor/debugger can inspect it without reading component internals.

## UI Design

The UI follows the `系统案` images as hard layout constraints.

### Normal Exploration View

The normal exploration view contains:

- top fixed card area
- lower free card area
- freely draggable cards in the free area

The fixed area sits at the lowest display layer. Newly generated fixed cards are arranged by time order. Players interact with fixed cards by dragging or using other cards.

### Story View

When story mode starts:

- black bars appear at the top and bottom
- the visible stage contracts vertically
- NPC dialogue appears in the upper dialogue box with avatar on the right
- protagonist dialogue appears in the lower dialogue box with avatar on the left
- the corresponding dialogue box is hidden when no line is active
- non-special cards fade out and become non-interactable
- camera zoom, pan, and focus behavior remains available

CG appears below dialogue boxes. When CG is displayed, the black bars restore to original dimensions according to the system doc.

### Card View

The card body renders:

- card face art
- card type
- card name
- count
- optional progress bar

The progress bar appears only when the card definition includes progress behavior.

### Card Detail Popover

Hovering for a delay or clicking a card opens its detail panel.

The detail panel contains:

- card face art
- card type
- card name
- count
- card description

The panel appears to the left or right of the card based on available space.

## First Playable Flow

### 1-1

Start in the `1-1 intro` story segment.

Flow:

1. Begin with black screen and blink effects.
2. Show the protagonist card.
3. Spawn skill card `我`.
4. Enter forced tutorial state.
5. Only allow dragging `我` onto `主角卡`.
6. On successful drag, play fusion effect: card frame break, `我` dissolves into protagonist card, protagonist card lights up.
7. Open name prompt.
8. Save player name.
9. Continue to `1-2`.

### 1-2

Enter exploration state and spawn:

- `树`
- `草地`
- `纹身`
- `双手`

The first prototype implements the key progression interaction:

- `双手` or protagonist action interacts with `树`.
- The tree interaction triggers the climb sequence.
- Generate or focus `黑日`.
- Play the black sun discovery story.
- Continue into the Harvey encounter.
- Generate `???` and later rename it to `哈维`.

The first prototype ends after Harvey appears and enters dialogue.

## Asset Strategy

Card face art is generated with image generation and references the existing `洛德_720.png` card style and approximate proportions.

Generated art should only include the illustration/card-face area. It must not include card name, card type, count, progress bar, description text, or other variable UI labels.

Initial card face needs:

- 主角 / 洛德
- 技能：我
- 技能：双手
- 地点：树
- 地点：草地
- 物品：纹身
- 地点 / 提示：黑日
- 角色：哈维 / ???

## Future Editor Requirement

The editor is confirmed as a future requirement.

The first prototype will not build the editor UI, but must avoid implementation choices that block it. In practice this means:

- content lives in structured data files
- story commands and interaction rules are explicit
- card definitions are reusable
- runtime state is inspectable and serializable
- component logic does not encode content-specific progression directly

Future editor surfaces should be able to edit:

- card definitions
- story segments
- story steps
- interaction rules
- generated card placement
- optional progress behavior

## Non-Goals For First Prototype

The first prototype does not include:

- full visual novel feature set
- battle system
- shop
- achievements
- gallery
- save/load UX
- editor UI
- production-quality generated art for every future card

## Acceptance Criteria

- `1-1` can be played from the start.
- The player can drag `我` onto `主角卡`.
- The fusion/tutorial interaction advances the story.
- The player can enter a name.
- `1-2` exploration starts after `1-1`.
- The relevant cards spawn in the correct exploration view.
- Cards in the free area can be dragged.
- The tree interaction triggers the black sun story.
- Harvey appears and the prototype reaches the planned stopping point.
- Story mode, exploration mode, and card detail UI follow the `系统案` reference layouts.
- Ordinary cards do not show progress bars.
- Cards configured with progress behavior can show a progress bar.
- Content data and runtime logic are separated enough to support a future editor.

## Testing Notes

Manual playtest paths:

- full `1-1` to `1-2` happy path
- attempt invalid drag during forced tutorial
- inspect card detail popover on cards with and without progress
- verify non-special cards cannot be interacted with during story mode
- reset and replay from start

Implementation-level tests should focus on:

- story step reducer behavior
- interaction rule matching
- card stacking/count behavior
- progress bar rendering only when configured
- `GameState` serialization shape
