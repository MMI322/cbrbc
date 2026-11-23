export const rangeLimits = [6, 12, 25, 50, 100, 200, 400, 800];

export const weapons = {
  pistol: { label: 'Пистолет', dice: 3, dv: [13, 15, 20, 25, 30, 30] },
  smg: { label: 'Пистолет-пулемёт', dice: 2, dv: [15, 13, 15, 20, 25, 25, 30] },
  shotgun: { label: 'Дробовик (пуля)', dice: 5, dv: [13, 15, 20, 25, 30, 35] },
  rifle: { label: 'Штурмовая винтовка', dice: 5, dv: [17, 16, 15, 13, 15, 20, 25, 30] },
  sniper: { label: 'Снайперская винтовка', dice: 5, dv: [30, 25, 25, 20, 15, 16, 17, 20] },
  bow: { label: 'Лук / арбалет', dice: 4, dv: [15, 13, 15, 17, 20, 22] },
};

export type Weapon = keyof typeof weapons;

export interface Attack {
  weapon: Weapon;
  base: number;
  modifier: number;
  distance: number;
  dice: number;
  armor: number;
  evasion: number | null;
}

export function rangeDifficulty(weapon: Weapon, distance: number): number | undefined {
  const band = rangeLimits.findIndex(limit => distance <= limit);
  return weapons[weapon].dv[band];
}

function rollDie(sides: number): number {
  return 1 + Math.floor(Math.random() * sides);
}

export function resolveAttack(attack: Attack, roll = rollDie) {
  const rangeDv = rangeDifficulty(attack.weapon, attack.distance);
  if (rangeDv === undefined) return { kind: 'out-of-range' } as const;

  const threshold = attack.evasion ?? rangeDv;
  const first = roll(10);
  const extra = first === 10 ? roll(10) : first === 1 ? -roll(10) : 0;
  const total = attack.base + attack.modifier + first + extra;
  const check = { first, extra, total, threshold };
  if (total <= threshold) return { kind: 'miss', ...check } as const;

  const dice = Array.from({ length: attack.dice }, () => roll(6));
  const rawDamage = dice.reduce((sum, die) => sum + die, 0);
  const penetrating = Math.max(0, rawDamage - attack.armor);
  const critical = dice.filter(die => die === 6).length >= 2;

  return {
    kind: 'hit',
    ...check,
    dice,
    rawDamage,
    critical,
    hpDamage: penetrating + (critical ? 5 : 0),
    armorAfter: Math.max(0, attack.armor - (penetrating > 0 ? 1 : 0)),
  } as const;
}
