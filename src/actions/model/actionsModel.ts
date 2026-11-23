import { createEffect, createEvent, createStore, sample } from 'effector';
import { createOpponent } from '../domain/roster';
import { loadActions, saveActions } from '../storage/actionsStorage';
import type { Opponent, Player } from '../domain/roster';
import { resolveAttacks } from '../domain/resolveAttacks';
import type { ActionsState } from '../domain/resolveAttacks';

export const actionsOpened = createEvent();
export const playerAdded = createEvent<string>();
export const playerChanged = createEvent<Player>();
export const playerRemoved = createEvent<string>();
export const opponentAdded = createEvent<string>();
export const opponentChanged = createEvent<{ id: string; opponent: Opponent; isValid: boolean }>();
export const opponentCopied = createEvent<{ sourceOpponentId: string; id: string }>();
export const opponentRemoved = createEvent<string>();
export const attacksRequested = createEvent<{ opponentId?: string }>();

const loadActionsFx = createEffect((): { actions: ActionsState; warning: boolean } => {
  let saved;
  let warning = false;
  try {
    saved = loadActions(localStorage);
  } catch {
    saved = { roster: [createOpponent(1)], players: [] };
    warning = true;
  }
  return {
    actions: {
      opponentEntries: saved.roster.map(opponent => ({ id: 'opponent-' + crypto.randomUUID(), opponent })),
      players: saved.players,
    },
    warning,
  };
});

const saveActionsFx = createEffect(({ opponentEntries, players }: ActionsState) => {
  saveActions(localStorage, { roster: opponentEntries.map(entry => entry.opponent), players });
});

const resolveAttacksFx = createEffect(({ actions, opponentId }: {
  actions: ActionsState;
  opponentId?: string;
}) => {
  const updatedActions = resolveAttacks(actions, opponentId);
  return { updatedActions, armorChanged: actions.players !== updatedActions.players };
});

export const $actions = createStore<ActionsState>({ opponentEntries: [], players: [] })
  .on(loadActionsFx.doneData, (_, { actions }) => actions)
  .on(playerAdded, (actions, id) => ({
    ...actions,
    players: [...actions.players, { id, name: 'Игрок ' + (actions.players.length + 1), armor: 0 }],
  }))
  .on(playerChanged, (actions, player) => ({
    ...actions,
    players: actions.players.map(candidate => candidate.id === player.id ? player : candidate),
  }))
  .on(playerRemoved, (actions, id) => ({
    players: actions.players.filter(player => player.id !== id),
    opponentEntries: actions.opponentEntries.map(entry => entry.opponent.targetId === id
      ? { ...entry, opponent: { ...entry.opponent, targetId: undefined }, outcome: undefined }
      : entry),
  }))
  .on(opponentAdded, (actions, id) => ({
    ...actions,
    opponentEntries: [...actions.opponentEntries, { id, opponent: createOpponent(actions.opponentEntries.length + 1) }],
  }))
  .on(opponentChanged, (actions, { id, opponent, isValid }) => ({
    ...actions,
    opponentEntries: actions.opponentEntries.map(entry => entry.id === id
      ? { ...entry, opponent, invalidDraft: !isValid, outcome: undefined }
      : entry),
  }))
  .on(opponentCopied, (actions, { sourceOpponentId, id }) => ({
    ...actions,
    opponentEntries: actions.opponentEntries.flatMap(entry => entry.id === sourceOpponentId
      ? [entry, { id, opponent: { ...entry.opponent, name: entry.opponent.name + ' (копия)' } }]
      : [entry]),
  }))
  .on(opponentRemoved, (actions, id) => ({
    ...actions,
    opponentEntries: actions.opponentEntries.filter(entry => entry.id !== id),
  }))
  .on(resolveAttacksFx.doneData, (_, { updatedActions }) => updatedActions);

export const $players = $actions.map(actions => actions.players);
export const $opponentEntries = $actions.map(actions => actions.opponentEntries);

export const $storageWarning = createStore(false)
  .on(loadActionsFx.doneData, (_, { warning }) => warning)
  .on(saveActionsFx.failData, () => true)
  .on(saveActionsFx.doneData, () => false);

sample({ clock: actionsOpened, target: loadActionsFx });

sample({
  clock: [playerAdded, playerChanged, playerRemoved, opponentAdded, opponentChanged, opponentCopied, opponentRemoved],
  source: $actions,
  target: saveActionsFx,
});

sample({
  clock: attacksRequested,
  source: $actions,
  fn: (actions, { opponentId }) => ({ actions, opponentId }),
  target: resolveAttacksFx,
});

sample({
  clock: resolveAttacksFx.doneData,
  filter: ({ armorChanged }) => armorChanged,
  fn: ({ updatedActions }) => updatedActions,
  target: saveActionsFx,
});
