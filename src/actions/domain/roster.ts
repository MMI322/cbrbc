import { weapons } from './rangedAttack';
import type { Attack } from './rangedAttack';

export interface Opponent extends Attack {
  name: string;
  targetId?: string;
}

export interface Player {
  id: string;
  name: string;
  armor: number;
}

export interface SavedActions {
  roster: Opponent[];
  players: Player[];
}

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
