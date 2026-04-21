const machine = new SlotMachine(GAME_CONFIG);
const ui = new SlotMachineUI();
const THEME_STORAGE_KEY = "slot-machine-theme";
let spinInteractionLocked = false;

function updateSpinAvailability() {
  const { balance, fixedBet, isSpinning } = machine.getState();

  ui.setSpinButtonState({
    canSpin: machine.canSpin() && !spinInteractionLocked,
    isSpinning,
    noBalance: balance < fixedBet,
  });
}

function initialize() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
  const initialTheme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : preferredTheme;

  ui.setTheme(initialTheme);
  ui.renderReels(GAME_CONFIG.symbols.slice(0, GAME_CONFIG.reelCount));
  const state = machine.getState();
  ui.renderBalance(state.balance);
  ui.renderBet(state.fixedBet);
  updateSpinAvailability();
}

function handleThemeToggle() {
  const nextTheme = ui.getTheme() === "dark" ? "light" : "dark";
  ui.setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function startReelAnimation() {
  return setInterval(() => {
    const rollingReels = Array.from(
      { length: GAME_CONFIG.reelCount },
      () => GAME_CONFIG.symbols[Math.floor(Math.random() * GAME_CONFIG.symbols.length)]
    );

    ui.renderReels(rollingReels);
  }, GAME_CONFIG.animationTickMs);
}

async function revealFinalReels(outcomeReels) {
  const reelStopDelayMs = 170;

  for (let reelIndex = 0; reelIndex < outcomeReels.length; reelIndex += 1) {
    await new Promise((resolve) => setTimeout(resolve, reelStopDelayMs));
    ui.stopSingleReel(reelIndex);
    ui.renderSingleReel(reelIndex, outcomeReels[reelIndex]);
  }
}

async function handleSpin() {
  if (spinInteractionLocked) {
    return;
  }

  spinInteractionLocked = true;
  updateSpinAvailability();
  let animation = null;

  try {
    if (!machine.canSpin()) {
      const { balance, fixedBet, isSpinning } = machine.getState();

      if (isSpinning) {
        ui.showResult("Spin already in progress.", "loss");
        return;
      }

      if (balance < fixedBet) {
        ui.showResult("Not enough balance to spin.", "loss");
        return;
      }
    }

    ui.startSpinning();
    updateSpinAvailability();

    animation = startReelAnimation();
    const spinPromise = machine.spin(GAME_CONFIG.spinDurationMs);

    // Bet is deducted immediately when spin starts.
    ui.renderBalance(machine.getState().balance);
    ui.showResult("Spinning cylinders...", "neutral");

    const outcome = await spinPromise;

    clearInterval(animation);
    animation = null;
    await revealFinalReels(outcome.reels);

    ui.renderBalance(outcome.balance);

    if (outcome.didWin) {
      ui.showResult(
        `WIN! Payout: $${outcome.payout} (Net: ${outcome.netChange >= 0 ? "+" : ""}$${outcome.netChange})`,
        "win"
      );
    } else {
      ui.showResult(`LOSS. Net: -$${GAME_CONFIG.fixedBet}`, "loss");
    }
  } catch (error) {
    if (animation) {
      clearInterval(animation);
    }
    ui.stopSpinning();
    ui.showResult(error.message, "loss");
  } finally {
    if (animation) {
      clearInterval(animation);
    }
    spinInteractionLocked = false;
    ui.stopSpinning();
    updateSpinAvailability();

    if (!machine.canSpin() && machine.getState().balance < GAME_CONFIG.fixedBet) {
      ui.showResult("Game over: balance too low for next spin.", "loss");
    }
  }
}

ui.spinButton.addEventListener("click", handleSpin);
if (ui.themeToggleButton) {
  ui.themeToggleButton.addEventListener("click", handleThemeToggle);
}
initialize();
