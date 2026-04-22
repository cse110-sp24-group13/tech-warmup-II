const machine = new SlotMachine(GAME_CONFIG);
const ui = new SlotMachineUI();
const THEME_STORAGE_KEY = "slot-machine-theme";
const COLUMN_START_DELAY_MS = 70;
const COLUMN_STOP_DELAY_MS = 85;
const LEVER_PULL_DISTANCE_PX = 120;
const LEVER_TRIGGER_THRESHOLD = 0.58;
const SYMBOL_BY_ID = Object.fromEntries(GAME_CONFIG.symbols.map((symbol) => [symbol.id, symbol]));
let spinInteractionLocked = false;

function sleep(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function updateSpinAvailability() {
  const { balance, fixedBet, isSpinning } = machine.getState();

  ui.setSpinButtonState({
    canSpin: machine.canSpin() && !spinInteractionLocked,
    isSpinning,
    noBalance: balance < fixedBet,
  });
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function initializeBoardAndStats() {
  ui.buildBoard({
    columnCount: GAME_CONFIG.columnCount,
    rowCount: GAME_CONFIG.rowCount,
    symbols: machine.buildRandomReels().flat(),
    symbolMap: SYMBOL_BY_ID,
  });

  const { balance, fixedBet } = machine.getState();
  ui.renderBalance(balance);
  ui.renderBet(fixedBet);
  ui.renderRules({
    columnCount: GAME_CONFIG.columnCount,
    rowCount: GAME_CONFIG.rowCount,
    fixedBet,
    symbols: GAME_CONFIG.symbols,
  });
}

function initialize() {
  ui.setTheme(getInitialTheme());
  initializeBoardAndStats();
  updateSpinAvailability();
}

function handleThemeToggle() {
  const nextTheme = ui.getTheme() === "dark" ? "light" : "dark";
  ui.setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function getColumnCellIndexes(columnIndex) {
  return Array.from(
    { length: GAME_CONFIG.rowCount },
    (_, rowIndex) => rowIndex * GAME_CONFIG.columnCount + columnIndex
  );
}

function getRandomSymbolId() {
  const randomIndex = Math.floor(Math.random() * GAME_CONFIG.symbols.length);
  return GAME_CONFIG.symbols[randomIndex].id;
}

function startReelAnimation(activeCellIndexes) {
  return setInterval(() => {
    activeCellIndexes.forEach((cellIndex) => {
      ui.renderSingleReel(cellIndex, getRandomSymbolId());
    });
  }, GAME_CONFIG.animationTickMs);
}

async function startColumnsLeftToRight(activeCellIndexes) {
  // Stagger reel start by column to create a sweep effect before the spin resolves.
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
    return "Not enough balance to spin.";
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
  if (outcome.didWin) {
    ui.showWinCelebration(outcome.totalPayout);
    const netPrefix = outcome.netChange >= 0 ? "+" : "";
    const tumbleSuffix = outcome.cascades.length === 1 ? "" : "s";
    ui.showResult(
      `WIN! Total tumble win: ${ui.formatMoney(outcome.totalPayout)} (${netPrefix}${ui.formatMoney(
        outcome.netChange
      )} net) across ${outcome.cascades.length} tumble${tumbleSuffix}.`,
      "win"
    );
    return;
  }

  ui.showResult(
    "LOSS. Hit a symbol's minimum count anywhere on the board to trigger a tumble win.",
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
    updateSpinAvailability();

    if (!machine.canSpin() && machine.getState().balance < GAME_CONFIG.fixedBet) {
      ui.showResult("Game over: balance too low for next spin.", "loss");
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
