import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CircleDot,
  Clock3,
  Footprints,
  Hand,
  MapPin,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Zap
} from "lucide-react";
import {
  PetWidget,
  getPinnedPetPosition,
  normalizeBoundsPadding,
  taterAtlas,
  taterPet,
  taterSpritesheetUrl,
  usePetController,
  usePetDragGestureAnimations,
  type PetAction,
  type PetDragGestureAnimationMap,
  type PetPin,
  type TaterAnimationName
} from "../../../src/lib";

type LoggedAction = {
  id: number;
  label: string;
};

type ActionButton = {
  label: string;
  icon: LucideIcon;
  action: PetAction<TaterAnimationName>;
};

const actionButtons: ActionButton[] = [
  {
    label: "Idle",
    icon: CircleDot,
    action: { type: "animation.set", animation: "idle" }
  },
  {
    label: "Wave",
    icon: Hand,
    action: {
      type: "animation.play",
      animation: "waving",
      mode: "once",
      then: "idle"
    }
  },
  {
    label: "Jump",
    icon: Zap,
    action: {
      type: "animation.play",
      animation: "jumping",
      mode: "once",
      then: "idle"
    }
  },
  {
    label: "Review",
    icon: Sparkles,
    action: { type: "animation.set", animation: "review" }
  },
  {
    label: "Fail",
    icon: AlertTriangle,
    action: {
      type: "animation.play",
      animation: "failed",
      mode: "once",
      then: "idle"
    }
  },
  {
    label: "Wait",
    icon: Clock3,
    action: { type: "animation.set", animation: "waiting" }
  },
  {
    label: "Run",
    icon: Footprints,
    action: { type: "animation.set", animation: "running" }
  },
  {
    label: "Right",
    icon: ArrowRight,
    action: { type: "animation.set", animation: "running-right" }
  },
  {
    label: "Left",
    icon: ArrowLeft,
    action: { type: "animation.set", animation: "running-left" }
  }
];

const pins: PetPin[] = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right"
];

