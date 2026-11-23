import { OpponentsSection } from '../actions/ui/OpponentsSection';
import { PlayersSection } from '../actions/ui/PlayersSection';

export function App() {
  return (
    <main className="popup">
      <header className="popup-header">
        <img src="./icons/red-128.png" width={48} height={48} alt="" />
        <div>
          <p className="edition">CYBERPUNK RED</p>
          <h1>Боевой расчёт</h1>
          <p className="intro">Одиночные выстрелы · попадание, урон и броня</p>
        </div>
      </header>
      <PlayersSection />
      <OpponentsSection />
      <footer>Tab — переход между полями. Enter в поле — бросок за противника.</footer>
    </main>
  );
}
