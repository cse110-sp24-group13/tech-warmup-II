const machine = new SlotMachine(GAME_CONFIG);
const ui = new SlotMachineUI();
const THEME_STORAGE_KEY = "slot-machine-theme";
const COLUMN_START_DELAY_MS = 70;
const COLUMN_STOP_DELAY_MS = 85;
const LEVER_PULL_DISTANCE_PX = 120;
const LEVER_TRIGGER_THRESHOLD = 0.58;
const MODE_BUTTON_LABELS = {
  easy: "Switch to Hard Mode",
  hard: "Return to Easy Mode",
};
const MODE_STATUS_MESSAGES = {
  easy: "Easy mode active: $10 spins with steadier, lower-volatility payouts.",
  hard:
    "Hard mode active: $100 spins, tougher hit rates, but bigger multipliers.",
};
let spinInteractionLocked = false;

function sleep(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function getCurrentModeConfig() {
  return machine.getCurrentModeConfig();
}

function buildSymbolMap(symbols) {
  return Object.fromEntries(symbols.map((symbol) => [symbol.id, symbol]));
}

function updateSpinAvailability() {
  const { balance, fixedBet, isSpinning } = machine.getState();

  ui.setSpinButtonState({
    canSpin: machine.canSpin() && !spinInteractionLocked,
    isSpinning,
    noBalance: balance < fixedBet,
  });
  ui.setModeButtonState({ isDisabled: spinInteractionLocked || isSpinning });
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function renderCurrentMode({ refreshBoard } = { refreshBoard: false }) {
  const modeConfig = getCurrentModeConfig();
  const state = machine.getState();

  if (refreshBoard) {
    ui.buildBoard({
      columnCount: GAME_CONFIG.columnCount,
      rowCount: GAME_CONFIG.rowCount,
      symbols: machine.buildRandomReels().flat(),
      symbolMap: buildSymbolMap(modeConfig.symbols),
    });
  }

  ui.renderMode({
    modeLabel: modeConfig.label,
    buttonLabel: MODE_BUTTON_LABELS[state.modeKey],
    isHardMode: state.modeKey === "hard",
  });
  ui.renderBalance(state.balance);
  ui.renderBet(state.fixedBet);
  ui.renderRules({
    columnCount: GAME_CONFIG.columnCount,
    rowCount: GAME_CONFIG.rowCount,
    fixedBet: state.fixedBet,
    symbols: modeConfig.symbols,
    modeLabel: modeConfig.label,
  });
}

function initialize() {
  ui.setTheme(getInitialTheme());
  renderCurrentMode({ refreshBoard: true });
  ui.showResult("Press Spin to play.", "neutral");
  updateSpinAvailability();
}

function handleThemeToggle() {
  const nextTheme = ui.getTheme() === "dark" ? "light" : "dark";
  ui.setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function handleModeToggle() {
  if (spinInteractionLocked || machine.getState().isSpinning) {
    return;
  }

  const nextModeKey = machine.getState().modeKey === "hard" ? "easy" : "hard";
  machine.setMode(nextModeKey);
  renderCurrentMode({ refreshBoard: true });
  updateSpinAvailability();

  if (!machine.canSpin()) {
    ui.showResult(
      `${MODE_STATUS_MESSAGES[nextModeKey]} You need ${ui.formatMoney(machine.getState().fixedBet)} to spin.`,
      "loss"
    );
    return;
  }

  ui.showResult(MODE_STATUS_MESSAGES[nextModeKey], nextModeKey === "hard" ? "loss" : "neutral");
}

function getColumnCellIndexes(columnIndex) {
  return Array.from(
    { length: GAME_CONFIG.rowCount },
    (_, rowIndex) => rowIndex * GAME_CONFIG.columnCount + columnIndex
  );
}

function getRandomSymbolId() {
  const symbols = getCurrentModeConfig().symbols;
  const randomIndex = Math.floor(Math.random() * symbols.length);
  return symbols[randomIndex].id;
}

function startReelAnimation(activeCellIndexes) {
  return setInterval(() => {
    activeCellIndexes.forEach((cellIndex) => {
      ui.renderSingleReel(cellIndex, getRandomSymbolId());
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

    getColumnCellIndexes(columnIndex).forEach((cellIndex) => {
      ui.stopSingleReel(cellIndex);
      ui.renderSingleReel(cellIndex, flattenedReels[cellIndex]);
    });
  }
}

function getSpinValidationMessage() {
  if (machine.canSpin()) {
    return "";
  }

  const { balance, fixedBet, isSpinning } = machine.getState();

  if (isSpinning) {
    return "Spin already in progress.";
  }

  if (balance < fixedBet) {
    return `Not enough balance for a ${ui.formatMoney(fixedBet)} spin.`;
  }

  return "Cannot spin right now.";
}

function formatCascadeWin(cascade) {
  return cascade.wins
    .map((winGroup) => {
      const extraText = winGroup.extraCount > 0 ? ` (+${winGroup.extraCount})` : "";
      return `${winGroup.count}x ${winGroup.icon}${extraText} pays ${ui.formatMoney(winGroup.payout)}`;
    })
    .join(" | ");
}

async function playCascades(outcome) {
  for (const cascade of outcome.cascades) {
    ui.showResult(
      `Tumble ${cascade.index}: ${formatCascadeWin(cascade)}. Total win ${ui.formatMoney(
        cascade.totalPayout
      )}.`,
      "win"
    );
    await ui.animateWin(cascade.matchedIndexes, GAME_CONFIG.winFlashMs, GAME_CONFIG.clearDelayMs);
    ui.renderBalance(cascade.balanceAfterCascade);
    await ui.animateTumble(cascade.boardAfterTumble, cascade.droppedIndexes, GAME_CONFIG.tumbleDropMs);
    await sleep(GAME_CONFIG.cascadePauseMs);
  }
}

function showRoundSummary(outcome) {
  if (outcome.netChange > 0) {
    ui.showWinCelebration(outcome.totalPayout, outcome.fixedBet);
    const netPrefix = outcome.netChange >= 0 ? "+" : "";
    const tumbleSuffix = outcome.cascades.length === 1 ? "" : "s";
    ui.showResult(
      `${outcome.modeLabel} WIN! Total tumble win: ${ui.formatMoney(outcome.totalPayout)} (${netPrefix}${ui.formatMoney(
        outcome.netChange
      )} net) across ${outcome.cascades.length} tumble${tumbleSuffix}.`,
      "win"
    );
    return;
  }

  if (outcome.didWin) {
    const tumbleSuffix = outcome.cascades.length === 1 ? "" : "s";
    ui.showResult(
      `${outcome.modeLabel} RETURN. Total tumble win: ${ui.formatMoney(outcome.totalPayout)} (${ui.formatMoney(
        outcome.netChange
      )} net) across ${outcome.cascades.length} tumble${tumbleSuffix}.`,
      "neutral"
    );
    return;
  }

  ui.showResult(
    `${outcome.modeLabel} LOSS. Hit a symbol's minimum count anywhere on the board to trigger a tumble win.`,
    "loss"
  );
}

function clearReelAnimation(intervalId) {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
}

function triggerLeverSpin() {
  ui.animateLeverPull();
  handleSpin();
}

async function handleSpin() {
  if (spinInteractionLocked) {
    return;
  }

  spinInteractionLocked = true;
  updateSpinAvailability();
  let reelAnimationInterval = null;

  try {
    const validationMessage = getSpinValidationMessage();
    if (validationMessage) {
      ui.showResult(validationMessage, "loss");
      return;
    }

    const activeCellIndexes = new Set();
    reelAnimationInterval = startReelAnimation(activeCellIndexes);
    await startColumnsLeftToRight(activeCellIndexes);
    ui.syncSpinningReels(Array.from(activeCellIndexes));

    const spinPromise = machine.spin(GAME_CONFIG.spinDurationMs);
    const balanceAfterBet = machine.getState().balance;
    ui.renderBalance(balanceAfterBet);
    ui.showResult("Spinning cylinders...", "neutral");

    const outcome = await spinPromise;

    clearReelAnimation(reelAnimationInterval);
    reelAnimationInterval = null;
    await revealFinalReels(outcome.reels);
    ui.renderBalance(balanceAfterBet);

    if (outcome.didWin) {
      await playCascades(outcome);
    }
    showRoundSummary(outcome);
  } catch (error) {
    clearReelAnimation(reelAnimationInterval);
    reelAnimationInterval = null;
    ui.stopSpinning();
    ui.showResult(error.message, "loss");
  } finally {
    clearReelAnimation(reelAnimationInterval);
    spinInteractionLocked = false;
    ui.stopSpinning();
    ui.clearBoardEffects();
    renderCurrentMode();
    updateSpinAvailability();

    if (!machine.canSpin() && machine.getState().balance < machine.getState().fixedBet) {
      ui.showResult(
        `Game over for ${machine.getState().modeLabel.toLowerCase()} mode: balance too low for the next spin.`,
        "loss"
      );
    }
  }
}

function registerEventHandlers() {
  ui.spinButton.addEventListener("click", handleSpin);

  if (ui.leverButton) {
    let activeLeverPointerId = null;
    let leverStartY = 0;
    let leverProgress = 0;
    let suppressLeverClick = false;

    const finishLeverInteraction = (shouldSpin) => {
      ui.resetLeverGrab();
      activeLeverPointerId = null;
      leverStartY = 0;
      leverProgress = 0;

      if (shouldSpin) {
        triggerLeverSpin();
      }
    };

    ui.leverButton.addEventListener("pointerdown", (event) => {
      if (ui.leverButton.disabled || event.button !== 0) {
        return;
      }

      activeLeverPointerId = event.pointerId;
      leverStartY = event.clientY;
      leverProgress = 0;
      ui.leverButton.setPointerCapture(event.pointerId);
      ui.setLeverGrabProgress(0.02);
      event.preventDefault();
    });

    ui.leverButton.addEventListener("pointermove", (event) => {
      if (activeLeverPointerId === null || event.pointerId !== activeLeverPointerId) {
        return;
      }

      const pullDistance = Math.max(0, event.clientY - leverStartY);
      leverProgress = Math.min(1, pullDistance / LEVER_PULL_DISTANCE_PX);
      ui.setLeverGrabProgress(leverProgress);
    });

    const releaseLever = (event) => {
      if (activeLeverPointerId === null || event.pointerId !== activeLeverPointerId) {
        return;
      }

      if (ui.leverButton.hasPointerCapture(event.pointerId)) {
        ui.leverButton.releasePointerCapture(event.pointerId);
      }

      suppressLeverClick = leverProgress > 0.06;
      const shouldSpin = leverProgress >= LEVER_TRIGGER_THRESHOLD;
      finishLeverInteraction(shouldSpin);
    };

    ui.leverButton.addEventListener("pointerup", releaseLever);
    ui.leverButton.addEventListener("pointercancel", releaseLever);

    ui.leverButton.addEventListener("click", (event) => {
      if (suppressLeverClick) {
        suppressLeverClick = false;
        event.preventDefault();
        return;
      }

      triggerLeverSpin();
    });
  }

  if (ui.modeToggleButton) {
    ui.modeToggleButton.addEventListener("click", handleModeToggle);
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
}

registerEventHandlers();
initialize();

