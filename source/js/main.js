const machine = new SlotMachine(GAME_CONFIG);
const ui = new SlotMachineUI();
const THEME_STORAGE_KEY = "slot-machine-theme";
const COLUMN_START_DELAY_MS = 70;
const COLUMN_STOP_DELAY_MS = 85;
const SYMBOL_BY_ID = Object.fromEntries(
  GAME_CONFIG.symbols.map((symbol) => [symbol.id, symbol])
);
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
  ui.buildBoard({
    columnCount: GAME_CONFIG.columnCount,
    rowCount: GAME_CONFIG.rowCount,
    symbols: machine.buildRandomReels().flat(),
    symbolMap: SYMBOL_BY_ID,
  });
  const state = machine.getState();
  ui.renderBalance(state.balance);
  ui.renderBet(state.fixedBet);
  ui.renderRules({
    columnCount: GAME_CONFIG.columnCount,
    rowCount: GAME_CONFIG.rowCount,
    fixedBet: state.fixedBet,
    symbols: GAME_CONFIG.symbols,
  });
  updateSpinAvailability();
}

function handleThemeToggle() {
  const nextTheme = ui.getTheme() === "dark" ? "light" : "dark";
  ui.setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function sleep(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function getColumnCellIndexes(columnIndex) {
  return Array.from({ length: GAME_CONFIG.rowCount }, (_, rowIndex) => {
    return rowIndex * GAME_CONFIG.columnCount + columnIndex;
  });
}

function startReelAnimation(activeCellIndexes) {
  return setInterval(() => {
    activeCellIndexes.forEach((cellIndex) => {
      const symbol =
        GAME_CONFIG.symbols[Math.floor(Math.random() * GAME_CONFIG.symbols.length)];
      ui.renderSingleReel(cellIndex, symbol.id);
    });
  }, GAME_CONFIG.animationTickMs);
}

async function startColumnsLeftToRight(activeCellIndexes) {
  for (let columnIndex = 0; columnIndex < GAME_CONFIG.columnCount; columnIndex += 1) {
    const cellIndexes = getColumnCellIndexes(columnIndex);

    cellIndexes.forEach((cellIndex) => {
      activeCellIndexes.add(cellIndex);
      ui.startSingleReel(cellIndex);
    });

    await sleep(COLUMN_START_DELAY_MS);
  }
}

async function revealFinalReels(outcomeReels) {
  const flattenedReels = outcomeReels.flat();

  for (let columnIndex = 0; columnIndex < GAME_CONFIG.columnCount; columnIndex += 1) {
    await sleep(COLUMN_STOP_DELAY_MS);
    const cellIndexes = getColumnCellIndexes(columnIndex);

    cellIndexes.forEach((cellIndex) => {
      ui.stopSingleReel(cellIndex);
      ui.renderSingleReel(cellIndex, flattenedReels[cellIndex]);
    });
  }
}

function formatCascadeWin(cascade) {
  return cascade.wins
    .map((winGroup) => {
      const extraText = winGroup.extraCount > 0 ? ` (+${winGroup.extraCount})` : "";
      return `${winGroup.count}x ${winGroup.icon}${extraText} pays ${ui.formatMoney(winGroup.payout)}`;
    })
    .join(" | ");
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

    updateSpinAvailability();

    const activeCellIndexes = new Set();
    animation = startReelAnimation(activeCellIndexes);
    await startColumnsLeftToRight(activeCellIndexes);
    ui.syncSpinningReels(Array.from(activeCellIndexes));
    const spinPromise = machine.spin(GAME_CONFIG.spinDurationMs);
    const balanceAfterBet = machine.getState().balance;

    ui.renderBalance(balanceAfterBet);
    ui.showResult("Spinning cylinders...", "neutral");

    const outcome = await spinPromise;

    clearInterval(animation);
    animation = null;
    await revealFinalReels(outcome.reels);

    ui.renderBalance(balanceAfterBet);

    if (outcome.didWin) {
      for (const cascade of outcome.cascades) {
        ui.showResult(
          `Tumble ${cascade.index}: ${formatCascadeWin(cascade)}. Total win ${ui.formatMoney(
            cascade.totalPayout
          )}.`,
          "win"
        );
        await ui.animateWin(
          cascade.matchedIndexes,
          GAME_CONFIG.winFlashMs,
          GAME_CONFIG.clearDelayMs
        );
        ui.renderBalance(cascade.balanceAfterCascade);
        await ui.animateTumble(
          cascade.boardAfterTumble,
          cascade.droppedIndexes,
          GAME_CONFIG.tumbleDropMs
        );
        await sleep(GAME_CONFIG.cascadePauseMs);
      }

      ui.showResult(
        `WIN! Total tumble win: ${ui.formatMoney(outcome.totalPayout)} (${outcome.netChange >= 0 ? "+" : ""}${ui.formatMoney(outcome.netChange)} net) across ${outcome.cascades.length} tumble${outcome.cascades.length === 1 ? "" : "s"}.`,
        "win"
      );
    } else {
      ui.showResult(
        "LOSS. Hit a symbol's minimum count anywhere on the board to trigger a tumble win.",
        "loss"
      );
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
    ui.clearBoardEffects();
    updateSpinAvailability();

    if (!machine.canSpin() && machine.getState().balance < GAME_CONFIG.fixedBet) {
      ui.showResult("Game over: balance too low for next spin.", "loss");
    }
  }
}

ui.spinButton.addEventListener("click", handleSpin);
if (ui.leverButton) {
  ui.leverButton.addEventListener("click", () => {
    ui.animateLeverPull();
    handleSpin();
  });
}
if (ui.themeToggleButton) {
  ui.themeToggleButton.addEventListener("click", handleThemeToggle);
}
if (ui.rulesButton) {
  ui.rulesButton.addEventListener("click", () => {
    ui.openRules();
  });
}
if (ui.closeRulesButton) {
  ui.closeRulesButton.addEventListener("click", () => {
    ui.closeRules();
  });
}
initialize();
