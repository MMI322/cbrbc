import { resolveAttack } from './combat';
import type { Opponent, Player } from './roster';

export interface Outcome {
  text: string;
  style: 'hit' | 'miss';
}

export interface Row {
  id: string;
  opponent: Opponent;
  outcome?: Outcome;
  autoFocus?: boolean;
}

export interface BattleState {
  rows: Row[];
  players: Player[];
}

function formatOutcome(result: ReturnType<typeof resolveAttack>, armor: number): Outcome {
  if (result.kind === 'out-of-range') return { text: 'Вне дальности', style: 'miss' };
  const extra = result.extra > 0 ? ' +' + result.extra : result.extra < 0 ? ' ' + result.extra : '';
  const check = result.total + ' против ' + result.threshold + ' (d10: ' + result.first + extra + ')';
  if (result.kind === 'miss') return { text: 'Промах · ' + check, style: 'miss' };
  return {
    style: 'hit',
    text: 'Попадание · ' + check + ' · ' + result.hpDamage + ' HP · SP ' + armor + ' → ' +
      result.armorAfter + ' · урон ' + result.rawDamage + ' [' + result.dice.join(', ') + ']' +
      (result.critical ? ' · критическая травма (+5 HP урона)' : ''),
  };
}

export function resolveRound(
  { rows, players }: BattleState,
  validRows: ReadonlyMap<string, boolean>,
  roll?: (sides: number) => number,
): BattleState {
  let nextPlayers = players;
  const nextRows = rows.map(row => {
    const valid = validRows.get(row.id);
    if (valid === undefined) return row;
    if (!valid) {
      return { ...row, outcome: { text: 'Проверьте значения в строке', style: 'miss' } as const };
    }
    const player = nextPlayers.find(candidate => candidate.id === row.opponent.targetId);
    const armor = player?.armor ?? row.opponent.armor;
    const result = resolveAttack({ ...row.opponent, armor }, roll);
    if (result.kind === 'hit' && player && result.armorAfter !== armor) {
      nextPlayers = nextPlayers.map(candidate =>
        candidate.id === player.id ? { ...candidate, armor: result.armorAfter } : candidate);
    }
    return { ...row, outcome: formatOutcome(result, armor) };
  });
  return { rows: nextRows, players: nextPlayers };
}
