import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { useId, useRef, useState } from 'react';
import { Select } from '../../ui/Select';
import { rangeDifficulty, rangeLimits, weapons } from '../domain/rangedAttack';
import type { Opponent, Player } from '../domain/roster';
import type { AttackOutcome } from '../domain/resolveAttacks';
import { AttackResult } from './AttackResult';

interface Props {
  opponent: Opponent;
  players: Player[];
  outcome?: AttackOutcome;
  autoFocus?: boolean;
  onChange: (opponent: Opponent, isValid: boolean) => void;
  onRoll: () => void;
  onCopy: () => void;
  onRemove: () => void;
}

const weaponOptions = Object.entries(weapons).map(([value, preset]) => ({ value, label: preset.label }));
const manualTarget = 'manual';

export function OpponentCard({ opponent, players, outcome, autoFocus, onChange, onRoll, onCopy, onRemove }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const diceRef = useRef<HTMLInputElement>(null);
  const distanceRef = useRef<HTMLInputElement>(null);
  const weaponSelectId = useId();
  const targetSelectId = useId();
  const [weapon, setWeapon] = useState(opponent.weapon);
  const player = players.find(candidate => candidate.id === opponent.targetId);
  const targetOptions = [{ value: manualTarget, label: 'Ручной ввод SP' }, ...players.map(target => ({
    value: 'player:' + target.id,
    label: target.name + ' · SP ' + target.armor,
  }))];
  const dv = rangeDifficulty(weapon, opponent.distance);
  const band = rangeLimits.findIndex(limit => opponent.distance <= limit);

  function commit(targetId = player?.id ?? '', selectedWeapon = weapon) {
    const form = formRef.current!;
    const currentPlayer = players.find(candidate => candidate.id === targetId);
    const isValid = Array.from(form.elements).every(field =>
      !(field instanceof HTMLInputElement) || field.validity.valid ||
      (field.name === 'armor' && currentPlayer !== undefined));
    if (!isValid) {
      onChange({ ...opponent, targetId: currentPlayer?.id }, false);
      return;
    }

    const fields = new FormData(form);
    onChange({
      name: String(fields.get('name')),
      weapon: selectedWeapon,
      base: Number(fields.get('base')),
      modifier: Number(fields.get('modifier')),
      distance: Number(fields.get('distance')),
      dice: Number(fields.get('dice')),
      armor: player || currentPlayer ? opponent.armor : Number(fields.get('armor')),
      evasion: fields.get('evasion') === '' ? null : Number(fields.get('evasion')),
      targetId: currentPlayer?.id,
    }, true);
  }

  function changeWeapon(value: string) {
    const selectedWeapon = value as Opponent['weapon'];
    setWeapon(selectedWeapon);
    diceRef.current!.value = String(weapons[selectedWeapon].dice);
    commit(player?.id ?? '', selectedWeapon);
  }

  return (
    <Card className="opponent-card">
      <form ref={formRef} onChange={event => {
        if (event.target instanceof HTMLInputElement) commit();
      }} onSubmit={event => {
        event.preventDefault();
        onRoll();
      }}>
        <div className="row-title">
          <Input className="opponent-name" name="name" aria-label="Имя противника" defaultValue={opponent.name} autoFocus={autoFocus} required />
          <Button variant="secondary" type="button" onClick={() => {
            if (formRef.current!.reportValidity()) onCopy();
          }}>Дубль</Button>
          <Button variant="ghost" type="button" onClick={onRemove}>Удалить</Button>
        </div>
        <div className="fields">
          <div className="select-field">
            <label htmlFor={weaponSelectId}>Оружие</label>
            <Select id={weaponSelectId} value={weapon} options={weaponOptions} onValueChange={changeWeapon} />
          </div>
          <label title="Характеристика + навык">База<Input name="base" type="number" defaultValue={opponent.base} required /></label>
          <label>Модиф.<Input name="modifier" type="number" defaultValue={opponent.modifier} required /></label>
          <label>Кубики d6<Input name="dice" ref={diceRef} type="number" min="1" max="30" defaultValue={opponent.dice} required /></label>
          <label>Уклонение<Input name="evasion" type="number" placeholder="Авто" defaultValue={opponent.evasion ?? ''} /></label>
        </div>
        <div className="target-fields">
          <div className="select-field">
            <label htmlFor={targetSelectId}>Цель</label>
            <Select id={targetSelectId} value={player ? 'player:' + player.id : manualTarget} options={targetOptions}
              onValueChange={value => commit(value === manualTarget ? '' : value.slice('player:'.length))} />
          </div>
          <label>Броня SP{player
            ? <Input key="player" name="armor" type="number" value={player.armor} readOnly />
            : <Input key="manual" name="armor" type="number" min="0" defaultValue={opponent.armor} required />}
          </label>
        </div>
        <div className="range">
          <label>Дистанция, м<Input name="distance" ref={distanceRef} type="number" min="0" step="any" defaultValue={opponent.distance} required /></label>
          <div className="bands" role="group" aria-label="Диапазоны дистанции">
            {rangeLimits.map((limit, index) => (
              <Button variant={index === band ? 'secondary' : 'outline'} key={limit} type="button" aria-pressed={index === band}
                disabled={weapons[weapon].dv[index] === undefined}
                onClick={() => {
                  distanceRef.current!.value = String(limit);
                  commit();
                }}>{index === 0 ? 0 : rangeLimits[index - 1] + 1}–{limit}</Button>
            ))}
          </div>
          <Badge variant="warning" className="threshold">{dv === undefined ? 'Вне дальности' :
            opponent.evasion === null ? 'DV ' + dv : 'Укл. ' + opponent.evasion}</Badge>
        </div>
        <div className="outcome">
          <AttackResult outcome={outcome} />
          <Button variant="secondary" type="submit">Бросить</Button>
        </div>
      </form>
    </Card>
  );
}
