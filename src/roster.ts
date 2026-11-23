import { Attack, weapons } from './combat';

export interface Opponent extends Attack {
  name: string;
  targetId?: string;
}

export interface Player {
  id: string;
  name: string;
  armor: number;
}

interface Battle {
  roster: Opponent[];
  players: Player[];
}

const storageKey = 'cprc.roster.v1';

export function createOpponent(number: number): Opponent {
  return {
    name: 'Противник ' + number,
    weapon: 'pistol',
    base: 10,
    modifier: 0,
    distance: 6,
    dice: weapons.pistol.dice,
    armor: 0,
    evasion: null,
  };
}

export function loadBattle(storage: Storage): Battle {
  const saved: unknown = JSON.parse(storage.getItem(storageKey) ?? 'null');
  if (saved === null) return { roster: [createOpponent(1)], players: [] };
  if (Array.isArray(saved) && saved.every(isOpponent)) {
    return { roster: saved, players: [] };
  }
  if (typeof saved === 'object') {
    const { roster, players } = saved as Partial<Battle>;
    if (Array.isArray(roster) && roster.every(isOpponent) &&
      Array.isArray(players) && players.every(isPlayer)) {
      return { roster, players };
    }
  }
  throw new Error('Invalid saved battle');
}

function isPlayer(value: unknown): value is Player {
  if (typeof value !== 'object' || value === null) return false;
  const player = value as Partial<Player>;
  return typeof player.id === 'string' && player.id !== '' &&
    typeof player.name === 'string' &&
    typeof player.armor === 'number' && Number.isInteger(player.armor) && player.armor >= 0;
}

function isOpponent(value: unknown): value is Opponent {
  if (typeof value !== 'object' || value === null) return false;
  const opponent = value as Partial<Opponent>;
  return typeof opponent.name === 'string' &&
    (opponent.targetId === undefined || typeof opponent.targetId === 'string') &&
    typeof opponent.weapon === 'string' &&
    Object.prototype.hasOwnProperty.call(weapons, opponent.weapon) &&
    Number.isInteger(opponent.base) &&
    Number.isInteger(opponent.modifier) &&
    typeof opponent.distance === 'number' && Number.isFinite(opponent.distance) && opponent.distance >= 0 &&
    typeof opponent.dice === 'number' && Number.isInteger(opponent.dice) && opponent.dice >= 1 && opponent.dice <= 30 &&
    typeof opponent.armor === 'number' && Number.isInteger(opponent.armor) && opponent.armor >= 0 &&
    (opponent.evasion === null || Number.isInteger(opponent.evasion));
}

export function saveBattle(storage: Storage, battle: Battle): void {
  storage.setItem(storageKey, JSON.stringify(battle));
}