function formatAction(action: PetAction<TaterAnimationName>) {
  switch (action.type) {
    case "animation.set":
      return `set ${action.animation}`;
    case "animation.play":
      return `play ${action.animation}${action.mode === "once" ? " once" : ""}`;
    case "animation.complete":
      return `completed ${action.animation ?? "animation"}`;
    case "position.set":
      return `position ${Math.round(action.position.x)}, ${Math.round(action.position.y)}`;
    case "pin.set":
      return `pin ${action.pin}`;
    case "pin.clear":
      return "clear pin";
    case "drag.start":
      return "drag start";
    case "drag.move":
      return `drag ${Math.round(action.position.x)}, ${Math.round(action.position.y)}`;
    case "drag.end":
      return `drop ${Math.round(action.position.x)}, ${Math.round(action.position.y)}`;
    case "state.reset":
      return "reset";
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function useViewportSize() {
  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined"
      ? { width: 0, height: 0 }
      : { width: window.innerWidth, height: window.innerHeight }
  );

  useEffect(() => {
    const handleResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewport;
}

function ToggleButton({
  active,
  icon: Icon,
  label,
  title,
  onClick
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={title}
      aria-pressed={active}
      className="toggleButton"
      onClick={onClick}
      title={title}
      type="button"
    >
      <Icon size={18} />
      <span>{label}</span>
      <span className="toggleTrack" aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

export function App() {
  const [autoWaiting, setAutoWaiting] = useState(true);
  const [dragEnabled, setDragEnabled] = useState(true);
  const [gestureEnabled, setGestureEnabled] = useState(true);
  const [pauseFrames, setPauseFrames] = useState(false);
  const [simulationOn, setSimulationOn] = useState(false);
  const [scale, setScale] = useState(0.72);
  const [eventLog, setEventLog] = useState<LoggedAction[]>([]);
  const [simulationLabel, setSimulationLabel] = useState("off");
  const compact = useMediaQuery("(max-width: 760px)");
  const viewport = useViewportSize();

  const { pet, petDispatch } = usePetController<TaterAnimationName>({
    initialState: {
      animation: { name: "idle", mode: "loop" },
      pin: "bottom-right",
      position: { x: 320, y: 320 }
    },
    defaultAnimation: "idle",
    waitingAnimation: "waiting",
    waitingAfterMs: autoWaiting ? 5500 : undefined
  });

  const boundsPadding = useMemo(
    () =>
      compact
        ? { top: 18, right: 18, bottom: 218, left: 18 }
        : { top: 24, right: 24, bottom: 24, left: 344 },
    [compact]
  );
  const petSize = useMemo(
    () => ({
      width: taterAtlas.cellWidth * scale,
      height: taterAtlas.cellHeight * scale
    }),
    [scale]
  );
  const visualPosition = useMemo(() => {
    if (!pet.pin) {
      return pet.position;
    }

    return getPinnedPetPosition(
      pet.pin,
      petSize,
      viewport,
      normalizeBoundsPadding(boundsPadding)
    );
  }, [boundsPadding, pet.pin, pet.position, petSize, viewport]);

  const commitAction = useCallback(
    (action: PetAction<TaterAnimationName>) => {
      petDispatch(action);

      if (action.type === "drag.move") {
        return;
      }

      setEventLog((items) => [
        { id: Date.now() + Math.random(), label: formatAction(action) },
        ...items
      ].slice(0, 8));
    },
    [petDispatch]
  );

  const dragGestureAnimations = useMemo(
    () =>
      ({
        left: "running-left",
        right: "running-right",
        up: "jumping",
        down: "waving"
      }) satisfies PetDragGestureAnimationMap<TaterAnimationName>,
    []
  );

  const observeDragGesture = usePetDragGestureAnimations<TaterAnimationName>({
    enabled: gestureEnabled && dragEnabled && !pauseFrames,
    animations: dragGestureAnimations,
    restAnimation: "idle",
    restDelayMs: 140,
    minimumDistance: 16,
    axisBias: 1.12,
    onGestureAction: commitAction
  });

  const dispatchAction = useCallback(
    (action: PetAction<TaterAnimationName>) => {
      commitAction(action);
      observeDragGesture(action);
    },
    [commitAction, observeDragGesture]
  );

  const simulationSteps = useMemo(
    () =>
      [
        {
          label: "review",
          action: { type: "animation.set", animation: "review" }
        },
        {
          label: "wave",
          action: {
            type: "animation.play",
            animation: "waving",
            mode: "once",
            then: "idle"
          }
        },
        {
          label: "jump",
          action: {
            type: "animation.play",
            animation: "jumping",
            mode: "once",
            then: "idle"
          }
        },
        {
          label: "run right",
          action: { type: "animation.set", animation: "running-right" }
        },
        {
          label: "failure",
          action: {
            type: "animation.play",
            animation: "failed",
            mode: "once",
            then: "idle"
          }
        }
      ] satisfies Array<{
        label: string;
        action: PetAction<TaterAnimationName>;
      }>,
    []
  );

  useEffect(() => {
    if (!simulationOn) {
      setSimulationLabel("off");
      return;
    }

    let index = 0;

    const runStep = () => {
      const step = simulationSteps[index % simulationSteps.length];
      setSimulationLabel(step.label);
      dispatchAction(step.action);
      index += 1;
    };

    runStep();
    const interval = window.setInterval(runStep, 2400);
    return () => window.clearInterval(interval);
  }, [dispatchAction, simulationOn, simulationSteps]);

  const nudge = (dx: number, dy: number) => {
    dispatchAction({
      type: "position.set",
      position: { x: visualPosition.x + dx, y: visualPosition.y + dy }
    });
  };

  const reset = () => {
    setSimulationOn(false);
    dispatchAction({
      type: "state.reset",
      state: {
        animation: { name: "idle", mode: "loop" },
        pin: "bottom-right",
        position: { x: 320, y: 320 }
      }
    });
  };

  const toggleAutoWaiting = () => {
    const next = !autoWaiting;
    setAutoWaiting(next);

    if (!next && pet.animation.name === "waiting") {
      dispatchAction({ type: "animation.set", animation: "idle" });
    }
  };

  const statePreview = {
    animation: pet.animation,
    pin: pet.pin,
    position: {
      x: Math.round(pet.position.x),
      y: Math.round(pet.position.y)
    },
    draggable: dragEnabled,
    gestures: gestureEnabled,
    simulation: simulationLabel
  };

  return (
    <main className="appShell">
      <section className="controlPanel" aria-label="Pet controls">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">{taterPet.displayName}</p>
            <h1>Plannotator Pet</h1>
            <a
              className="sponsorBadge"
              href="https://github.com/backnotprop/plannotator"
              rel="noreferrer"
              target="_blank"
            >
              <span>Brought to you by</span>
              <strong>Plannotator</strong>
            </a>
          </div>
          <button
            className="iconButton"
            onClick={reset}
            title="Reset"
            type="button"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="controlGroup">
          <h2>Actions</h2>
          <div className="actionGrid">
            {actionButtons.map(({ action, icon: Icon, label }) => (
              <button
                className="actionButton"
                key={label}
                onClick={() => dispatchAction(action)}
                type="button"
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="controlGroup">
          <h2>Switches</h2>
          <div className="toggleGrid">
            <ToggleButton
              active={simulationOn}
              icon={simulationOn ? Pause : Play}
              label="Sim"
              title="Run a looping simulation of pet actions"
              onClick={() => setSimulationOn((value) => !value)}
            />
            <ToggleButton
              active={dragEnabled}
              icon={Activity}
              label="Drag"
              title="Allow dragging the pet around the screen"
              onClick={() => setDragEnabled((value) => !value)}
            />
            <ToggleButton
              active={gestureEnabled}
              icon={MousePointer2}
              label="Gest"
              title="Change animations based on drag direction"
              onClick={() => setGestureEnabled((value) => !value)}
            />
            <ToggleButton
              active={autoWaiting}
              icon={Clock3}
              label="Wait"
              title="Switch to waiting after the pet is idle"
              onClick={toggleAutoWaiting}
            />
            <ToggleButton
              active={pauseFrames}
              icon={Pause}
              label="Pause"
              title="Pause sprite frame playback"
              onClick={() => setPauseFrames((value) => !value)}
            />
          </div>
        </div>

        <div className="controlGroup pinGroup">
          <h2>Pin</h2>
          <div className="pinGrid" aria-label="Pin pet">
            {pins.map((pin) => (
              <button
                aria-label={`Pin ${pin}`}
                aria-pressed={pet.pin === pin}
                className="pinButton"
                key={pin}
                onClick={() => dispatchAction({ type: "pin.set", pin })}
                title={pin}
                type="button"
              >
                {pet.pin === pin ? <MapPin size={16} /> : <span />}
              </button>
            ))}
          </div>
          <div className="nudgePad" aria-label="Nudge pet">
            <button type="button" onClick={() => nudge(0, -28)}>
              <ArrowUp size={16} />
            </button>
            <button type="button" onClick={() => nudge(-28, 0)}>
              <ArrowLeft size={16} />
            </button>
            <button type="button" onClick={() => nudge(28, 0)}>
              <ArrowRight size={16} />
            </button>
            <button type="button" onClick={() => nudge(0, 28)}>
              <ArrowDown size={16} />
            </button>
          </div>
        </div>

        <div className="controlGroup">
          <h2>Scale</h2>
          <label className="rangeRow">
            <input
              min="0.45"
              max="1"
              step="0.01"
              type="range"
              value={scale}
              onChange={(event) => setScale(Number(event.currentTarget.value))}
            />
            <span>{Math.round(scale * 100)}%</span>
          </label>
        </div>

        <div className="controlGroup statusGroup">
          <h2>State</h2>
          <pre>{JSON.stringify(statePreview, null, 2)}</pre>
        </div>

        <div className="controlGroup logGroup">
          <h2>Events</h2>
          <ol>
            {eventLog.map((event) => (
              <li key={event.id}>{event.label}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="stage" aria-label="Pet stage">
        <div className="stageTopbar">
          <span>{pet.animation.name}</span>
          <span>{pet.pin ?? "free"}</span>
          <span>{simulationOn ? `sim ${simulationLabel}` : "manual"}</span>
        </div>
      </section>

      <PetWidget
        animation={pet.animation}
        atlas={taterAtlas}
        boundsPadding={boundsPadding}
        draggable={dragEnabled}
        paused={pauseFrames}
        pin={pet.pin}
        position={pet.position}
        scale={scale}
        src={taterSpritesheetUrl}
        onAction={dispatchAction}
      />
    </main>
  );
}
