import { Badge } from '../../ui/Badge';
import type { AttackOutcome } from '../domain/resolveAttacks';

function describeAttackOutcome(result: AttackOutcome): string {
  if (result.kind === 'invalid-draft') return 'Проверьте значения в строке';
  if (result.kind === 'out-of-range') return 'Вне дальности';
  const extra = result.extra > 0 ? ' +' + result.extra : result.extra < 0 ? ' ' + result.extra : '';
  const check = result.total + ' против ' + result.threshold + ' (d10: ' + result.first + extra + ')';
  if (result.kind === 'miss') return check;
  return check + ' · урон ' + result.rawDamage + ' [' + result.dice.join(', ') + ']' +
    (result.critical ? ' · критическая травма (+5 HP урона)' : '');
}

export function AttackResult({ outcome }: { outcome?: AttackOutcome }) {
  return (
    <output aria-live="polite" className="attack-result">
      {outcome?.kind === 'hit' && (
        <span className="attack-summary">
          <Badge variant="success">Попадание</Badge>
          <strong>−{outcome.hpDamage} HP</strong>
          <span>SP {outcome.startingArmor} → {outcome.armorAfter}</span>
        </span>
      )}
      {outcome?.kind === 'miss' && <Badge variant="destructive">Промах</Badge>}
      {outcome && <span>{describeAttackOutcome(outcome)}</span>}
    </output>
  );
}
