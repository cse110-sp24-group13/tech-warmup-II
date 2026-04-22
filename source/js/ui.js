class SlotMachineUI {
  constructor() {
    this.reelsContainer = document.getElementById("reels");
    this.reelElements = [];
    this.reelSymbolElements = [];
    this.symbolLookup = new Map();
    this.balanceElement = document.getElementById("balance");
    this.betElement = document.getElementById("bet");
    this.modeElement = document.getElementById("modeLabel");
    this.boardSizeElement = document.getElementById("boardSize");
    this.resultElement = document.getElementById("result");
    this.spinButton = document.getElementById("spinButton");
    this.leverButton = document.getElementById("leverButton");
    this.spinControlLabel = document.getElementById("spinControlLabel");
    this.modeToggleButton = document.getElementById("modeToggleButton");
    this.themeToggleButton = document.getElementById("themeToggle");
    this.rulesButton = document.getElementById("rulesButton");
    this.rulesDialog = document.getElementById("rulesDialog");
    this.closeRulesButton = document.getElementById("closeRulesButton");
    this.rulesBoardSizeElement = document.getElementById("rulesBoardSize");
    this.rulesModeLabelElement = document.getElementById("rulesModeLabel");
    this.rulesFixedBetElement = document.getElementById("rulesFixedBet");
    this.rulesPayoutRowsElement = document.getElementById("rulesPayoutRows");
    this.winCelebrationElement = document.getElementById("winCelebration");
    this.winCelebrationLabelElement = this.winCelebrationElement?.querySelector(
      ".win-celebration-label"
    );
    this.winCelebrationAmountElement = document.getElementById("winCelebrationAmount");
    this.coinRainElement = document.getElementById("coinRain");
    this.animatedCoinAssetPath = "assets/coin.gif";
    this.currencyFormatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    this.currentTheme = "dark";
    this.leverPullTimeoutId = null;
    this.winCelebrationTimeoutId = null;
    this.handleRulesDialogClick = this.handleRulesDialogClick.bind(this);
    this.handleRulesDialogClosed = this.handleRulesDialogClosed.bind(this);
    this.setupRulesDialog();
  }

  formatMoney(value) {
    return this.currencyFormatter.format(value);
  }

  wait(durationMs) {
    return new Promise((resolve) => setTimeout(resolve, durationMs));
  }

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  getWinCelebrationProfile(totalPayout, fixedBet) {
    const payout = Math.max(0, Number(totalPayout) || 0);
    const bet = Math.max(1, Number(fixedBet) || 1);
    const winMultiple = payout / bet;
    let tier = "small";
    if (winMultiple >= 7 || payout >= 70) {
      tier = "max";
    } else if (winMultiple >= 4 || payout >= 35) {
      tier = "mega";
    } else if (winMultiple >= 2.2 || payout >= 20) {
      tier = "big";
    } else if (winMultiple >= 1.1 || payout >= 10) {
      tier = "medium";
    }

    const settingsByTier = {
      small: {
        intensity: 0.16,
        coinBase: 48,
        coinPerPayout: 6,
        coinPerMultiple: 22,
        coinMax: 170,
        durationMs: 1700,
        cardPeakScale: 1.03,
        burstPeakScale: 1.14,
        overlayOpacity: 0,
        shakeDistance: 0,
      },
      medium: {
        intensity: 0.28,
        coinBase: 96,
        coinPerPayout: 8,
        coinPerMultiple: 28,
        coinMax: 250,
        durationMs: 2100,
        cardPeakScale: 1.06,
        burstPeakScale: 1.2,
        overlayOpacity: 0,
        shakeDistance: 0,
      },
      big: {
        intensity: 0.4,
        coinBase: 150,
        coinPerPayout: 10.5,
        coinPerMultiple: 36,
        coinMax: 380,
        durationMs: 2450,
        cardPeakScale: 1.1,
        burstPeakScale: 1.3,
        overlayOpacity: 0,
        shakeDistance: 0,
      },
      mega: {
        intensity: 0.72,
        coinBase: 260,
        coinPerPayout: 13.5,
        coinPerMultiple: 52,
        coinMax: 560,
        durationMs: 3250,
        cardPeakScale: 1.2,
        burstPeakScale: 1.62,
        overlayOpacity: 0.54,
        shakeDistance: 8,
      },
      max: {
        intensity: 1,
        coinBase: 360,
        coinPerPayout: 17,
        coinPerMultiple: 64,
        coinMax: 820,
        durationMs: 3900,
        cardPeakScale: 1.28,
        burstPeakScale: 1.95,
        overlayOpacity: 0.72,
        shakeDistance: 12,
      },
    };
    const tierSettings = settingsByTier[tier];
    const intensity = tierSettings.intensity;
    const coinCount = this.clamp(
      Math.round(
        tierSettings.coinBase +
          payout * tierSettings.coinPerPayout +
          winMultiple * tierSettings.coinPerMultiple
      ),
      tierSettings.coinBase,
      tierSettings.coinMax
    );
    const useHeavyFx = tier === "mega" || tier === "max";

    return {
      payout,
      intensity,
      tier,
      winMultiple,
      useHeavyFx,
      coinCount,
      maxDelayMs: Math.round(260 + intensity * 1180),
      coinSizeMin: Math.round(92 + intensity * 34),
      coinSizeMax: Math.round(190 + intensity * 120),
      driftMax: Math.round(220 + intensity * 440),
      fallMinMs: Math.round(3200 - intensity * 700),
      fallMaxMs: Math.round(6200 + intensity * 1200),
      spinMinMs: Math.round(360 - intensity * 90),
      spinMaxMs: Math.round(900 - intensity * 140),
      durationMs: tierSettings.durationMs,
      cardPeakScale: tierSettings.cardPeakScale.toFixed(3),
      burstPeakScale: tierSettings.burstPeakScale.toFixed(3),
      appShakeDistance: `${tierSettings.shakeDistance}px`,
      overlayOpacity: tierSettings.overlayOpacity.toFixed(3),
    };
  }

  getWinLabelByTier(tier) {
    if (tier === "max") {
      return "MAX WIN!";
    }

    if (tier === "mega") {
      return "SUPER BIG WIN!";
    }

    if (tier === "big") {
      return "BIG WIN!";
    }

    if (tier === "medium") {
      return "NICE WIN!";
    }

    return "WIN!";
  }

  buildCoinElement(profile) {
    const coinElement = document.createElement("span");
    coinElement.className = "coin-drop";
    const sizeRange = Math.max(1, profile.coinSizeMax - profile.coinSizeMin);
    const driftRange = profile.driftMax * 2;
    const fallRange = Math.max(1, profile.fallMaxMs - profile.fallMinMs);
    const spinRange = Math.max(1, profile.spinMaxMs - profile.spinMinMs);
    const rollBase = 90 + profile.intensity * 180;
    const turnMagnitude = (1 + Math.random() * 0.9 + profile.intensity * 0.8).toFixed(2);

    coinElement.style.setProperty(
      "--coin-size",
      `${Math.round(profile.coinSizeMin + Math.random() * sizeRange)}px`
    );
    coinElement.style.setProperty("--coin-x-start", `${Math.floor(Math.random() * 96 + 2)}vw`);
    coinElement.style.setProperty(
      "--coin-drift",
      `${Math.round(Math.random() * driftRange - profile.driftMax)}px`
    );
    coinElement.style.setProperty(
      "--coin-roll",
      `${Math.round(Math.random() * (rollBase * 2) - rollBase)}deg`
    );
    coinElement.style.setProperty(
      "--coin-fall-duration",
      `${Math.round(profile.fallMinMs + Math.random() * fallRange)}ms`
    );
    coinElement.style.setProperty(
      "--coin-fall-delay",
      `${Math.round(Math.random() * profile.maxDelayMs)}ms`
    );
    coinElement.style.setProperty(
      "--coin-end-y",
      `${Math.round(145 + Math.random() * 70)}vh`
    );

    const direction = Math.random() > 0.5 ? 1 : -1;
    const turnValue = (direction * Number(turnMagnitude)).toFixed(2);
    const turnHalfValue = (direction * Number(turnMagnitude) * 0.5).toFixed(2);

    const coinSprite = document.createElement("span");
    coinSprite.className = "coin-sprite";
    coinSprite.style.backgroundImage = `url("${this.animatedCoinAssetPath}")`;
    coinSprite.style.setProperty(
      "--coin-spin-duration",
      `${Math.round(profile.spinMinMs + Math.random() * spinRange)}ms`
    );
    coinSprite.style.setProperty("--coin-wobble", `${Math.round(6 + Math.random() * 10)}deg`);
    coinSprite.style.setProperty("--coin-turn-half", `${turnHalfValue}turn`);
    coinSprite.style.setProperty("--coin-turn", `${turnValue}turn`);

    coinElement.append(coinSprite);

    return coinElement;
  }

  showWinCelebration(totalPayout, fixedBet = 1) {
    if (!this.winCelebrationElement) {
      return;
    }

    const profile = this.getWinCelebrationProfile(totalPayout, fixedBet);
    const celebrationLifetimeMs = Math.max(
      profile.durationMs,
      profile.maxDelayMs + profile.fallMaxMs + 320
    );

    if (this.winCelebrationTimeoutId !== null) {
      clearTimeout(this.winCelebrationTimeoutId);
      this.winCelebrationTimeoutId = null;
    }

    document.body.classList.remove("is-win-celebrating");

    this.winCelebrationElement.dataset.winTier = profile.tier;
    this.winCelebrationElement.dataset.winImpact = profile.useHeavyFx ? "high" : "low";
    this.winCelebrationElement.style.setProperty("--win-card-peak-scale", profile.cardPeakScale);
    this.winCelebrationElement.style.setProperty("--win-burst-peak-scale", profile.burstPeakScale);
    this.winCelebrationElement.style.setProperty("--win-overlay-opacity", profile.overlayOpacity);
    this.winCelebrationElement.style.setProperty("--win-shake-distance", profile.appShakeDistance);
    this.winCelebrationElement.style.setProperty("--win-celebration-duration", `${profile.durationMs}ms`);
    document.body.style.setProperty("--win-shake-distance", profile.appShakeDistance);

    if (profile.useHeavyFx) {
      void document.body.offsetWidth;
      document.body.classList.add("is-win-celebrating");
    }

    if (this.winCelebrationLabelElement) {
      this.winCelebrationLabelElement.textContent = this.getWinLabelByTier(profile.tier);
    }

    if (this.winCelebrationAmountElement) {
      this.winCelebrationAmountElement.textContent = this.formatMoney(totalPayout);
    }

    if (this.coinRainElement) {
      this.coinRainElement.innerHTML = "";

      for (let coinIndex = 0; coinIndex < profile.coinCount; coinIndex += 1) {
        this.coinRainElement.append(this.buildCoinElement(profile));
      }
    }

    this.winCelebrationElement.classList.remove("is-active");
    void this.winCelebrationElement.offsetWidth;
    this.winCelebrationElement.classList.add("is-active");

    this.winCelebrationTimeoutId = setTimeout(() => {
      this.winCelebrationElement.classList.remove("is-active");
      document.body.classList.remove("is-win-celebrating");

      if (this.coinRainElement) {
        this.coinRainElement.innerHTML = "";
      }

      this.winCelebrationTimeoutId = null;
    }, celebrationLifetimeMs);
  }

  setupRulesDialog() {
    if (!this.rulesDialog) {
      return;
    }

    this.rulesDialog.addEventListener("click", this.handleRulesDialogClick);
    this.rulesDialog.addEventListener("close", this.handleRulesDialogClosed);
  }

  formatSymbolName(symbolId) {
    return symbolId
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  }

  renderRules({ columnCount, rowCount, fixedBet, symbols = [], modeLabel = "Easy" }) {
    if (this.rulesBoardSizeElement) {
      this.rulesBoardSizeElement.textContent = `${columnCount} x ${rowCount}`;
    }

    if (this.rulesModeLabelElement) {
      this.rulesModeLabelElement.textContent = modeLabel;
    }

    if (this.rulesFixedBetElement) {
      this.rulesFixedBetElement.textContent = this.formatMoney(fixedBet);
    }

    if (!this.rulesPayoutRowsElement) {
      return;
    }

    this.rulesPayoutRowsElement.innerHTML = "";

    symbols.forEach((symbol) => {
      const row = document.createElement("tr");
      const minimumPayout = this.formatMoney(fixedBet * symbol.baseMultiplier);
      const extraPayout = this.formatMoney(fixedBet * symbol.extraMultiplier);
      const symbolLabel = symbol.icon ? `${symbol.icon} ${this.formatSymbolName(symbol.id)}` : symbol.id;

      row.innerHTML = `
        <td class="rules-symbol">${symbolLabel}</td>
        <td>${symbol.minCount}</td>
        <td>${minimumPayout}</td>
        <td>+${extraPayout}</td>
      `;
      this.rulesPayoutRowsElement.append(row);
    });
  }
  openRules() {
    if (!this.rulesDialog || this.rulesDialog.open) {
      return;
    }

    if (typeof this.rulesDialog.showModal === "function") {
      this.rulesDialog.showModal();
    } else {
      this.rulesDialog.setAttribute("open", "open");
    }

    document.body.classList.add("is-modal-open");
    if (this.rulesButton) {
      this.rulesButton.setAttribute("aria-expanded", "true");
    }
  }

  closeRules() {
    if (!this.rulesDialog) {
      return;
    }

    if (this.rulesDialog.open && typeof this.rulesDialog.close === "function") {
      this.rulesDialog.close();
      return;
    }

    this.rulesDialog.removeAttribute("open");
    this.handleRulesDialogClosed();
  }

  handleRulesDialogClick(event) {
    if (event.target === this.rulesDialog) {
      this.closeRules();
    }
  }

  handleRulesDialogClosed() {
    document.body.classList.remove("is-modal-open");

    if (this.rulesButton) {
      this.rulesButton.setAttribute("aria-expanded", "false");
    }
  }

  getSymbolConfig(symbolId) {
    if (!symbolId) {
      return null;
    }

    return this.symbolLookup.get(symbolId) || null;
  }

  setCellSymbol(reelSymbolElement, symbolId) {
    if (!reelSymbolElement) {
      return;
    }

    const hasSymbol = Boolean(symbolId);
    const symbolConfig = hasSymbol ? this.getSymbolConfig(symbolId) : null;
    const symbolGlyph = symbolConfig?.icon || symbolId || "";
    const symbolImage = symbolConfig?.image || "";

    if (hasSymbol && symbolImage) {
      reelSymbolElement.textContent = "";
      reelSymbolElement.style.setProperty("--symbol-image", `url("${symbolImage}")`);
      reelSymbolElement.classList.add("has-image");
      reelSymbolElement.setAttribute("aria-label", symbolId);
    } else {
      reelSymbolElement.textContent = hasSymbol ? symbolGlyph : "";
      reelSymbolElement.style.removeProperty("--symbol-image");
      reelSymbolElement.classList.remove("has-image");
      reelSymbolElement.removeAttribute("aria-label");
    }

    reelSymbolElement.dataset.symbolId = hasSymbol ? symbolId : "";
    reelSymbolElement.classList.toggle("is-empty", !hasSymbol);
  }

  buildBoard({ columnCount, rowCount, symbols = [], symbolMap = {} }) {
    if (!this.reelsContainer) {
      return;
    }

    this.symbolLookup = new Map(Object.entries(symbolMap));
    this.reelsContainer.style.setProperty("--grid-columns", String(columnCount));
    this.reelsContainer.innerHTML = "";

    const totalCells = columnCount * rowCount;

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
      const reelElement = document.createElement("div");
      reelElement.className = "reel";
      reelElement.dataset.reel = String(cellIndex);

      const reelCylinder = document.createElement("div");
      reelCylinder.className = "reel-cylinder";

      const reelSymbol = document.createElement("span");
      reelSymbol.className = "reel-symbol";
      this.setCellSymbol(reelSymbol, symbols[cellIndex] || null);

      reelCylinder.append(reelSymbol);
      reelElement.append(reelCylinder);
      this.reelsContainer.append(reelElement);
    }

    this.reelElements = Array.from(this.reelsContainer.querySelectorAll(".reel"));
    this.reelSymbolElements = this.reelElements.map((reel) => reel.querySelector(".reel-symbol"));
    this.renderBoardSize(columnCount, rowCount);
  }

  normalizeSymbols(reels) {
    if (!Array.isArray(reels)) {
      return [];
    }

    if (Array.isArray(reels[0])) {
      return reels.flat();
    }

    return reels;
  }

  renderReels(reels) {
    const normalizedReels = this.normalizeSymbols(reels);

    this.reelSymbolElements.forEach((reelSymbolElement, index) => {
      this.setCellSymbol(reelSymbolElement, normalizedReels[index] || null);
    });
  }

  renderSingleReel(index, symbolId) {
    const reelSymbolElement = this.reelSymbolElements[index];
    this.setCellSymbol(reelSymbolElement, symbolId || null);
  }

  startSingleReel(index) {
    const reelElement = this.reelElements[index];

    if (reelElement) {
      reelElement.classList.add("is-spinning");
    }
  }

  syncSpinningReels(indexes) {
    const spinningReels = indexes
      .map((index) => this.reelElements[index])
      .filter(Boolean);

    spinningReels.forEach((reelElement) => {
      reelElement.classList.remove("is-spinning");
    });

    if (this.reelsContainer) {
      // Force reflow so restarting the class retriggers the CSS animation.
      void this.reelsContainer.offsetWidth;
    }

    spinningReels.forEach((reelElement) => {
      reelElement.classList.add("is-spinning");
    });
  }

  stopSpinning() {
    this.reelElements.forEach((reelElement) => {
      reelElement.classList.remove("is-spinning");
    });
  }

  stopSingleReel(index) {
    const reelElement = this.reelElements[index];

    if (reelElement) {
      reelElement.classList.remove("is-spinning");
    }
  }

  clearBoardEffects() {
    this.reelElements.forEach((reelElement) => {
      reelElement.classList.remove("is-winning", "is-clearing", "is-tumbling");
    });
  }

  markCells(indexes, className, isActive) {
    indexes.forEach((index) => {
      const reelElement = this.reelElements[index];

      if (reelElement) {
        reelElement.classList.toggle(className, isActive);
      }
    });
  }

  async animateWin(indexes, flashDurationMs, clearDelayMs) {
    this.clearBoardEffects();
    this.markCells(indexes, "is-winning", true);
    await this.wait(flashDurationMs);

    this.markCells(indexes, "is-clearing", true);
    indexes.forEach((index) => this.renderSingleReel(index, null));
    await this.wait(clearDelayMs);

    this.markCells(indexes, "is-winning", false);
    this.markCells(indexes, "is-clearing", false);
  }

  async animateTumble(reels, indexes, durationMs) {
    this.renderReels(reels);
    this.markCells(indexes, "is-tumbling", true);
    await this.wait(durationMs);
    this.markCells(indexes, "is-tumbling", false);
  }

  renderMode({ modeLabel, buttonLabel, isHardMode }) {
    if (this.modeElement) {
      this.modeElement.textContent = modeLabel;
    }

    if (this.modeToggleButton) {
      this.modeToggleButton.textContent = buttonLabel;
      this.modeToggleButton.classList.toggle("is-hard", Boolean(isHardMode));
      this.modeToggleButton.setAttribute("aria-pressed", String(Boolean(isHardMode)));
    }
  }

  setModeButtonState({ isDisabled }) {
    if (!this.modeToggleButton) {
      return;
    }

    this.modeToggleButton.disabled = Boolean(isDisabled);
  }

  renderBalance(balance) {
    if (this.balanceElement) {
      this.balanceElement.textContent = this.formatMoney(balance);
    }
  }

  renderBet(fixedBet) {
    if (this.betElement) {
      this.betElement.textContent = this.formatMoney(fixedBet);
    }
  }

  renderBoardSize(columnCount, rowCount) {
    if (this.boardSizeElement) {
      this.boardSizeElement.textContent = `${columnCount} x ${rowCount}`;
    }
  }

  setSpinButtonState({ canSpin, isSpinning, noBalance }) {
    if (!this.spinButton) {
      return;
    }

    this.spinButton.disabled = !canSpin;
    this.spinButton.classList.toggle("is-spinning", isSpinning);
    this.spinButton.classList.toggle("is-disabled", !canSpin);

    if (this.leverButton) {
      this.leverButton.disabled = !canSpin;
      this.leverButton.classList.toggle("is-spinning", isSpinning);
      this.leverButton.classList.toggle("is-disabled", !canSpin);

      if (!canSpin || isSpinning) {
        this.resetLeverGrab();
      }
    }

    const setLabel = (value) => {
      if (this.spinControlLabel) {
        this.spinControlLabel.textContent = value;
      } else {
        this.spinButton.textContent = value;
      }
    };

    if (isSpinning) {
      this.spinButton.setAttribute("aria-label", "Spin in progress");
      if (this.leverButton) {
        this.leverButton.setAttribute("aria-label", "Lever in motion");
      }
      setLabel("Spinning...");
      return;
    }

    if (noBalance) {
      this.spinButton.setAttribute("aria-label", "No balance");
      if (this.leverButton) {
        this.leverButton.setAttribute("aria-label", "Lever unavailable: no balance");
      }
      setLabel("No Balance");
      return;
    }

    this.spinButton.setAttribute("aria-label", "Spin");
    if (this.leverButton) {
      this.leverButton.setAttribute("aria-label", "Pull lever to spin");
    }
    setLabel("Spin");
  }

  setLeverGrabProgress(progress) {
    if (!this.leverButton) {
      return;
    }

    const clampedProgress = Math.max(0, Math.min(1, Number(progress) || 0));
    this.leverButton.style.setProperty("--lever-grab-progress", clampedProgress.toFixed(3));
    this.leverButton.classList.toggle("is-grabbed", clampedProgress > 0);
  }

  resetLeverGrab() {
    if (!this.leverButton) {
      return;
    }

    this.leverButton.classList.remove("is-grabbed");
    this.leverButton.style.removeProperty("--lever-grab-progress");
  }

  animateLeverPull() {
    if (!this.leverButton || this.leverButton.disabled) {
      return;
    }

    this.resetLeverGrab();

    if (this.leverPullTimeoutId !== null) {
      clearTimeout(this.leverPullTimeoutId);
    }

    this.leverButton.classList.remove("is-pulled");
    void this.leverButton.offsetWidth;
    this.leverButton.classList.add("is-pulled");
    this.leverPullTimeoutId = setTimeout(() => {
      this.leverButton.classList.remove("is-pulled");
      this.leverPullTimeoutId = null;
    }, 360);
  }

  showResult(message, type = "neutral") {
    if (!this.resultElement) {
      return;
    }

    this.resultElement.textContent = message;
    this.resultElement.classList.remove("win", "loss");

    if (type === "win") {
      this.resultElement.classList.add("win");
    }

    if (type === "loss") {
      this.resultElement.classList.add("loss");
    }
  }

  setTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    this.currentTheme = nextTheme;
    document.body.dataset.theme = nextTheme;

    if (this.themeToggleButton) {
      this.themeToggleButton.textContent =
        nextTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";
      this.themeToggleButton.setAttribute("aria-pressed", String(nextTheme === "dark"));
    }
  }

  getTheme() {
    return this.currentTheme;
  }
}

window.SlotMachineUI = SlotMachineUI;






