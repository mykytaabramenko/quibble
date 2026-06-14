const REPO_URL = 'https://github.com/mykytaabramenko/quibble';
const GEMINI_URL = 'https://gemini.google.com';

const STEPS = [
  'Open Gemini and ask anything.',
  'Select text in an answer — a Comment button appears.',
  'Add a note; repeat for as many fragments as you like.',
  'Hit “Insert into prompt” to drop the quotes + comments into the prompt.',
];

/** Onboarding popup shown from the toolbar button. */
export function App() {
  return (
    <div className="popup">
      <header className="popup__header">
        <img src="/icon/48.png" alt="" className="popup__logo" width={36} height={36} />
        <div>
          <h1 className="popup__title">Quibble</h1>
          <p className="popup__subtitle">Review AI answers like a pull request</p>
        </div>
      </header>

      <ol className="popup__steps">
        {STEPS.map((step, i) => (
          <li key={i} className="popup__step">
            <span className="popup__num">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="popup__actions">
        <a className="popup__btn popup__btn--primary" href={GEMINI_URL} target="_blank" rel="noreferrer">
          Open Gemini
        </a>
        <a className="popup__btn popup__btn--ghost" href={REPO_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </div>
  );
}
