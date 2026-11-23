import { useRef, useState } from 'react';
import { useUnit } from 'effector-react';
import { $battle, $storageWarning, opponentAdded, opponentChanged, opponentCopied, opponentRemoved,
  playerAdded, playerChanged, playerRemoved, roundRequested } from './battleModel';
import { OpponentCard } from './OpponentCard';
import type { Player } from './roster';

function PlayerCard({ player, autoFocus, onChange, onRemove }: {
  player: Player;
  autoFocus: boolean;
  onChange: (player: Player) => void;
  onRemove: () => void;
}) {
  const [invalidArmor, setInvalidArmor] = useState<{ value: string; previous: number }>();
  return (
    <article className="player-row">
      <label>Имя<input required defaultValue={player.name} autoFocus={autoFocus} onChange={event => {
        if (event.target.validity.valid) onChange({ ...player, name: event.target.value });
      }} /></label>
      <label>SP<input type="number" min="0" required
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
      <button type="button" aria-label={'Удалить игрока ' + player.name} onClick={onRemove}>Удалить</button>
    </article>
  );
}

function newOpponentId() {
  return 'opponent-' + crypto.randomUUID();
}

export function App() {
  const { battle: { rows, players }, warning, addOpponent, changeOpponent, copyOpponent, removeOpponent,
    addPlayerToBattle, changePlayer, removePlayerFromBattle, requestRound } = useUnit({
    battle: $battle,
    warning: $storageWarning,
    addOpponent: opponentAdded,
    changeOpponent: opponentChanged,
    copyOpponent: opponentCopied,
    removeOpponent: opponentRemoved,
    addPlayerToBattle: playerAdded,
    changePlayer: playerChanged,
    removePlayerFromBattle: playerRemoved,
    requestRound: roundRequested,
  });
  const [newPlayerId, setNewPlayerId] = useState('');
  const rosterElement = useRef<HTMLElement>(null);
  const addOpponentButton = useRef<HTMLButtonElement>(null);
  const addPlayerButton = useRef<HTMLButtonElement>(null);

  function roll(rowId?: string) {
    const validRows = new Map<string, boolean>();
    for (const form of rosterElement.current!.querySelectorAll('form')) {
      if (rowId === undefined || form.id === rowId) validRows.set(form.id, form.checkValidity());
    }
    requestRound(validRows);
  }

  function addPlayer() {
    const id = crypto.randomUUID();
    setNewPlayerId(id);
    addPlayerToBattle(id);
  }

  function removePlayer(id: string) {
    removePlayerFromBattle(id);
    addPlayerButton.current!.focus();
  }

  return (
    <main>
      <header>
        <p className="edition">CYBERPUNK RED</p>
        <h1>Боевой расчёт</h1>
        <p className="intro">Одиночные выстрелы · попадание, урон и броня</p>
      </header>
      <section className="players" aria-labelledby="players-heading">
        <div className="players-heading">
          <h2 id="players-heading">Игроки</h2>
          <button ref={addPlayerButton} type="button" onClick={addPlayer}>+ Игрок</button>
        </div>
        <div id="players">
          {players.map(player => <PlayerCard key={player.id} player={player} autoFocus={player.id === newPlayerId}
            onChange={changePlayer}
            onRemove={() => removePlayer(player.id)} />)}
        </div>
      </section>
      <div className="toolbar">
        <button ref={addOpponentButton} type="button"
          onClick={() => addOpponent(newOpponentId())}>+ Противник</button>
        <span id="count">Всего: {rows.length}</span>
        <button className="primary" type="button" disabled={rows.length === 0} onClick={() => roll()}>Бросить за всех</button>
      </div>
      {warning && <p className="warning" role="status">Хранилище недоступно. Изменения могут потеряться при закрытии окна.</p>}
      <section ref={rosterElement} aria-label="Противники">
        {rows.map(row => (
          <OpponentCard key={row.id} id={row.id} opponent={row.opponent} players={players}
            outcome={row.outcome} autoFocus={row.autoFocus}
            onChange={opponent => changeOpponent({ id: row.id, opponent })}
            onRoll={() => roll(row.id)}
            onCopy={() => copyOpponent({ sourceId: row.id, id: newOpponentId() })}
            onRemove={() => {
              removeOpponent(row.id);
              addOpponentButton.current!.focus();
            }} />
        ))}
      </section>
      <footer>Tab — переход между полями. Enter в поле — бросок за противника.</footer>
    </main>
  );
}
