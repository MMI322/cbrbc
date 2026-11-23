import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { rangeDifficulty, rangeLimits, weapons } from './combat';
import type { Opponent, Player } from './roster';

import type { Outcome } from './round';

interface Props {
  id: string;
  opponent: Opponent;
  players: Player[];
  outcome?: Outcome;
  autoFocus?: boolean;
  onChange: (opponent: Opponent) => void;
  onRoll: () => void;
  onCopy: () => void;
  onRemove: () => void;
}

export function OpponentCard({ id, opponent, players, outcome, autoFocus, onChange, onRoll, onCopy, onRemove }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const diceRef = useRef<HTMLInputElement>(null);
  const distanceRef = useRef<HTMLInputElement>(null);
  const player = players.find(candidate => candidate.id === opponent.targetId);
  const dv = rangeDifficulty(opponent.weapon, opponent.distance);
  const band = rangeLimits.findIndex(limit => opponent.distance <= limit);

  function commit(targetId = player?.id ?? '') {
    const form = formRef.current!;
    const currentPlayer = players.find(candidate => candidate.id === targetId);
    if (!form.checkValidity()) {
      onChange({ ...opponent, targetId: currentPlayer?.id });
      return;
    }

    const fields = new FormData(form);
    onChange({
      name: String(fields.get('name')),
      weapon: fields.get('weapon') as Opponent['weapon'],
      base: Number(fields.get('base')),
      modifier: Number(fields.get('modifier')),
      distance: Number(fields.get('distance')),
      dice: Number(fields.get('dice')),
      armor: player ? opponent.armor : Number(fields.get('armor')),
      evasion: fields.get('evasion') === '' ? null : Number(fields.get('evasion')),
      targetId: currentPlayer?.id,
    });
  }

  function changeWeapon(event: ChangeEvent<HTMLSelectElement>) {
    diceRef.current!.value = String(weapons[event.target.value as Opponent['weapon']].dice);
  }

  return (
    <article>
      <form id={id} ref={formRef} onChange={event => {
        if ((event.target as HTMLElement).getAttribute('name') !== 'targetId') commit();
      }} onSubmit={event => {
        event.preventDefault();
        onRoll();
      }}>
        <div className="row-title">
          <input name="name" aria-label="Имя противника" defaultValue={opponent.name} autoFocus={autoFocus} required />
          <button type="button" onClick={() => {
            if (formRef.current!.reportValidity()) onCopy();
          }}>Дубль</button>
          <button type="button" onClick={onRemove}>Удалить</button>
        </div>
        <div className="fields">
          <label>Оружие<select name="weapon" defaultValue={opponent.weapon} onChange={changeWeapon}>
            {Object.entries(weapons).map(([value, preset]) =>
              <option key={value} value={value}>{preset.label}</option>)}
          </select></label>
          <label title="Характеристика + навык">База<input name="base" type="number" defaultValue={opponent.base} required /></label>
          <label>Модиф.<input name="modifier" type="number" defaultValue={opponent.modifier} required /></label>
          <label>Кубики d6<input name="dice" ref={diceRef} type="number" min="1" max="30" defaultValue={opponent.dice} required /></label>
          <label>Уклонение<input name="evasion" type="number" placeholder="Авто" defaultValue={opponent.evasion ?? ''} /></label>
        </div>
        <div className="target-fields">
          <label>Цель<select name="targetId" value={player?.id ?? ''} onChange={event => commit(event.target.value)}>
            <option value="">Ручной ввод SP</option>
            {players.map(target => <option key={target.id} value={target.id}>{target.name} · SP {target.armor}</option>)}
          </select></label>
          <label>Броня SP{player
            ? <input key="player" name="armor" type="number" value={player.armor} readOnly />
            : <input key="manual" name="armor" type="number" min="0" defaultValue={opponent.armor} required />}
          </label>
        </div>
        <div className="range">
          <label>Дистанция, м<input name="distance" ref={distanceRef} type="number" min="0" step="any" defaultValue={opponent.distance} required /></label>
          <div className="bands" role="group" aria-label="Диапазоны дистанции">
            {rangeLimits.map((limit, index) => (
              <button key={limit} type="button" aria-pressed={index === band}
                disabled={weapons[opponent.weapon].dv[index] === undefined}
                onClick={() => {
                  distanceRef.current!.value = String(limit);
                  commit();
                }}>{index === 0 ? 0 : rangeLimits[index - 1] + 1}–{limit}</button>
            ))}
          </div>
          <span className="threshold">{dv === undefined ? 'Вне дальности' :
            opponent.evasion === null ? 'DV ' + dv : 'Укл. ' + opponent.evasion}</span>
        </div>
        <div className="outcome">
          <output aria-live="polite" className={outcome?.style}>{outcome?.text}</output>
          <button type="submit">Бросить</button>
        </div>
      </form>
    </article>
  );
}
