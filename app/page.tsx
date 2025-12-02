"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sun, Moon } from "lucide-react";
import { storyData } from "./story"; // keep story.ts in same folder

type Player = {
  name: string;
  role: "Hero" | "Villain";
  life: number;
  energy: number;
  money: number;
  energySuppliers: number;
  businesses: number;
  act: number; // 1..4
  step: number; // 0-based index into act steps
};

type StoryChoiceLocal = {
  text: string;
  cost: number;
  outcomeText: string;
  effects: { life?: number; energy?: number; money?: number };
  afterNarration?: string;
};

type StoryStepLocal = {
  narration: string;
  choices: StoryChoiceLocal[];
};

const STORAGE_KEY = "life-sim-choice";

const defaultPlayer: Player = {
  name: "You",
  role: "Hero",
  life: 100,
  energy: 0, // start at 0 energy now
  money: 0,
  energySuppliers: 0,
  businesses: 0,
  act: 1,
  step: 0,
};

export default function LifeSim() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [started, setStarted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [playerNameInput, setPlayerNameInput] = useState("");
  const [maxEnergy, setMaxEnergy] = useState(100);
  const [maxMoney, setMaxMoney] = useState(100);
  const [history, setHistory] = useState<Player[]>([]);
  const [outcomeText, setOutcomeText] = useState<string | null>(null);
  const [afterText, setAfterText] = useState<string | null>(null);
  const [stage, setStage] = useState<
    "narration" | "outcome" | "after" | "ended"
  >("narration");
  const [selectedChoice, setSelectedChoice] = useState<
    StoryChoiceLocal | null
  >(null);
  const [gameEnded, setGameEnded] = useState(false);

  // theme toggle
  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  // load saved player
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPlayer(JSON.parse(raw) as Player);
      else setPlayer(defaultPlayer);
    } catch {
      setPlayer(defaultPlayer);
    }
  }, []);

  // save
  useEffect(() => {
    if (player) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
    }
  }, [player]);

  // auto generators
  useEffect(() => {
    const interval = setInterval(() => {
      if (player) {
        setPlayer((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            energy: prev.energy + prev.energySuppliers,
            money: prev.money + prev.businesses,
          };
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [player]);

  // track dynamic scaling
  useEffect(() => {
    if (player) {
      if (player.energy > maxEnergy) setMaxEnergy(player.energy);
      if (player.money > maxMoney) setMaxMoney(player.money);
    }
  }, [player, maxEnergy, maxMoney]);

  if (!player) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  // helpers
  const commit = (newState: Player) => {
    setHistory((prev) => [...prev.slice(-9), player]); // keep last 10
    setPlayer(newState);
  };

  const undo = () => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setPlayer(last);
      // reset any staged texts
      setOutcomeText(null);
      setAfterText(null);
      setStage("narration");
      setSelectedChoice(null);
      setGameEnded(false);
    }
  };

  // small clamped helper
  const clampLife = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  // actions
  const generateEnergy = () => commit({ ...player, energy: player.energy + 1 });
  const work = () => commit({ ...player, money: player.money + 1 });

  const buyEnergySupplier = () => {
    const cost = Math.min(100, 10 + player.energySuppliers * 10);
    if (player.energy >= cost) {
      commit({
        ...player,
        energy: player.energy - cost,
        energySuppliers: player.energySuppliers + 1,
      });
    }
  };

  const buyBusiness = () => {
    const cost = Math.min(100, 10 + player.businesses * 10);
    if (player.money >= cost) {
      commit({
        ...player,
        money: player.money - cost,
        businesses: player.businesses + 1,
      });
    }
  };

  const buyPotion = (type: "small" | "large") => {
    if (!player) return;
    if (type === "small") {
      if (player.energy >= 200 && player.money >= 500) {
        commit({
          ...player,
          energy: player.energy - 200,
          money: player.money - 500,
          life: clampLife(player.life + 25),
        });
      }
    } else {
      if (player.energy >= 600 && player.money >= 1600) {
        commit({
          ...player,
          energy: player.energy - 600,
          money: player.money - 1600,
          life: 100,
        });
      }
    }
  };

  const resetGame = () => {
    setPlayer(defaultPlayer);
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setStarted(false);
    setPlayerNameInput("");
    setMaxEnergy(100);
    setMaxMoney(100);
    setOutcomeText(null);
    setAfterText(null);
    setStage("narration");
    setSelectedChoice(null);
    setGameEnded(false);
  };

  // get current story step safely
  const getCurrentStep = (): StoryStepLocal | null => {
    const role = player.role;
    const acts = (storyData as any)[role];
    const actKey = `act${player.act}` as keyof typeof acts;
    const steps: StoryStepLocal[] = acts?.[actKey];
    if (!steps) return null;
    return steps[player.step] ?? null;
  };

  // selecting a choice: apply costs/effects and show outcome (do NOT advance story yet)
  const onChoose = (choice: StoryChoiceLocal) => {
    if (!player) return;
    if (player.energy < choice.cost) return; // safety
    // build new player applying cost & effects (but keep act/step unchanged for now)
    const newPlayer: Player = {
      ...player,
      energy:
        Math.max(0, Math.round(player.energy - choice.cost + (choice.effects.energy || 0))),
      life: clampLife(player.life + (choice.effects.life || 0)),
      money: Math.round(player.money + (choice.effects.money || 0)),
    };
    // commit immediate stat change (so shop/buttons reflect)
    commit(newPlayer);
    // stage outcome
    setSelectedChoice(choice);
    setOutcomeText(choice.outcomeText);
    setAfterText(choice.afterNarration ?? null);
    setStage("outcome");
    // If life went to zero on the effect, let normal life<=0 Game Over screen handle it
  };

  // continue from outcome => either show afterNarration or advance story
  const continueFromOutcome = () => {
    if (afterText) {
      setStage("after");
    } else {
      advanceStory();
    }
  };

  // continue after afterNarration => advance story
  const continueFromAfter = () => {
    advanceStory();
  };

  // advance story index / act; if finished act 4 -> ending screen
  const advanceStory = () => {
    if (!player) return;
    const role = player.role;
    const acts = (storyData as any)[role];
    const actKey = `act${player.act}` as keyof typeof acts;
    const steps: StoryStepLocal[] = acts?.[actKey] ?? [];
    const nextStep = player.step + 1;

    if (nextStep < steps.length) {
      // advance to next step in same act
      const newPlayer = { ...player, step: nextStep };
      commit(newPlayer);
      setStage("narration");
      setOutcomeText(null);
      setAfterText(null);
      setSelectedChoice(null);
    } else if (player.act < 4) {
      // advance to next act
      const newPlayer = { ...player, act: player.act + 1, step: 0 };
      commit(newPlayer);
      setStage("narration");
      setOutcomeText(null);
      setAfterText(null);
      setSelectedChoice(null);
    } else {
      // finished last act -> ending
      setStage("ended");
      setGameEnded(true);
    }
  };

  // Ending epilogue text generator (simple heuristics)
  const buildEpilogue = (p: Player) => {
    if (p.role === "Hero") {
      if (p.life >= 75) {
        return `You survive the trials with your body scarred but your spirit whole. The people sing your name and your rule brings a fragile golden age.`;
      } else if (p.life >= 35) {
        return `You live on, weary and changed. The kingdom remembers both your mercy and your compromises — a ruler who bore the cost of peace.`;
      } else {
        return `Wounded and weary, you fade into legend. Songs remember the sacrifice, and battles echo long after your breath.`;
      }
    } else {
      // Villain
      if (p.money >= 100) {
        return `Wealth and whispers built your power. You rule from shadows or throne—history calls you cunning and ruthless.`;
      } else if (p.life >= 50) {
        return `You survive the chaos, unbowed. Tyranny or influence follows — the land remembers both fear and order.`;
      } else {
        return `Your hatred consumed you as much as your enemies. The world remembers your cruelty and the tragedies it wrought.`;
      }
    }
  };

  // --- UI pieces ---
  const ThemeToggle = () => (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-4 right-4"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </Button>
  );

  // Opening screen
  if (!started) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 relative">
        <ThemeToggle />
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">CSE Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              className="w-full p-2 border rounded"
              placeholder="Enter your name"
              value={playerNameInput}
              onChange={(e) => setPlayerNameInput(e.target.value)}
            />
            <div className="flex flex-col gap-3 mt-4">
              <Button
                onClick={() => {
                  const newPlayer = { ...defaultPlayer, name: playerNameInput || "You", role: "Hero" };
                  setPlayer(newPlayer);
                  setStarted(true);
                }}
              >
                Play as Hero
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const newPlayer = { ...defaultPlayer, name: playerNameInput || "You", role: "Villain" };
                  setPlayer(newPlayer);
                  setStarted(true);
                }}
              >
                Play as Villain
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game Over (life <= 0)
  if (player.life <= 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-200 dark:bg-gray-800">
        <ThemeToggle />
        <h1 className="text-4xl font-bold mb-6">💀 Game Over</h1>
        <p className="mb-6">{player.name} the {player.role} has run out of life.</p>
        <div className="flex gap-4">
          <Button onClick={resetGame}>Restart Game</Button>
          <Button variant="secondary" onClick={() => setStarted(false)}>Back to Title</Button>
          <Button variant="outline" onClick={undo} disabled={history.length === 0}>Undo Last Action</Button>
        </div>
      </div>
    );
  }

  // Ending screen (completed Acts)
