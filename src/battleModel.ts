import { createEffect, createEvent, createStore, sample } from 'effector';
import { createOpponent, loadBattle, saveBattle } from './roster';
import type { Opponent, Player } from './roster';
import { resolveRound } from './round';
import type { BattleState } from './round';

export const battleOpened = createEvent();
export const playerAdded = createEvent<string>();
export const playerChanged = createEvent<Player>();
export const playerRemoved = createEvent<string>();
export const opponentAdded = createEvent<string>();
export const opponentChanged = createEvent<{ id: string; opponent: Opponent }>();
export const opponentCopied = createEvent<{ sourceId: string; id: string }>();
export const opponentRemoved = createEvent<string>();
export const roundRequested = createEvent<ReadonlyMap<string, boolean>>();

const loadBattleFx = createEffect((): { battle: BattleState; warning: boolean } => {
  let saved;
  let warning = false;
  try {
    saved = loadBattle(localStorage);
  } catch {
    saved = { roster: [createOpponent(1)], players: [] };
    warning = true;
  }
  return {
    battle: {
      rows: saved.roster.map(opponent => ({ id: 'opponent-' + crypto.randomUUID(), opponent })),
      players: saved.players,
    },
    warning,
  };
});

const saveBattleFx = createEffect(({ rows, players }: BattleState) => {
  saveBattle(localStorage, { roster: rows.map(row => row.opponent), players });
});

const rollRoundFx = createEffect(({ battle, validRows }: {
  battle: BattleState;
  validRows: ReadonlyMap<string, boolean>;
}) => {
  const nextBattle = resolveRound(battle, validRows);
  return { nextBattle, armorChanged: battle.players !== nextBattle.players };
});

export const $battle = createStore<BattleState>({ rows: [], players: [] })
  .on(loadBattleFx.doneData, (_, { battle }) => battle)
  .on(playerAdded, (battle, id) => ({
    ...battle,
    players: [...battle.players, { id, name: 'Игрок ' + (battle.players.length + 1), armor: 0 }],
  }))
  .on(playerChanged, (battle, player) => ({
    ...battle,
    players: battle.players.map(candidate => candidate.id === player.id ? player : candidate),
  }))
  .on(playerRemoved, (battle, id) => ({
    players: battle.players.filter(player => player.id !== id),
    rows: battle.rows.map(row => row.opponent.targetId === id
      ? { ...row, opponent: { ...row.opponent, targetId: undefined }, outcome: undefined }
      : row),
  }))
  .on(opponentAdded, (battle, id) => ({
    ...battle,
    rows: [...battle.rows, { id, opponent: createOpponent(battle.rows.length + 1), autoFocus: true }],
  }))
  .on(opponentChanged, (battle, { id, opponent }) => ({
    ...battle,
    rows: battle.rows.map(row => row.id === id ? { ...row, opponent, outcome: undefined } : row),
  }))
  .on(opponentCopied, (battle, { sourceId, id }) => ({
    ...battle,
    rows: battle.rows.flatMap(row => row.id === sourceId
      ? [row, { id, opponent: { ...row.opponent, name: row.opponent.name + ' (копия)' }, autoFocus: true }]
      : [row]),
  }))
  .on(opponentRemoved, (battle, id) => ({
    ...battle,
    rows: battle.rows.filter(row => row.id !== id),
  }))
  .on(rollRoundFx.doneData, (_, { nextBattle }) => nextBattle);

export const $storageWarning = createStore(false)
  .on(loadBattleFx.doneData, (_, { warning }) => warning)
  .on(saveBattleFx.failData, () => true)
  .on(saveBattleFx.doneData, () => false);

sample({ clock: battleOpened, target: loadBattleFx });

sample({
  clock: [playerAdded, playerChanged, playerRemoved, opponentAdded, opponentChanged, opponentCopied, opponentRemoved],
  source: $battle,
  target: saveBattleFx,
});

sample({
  clock: roundRequested,
  source: $battle,
  fn: (battle, validRows) => ({ battle, validRows }),
  target: rollRoundFx,
});

sample({
  clock: rollRoundFx.doneData,
  filter: ({ armorChanged }) => armorChanged,
  fn: ({ nextBattle }) => nextBattle,
  target: saveBattleFx,
});
