import { resolveAttack } from './rangedAttack';
import type { Opponent, Player } from './roster';

export type AttackOutcome = { kind: 'invalid-draft' } |
  (ReturnType<typeof resolveAttack> & { startingArmor: number });

export interface OpponentEntry {
  id: string;
  opponent: Opponent;
  outcome?: AttackOutcome;
  invalidDraft?: boolean;
}

export interface ActionsState {
  opponentEntries: OpponentEntry[];
  players: Player[];
}

export function resolveAttacks(
  { opponentEntries, players }: ActionsState,
  opponentId?: string,
  roll?: (sides: number) => number,
): ActionsState {
  let nextPlayers = players;
  const updatedOpponentEntries = opponentEntries.map(entry => {
    if (opponentId !== undefined && entry.id !== opponentId) return entry;
    if (entry.invalidDraft || entry.opponent.name === '') {
      return { ...entry, outcome: { kind: 'invalid-draft' } as const };
    }
    const player = nextPlayers.find(candidate => candidate.id === entry.opponent.targetId);
    const armor = player?.armor ?? entry.opponent.armor;
    const result = resolveAttack({ ...entry.opponent, armor }, roll);
    if (result.kind === 'hit' && player && result.armorAfter !== armor) {
      nextPlayers = nextPlayers.map(candidate =>
        candidate.id === player.id ? { ...candidate, armor: result.armorAfter } : candidate);
    }
    return { ...entry, outcome: { ...result, startingArmor: armor } };
  });
  return { opponentEntries: updatedOpponentEntries, players: nextPlayers };
}
