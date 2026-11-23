import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { useId, useState } from 'react';
import type { Player } from '../domain/roster';

export function PlayerCard({ player, autoFocus, onChange, onRemove }: {
  player: Player;
  autoFocus: boolean;
  onChange: (player: Player) => void;
  onRemove: () => void;
}) {
  const nameId = useId();
  const [invalidArmor, setInvalidArmor] = useState<{ value: string; previous: number }>();
  return (
    <Card className="player-row">
      <div className="player-name">
        <label htmlFor={nameId}>Имя</label>
        <Input id={nameId} required defaultValue={player.name} autoFocus={autoFocus} onChange={event => {
          if (event.target.validity.valid) onChange({ ...player, name: event.target.value });
        }} />
      </div>
      <label>SP<Input type="number" min="0" required
        value={invalidArmor?.previous === player.armor ? invalidArmor.value : player.armor}
        onBlur={() => setInvalidArmor(undefined)}
        onChange={event => {
          if (event.target.validity.valid) {
            setInvalidArmor(undefined);
            onChange({ ...player, armor: event.target.valueAsNumber });
          } else {
            setInvalidArmor({ value: event.target.value, previous: player.armor });
          }
        }} /></label>
      <Button variant="secondary" type="button" aria-label={'Удалить игрока ' + player.name} onClick={onRemove}>Удалить</Button>
    </Card>
  );
}
