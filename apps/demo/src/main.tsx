import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { CODEX_PET_STATES, type CodexPetManifest, type CodexPetState } from "codex-pets-core";
import { CodexPet, type CodexPetHandle } from "codex-pets-react";
import "./styles.css";

type DemoPet = CodexPetManifest & {
  manifestUrl: string;
  spritesheetUrl: string;
};

const stateNames = Object.keys(CODEX_PET_STATES) as CodexPetState[];

function App() {
  const petRef = useRef<CodexPetHandle>(null);
  const [pets, setPets] = useState<DemoPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [state, setState] = useState<CodexPetState>("idle");
  const [scale, setScale] = useState(2);
  const [fps, setFps] = useState(8);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/pets/pets-index.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Run `npm run copy:pets` before starting the demo.");
        }
        return response.json() as Promise<{ pets: DemoPet[] }>;
      })
      .then((data) => {
        setPets(data.pets);
        setSelectedPetId(data.pets[0]?.id ?? "");
        setError(null);
      })
      .catch((caughtError: unknown) => {
        setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
      });
  }, []);

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? pets[0],
    [pets, selectedPetId]
  );

  const recordEvent = (message: string) => {
    setEventLog((current) => [message, ...current].slice(0, 8));
  };

  return (
    <main className="app-shell">
      <section className="stage" aria-label="Codex pet preview">
        {selectedPet ? (
          <button
            className="pet-button"
            type="button"
            onClick={() => petRef.current?.play("waving", { loops: 1 })}
            aria-label={`Ask ${selectedPet.displayName} to wave`}
          >
            <CodexPet
              ref={petRef}
              aria-label={selectedPet.displayName}
              fps={fps}
              manifest={selectedPet}
              paused={paused}
              reducedMotion={reducedMotion}
              scale={scale}
              spritesheetUrl={selectedPet.spritesheetUrl}
              state={state}
              onAnimationEnd={({ state: endedState }) =>
                recordEvent(`ended ${endedState}`)
              }
              onAnimationLoop={({ state: loopState, loop }) =>
                recordEvent(`loop ${loopState} #${loop}`)
              }
              onError={({ error: petError }) => setError(petError.message)}
              onReady={() => recordEvent(`loaded ${selectedPet.displayName}`)}
              onStateChange={({ state: nextState }) =>
                recordEvent(`state ${nextState}`)
              }
            />
          </button>
        ) : (
          <div className="empty-state">
            <strong>No pets copied yet.</strong>
            <span>Run npm run copy:pets, then restart the demo.</span>
          </div>
        )}
      </section>

      <aside className="controls" aria-label="Pet controls">
        <div>
          <h1>Codex Pets</h1>
          <p>Preview local Codex pet packages through codex-pets-react.</p>
        </div>

        {error ? <div className="notice">{error}</div> : null}

        <label>
          Pet
          <select
            value={selectedPetId}
            onChange={(event) => setSelectedPetId(event.target.value)}
          >
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.displayName}
              </option>
            ))}
          </select>
        </label>

        <label>
          State
          <select
            value={state}
            onChange={(event) => setState(event.target.value as CodexPetState)}
          >
            {stateNames.map((stateName) => (
              <option key={stateName} value={stateName}>
                {stateName}
              </option>
            ))}
          </select>
        </label>

        <label>
          Scale
          <input
            max="4"
            min="0.5"
            step="0.25"
            type="range"
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
          />
        </label>

        <label>
          FPS
          <input
            max="24"
            min="1"
            step="1"
            type="range"
            value={fps}
            onChange={(event) => setFps(Number(event.target.value))}
          />
        </label>

        <div className="toggles">
          <label>
            <input
              checked={paused}
              type="checkbox"
              onChange={(event) => setPaused(event.target.checked)}
            />
            Paused
          </label>
          <label>
            <input
              checked={reducedMotion}
              type="checkbox"
              onChange={(event) => setReducedMotion(event.target.checked)}
            />
            Reduced motion
          </label>
        </div>

        <div className="actions" aria-label="Temporary actions">
          {(["waving", "jumping", "failed", "review", "running"] as const).map(
            (action) => (
              <button
                key={action}
                type="button"
                onClick={() => petRef.current?.play(action, { loops: 1 })}
              >
                {action}
              </button>
            )
          )}
        </div>

        <div className="meta">
          <h2>Manifest</h2>
          <pre>{selectedPet ? JSON.stringify(selectedPet, null, 2) : "{}"}</pre>
        </div>

        <div className="meta">
          <h2>Events</h2>
          <ul>
            {eventLog.map((event, index) => (
              <li key={`${event}-${index}`}>{event}</li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