if (gameEnded && player) {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <ThemeToggle />
      <Card className="w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-purple-800 dark:to-gray-700 text-white text-center py-8">
          <CardTitle className="text-4xl font-extrabold tracking-wide">
            🏁 The End
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <p className="text-lg italic text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-inner">
            {buildEpilogue(player)}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <strong className="block text-sm text-gray-500">Name</strong>
              <span className="text-xl font-semibold">{player.name}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <strong className="block text-sm text-gray-500">Role</strong>
              <span className="text-xl font-semibold">{player.role}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <strong className="block text-sm text-gray-500">Life</strong>
              <span className="text-xl font-semibold">{player.life}%</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <strong className="block text-sm text-gray-500">Energy</strong>
              <span className="text-xl font-semibold">{player.energy}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <strong className="block text-sm text-gray-500">Money</strong>
              <span className="text-xl font-semibold">${player.money}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
              <strong className="block text-sm text-gray-500">Suppliers / Biz</strong>
              <span className="text-xl font-semibold">{player.energySuppliers} / {player.businesses}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button onClick={resetGame} className="px-6 py-3 text-lg">🔄 Restart Game</Button>
            <Button variant="secondary" onClick={() => setStarted(false)} className="px-6 py-3 text-lg">⬅ Back to Title</Button>
            <Button variant="outline" onClick={undo} disabled={history.length === 0} className="px-6 py-3 text-lg">↩ Undo Last Action</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


  // normal in-game UI
  const currentStep = getCurrentStep();

  return (
    <TooltipProvider>
      <main className="flex flex-col items-center p-6 space-y-6 relative bg-white dark:bg-gray-950 min-h-screen">
        <ThemeToggle />

        {/* Stats */}
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle>{player.name} the {player.role}’s Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p>Life: {player.life}%</p>
              <Progress value={player.life} />
            </div>
            <div>
              <p>Energy: {player.energy}</p>
              <Progress value={(player.energy / maxEnergy) * 100} />
            </div>
            <div>
              <p>Money: ${player.money}</p>
              <Progress value={(player.money / maxMoney) * 100} />
            </div>
            <div className="text-sm text-muted-foreground">
              <span>Suppliers: {player.energySuppliers}</span>
              <span className="mx-3">|</span>
              <span>Businesses: {player.businesses}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions (generate / work / undo) */}
        <div className="flex gap-4 flex-wrap justify-center">
          <Button onClick={generateEnergy}>⚡ Generate Energy (+1)</Button>
          <Button onClick={work}>💼 Work (+$1)</Button>
          <Button variant="secondary" onClick={undo} disabled={history.length === 0}>↩ Undo Last Action</Button>
        </div>

        {/* Shop */}
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle>🛒 Shop</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={buyEnergySupplier}
                  disabled={player.energy < Math.min(100, 10 + player.energySuppliers * 10)}>
                  Buy Energy Supplier (Cost: {Math.min(100, 10 + player.energySuppliers * 10)} Energy)
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generates +1 Energy per second</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={buyBusiness}
                  disabled={player.money < Math.min(100, 10 + player.businesses * 10)}>
                  Buy Business (Cost: {Math.min(100, 10 + player.businesses * 10)} Money)
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generates +1 Money per second</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => buyPotion("small")} disabled={player.energy < 200 || player.money < 500}>
                  Buy Small Potion (200 Energy, 500 Money)
                </Button>
              </TooltipTrigger>
              <TooltipContent>Restores 25% life instantly</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => buyPotion("large")} disabled={player.energy < 600 || player.money < 1600}>
                  Buy Large Potion (600 Energy, 1600 Money)
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fully restores life to 100%</TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>

        {/* Story section */}
        {currentStep ? (
          <Card className="w-full max-w-2xl">
            <CardHeader><CardTitle>📖 Story</CardTitle></CardHeader>
            <CardContent>
              {/* before-choice narration */}
              {stage === "narration" && (
                <>
                  <p className="mb-4 whitespace-pre-line">{currentStep.narration}</p>
                  <div className="flex flex-col gap-3">
                    {currentStep.choices.map((choice, idx) => {
                      // build tooltip content dynamically
                      const effects = [];
                      if (choice.effects.life) effects.push(`${choice.effects.life > 0 ? "+" : ""}${choice.effects.life} Life`);
                      if (choice.effects.energy) effects.push(`${choice.effects.energy > 0 ? "+" : ""}${choice.effects.energy} Energy`);
                      if (choice.effects.money) effects.push(`${choice.effects.money > 0 ? "+" : ""}${choice.effects.money} Money`);
                      const tooltipText = `Costs ${choice.cost} Energy${effects.length ? " · Effects: " + effects.join(", ") : ""}${(choice as any).afterNarration ? " · Has follow-up scene." : ""}`;

                      return (
                        <Tooltip key={idx}>
                          <TooltipTrigger asChild>
                            <span className="w-full block">
                              <Button
                                className="w-full text-left"
                                onClick={() => onChoose(choice)}
                                disabled={player.energy < choice.cost}
                              >
                                {choice.text}
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{tooltipText}</TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </>
              )}

              {/* outcome text */}
              {stage === "outcome" && outcomeText && (
                <>
                  <p className="mb-3 italic">{outcomeText}</p>
                  <div className="flex gap-3">
                    <Button onClick={continueFromOutcome}>Continue</Button>
                    <Button variant="secondary" onClick={() => { setOutcomeText(null); setAfterText(null); setStage("narration"); setSelectedChoice(null); }}>Cancel</Button>
                  </div>
                </>
              )}

              {/* after narration */}
              {stage === "after" && afterText && (
                <>
                  <p className="mb-3">{afterText}</p>
                  <div className="flex gap-3">
                    <Button onClick={continueFromAfter}>Continue</Button>
                  </div>
                </>
              )}

              {/* safety fallback */}
              {stage === "narration" && !currentStep.choices.length && <p>No choices available.</p>}
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-2xl">
            <CardHeader><CardTitle>📖 Story</CardTitle></CardHeader>
            <CardContent>
              <p>Nothing to show right now.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 mt-6">
          <Button variant="secondary" onClick={() => setStarted(false)}>⬅ Back to Title</Button>
          <Button variant="destructive" onClick={resetGame}>🔄 Reset Game</Button>
          <Button variant="outline" onClick={undo} disabled={history.length === 0}>↩ Undo Last Action</Button>
        </div>
      </main>
    </TooltipProvider>
  );
}
