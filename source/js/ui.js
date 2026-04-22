class SlotMachineUI {
  constructor() {
    this.reelsContainer = document.getElementById("reels");
    this.reelElements = [];
    this.reelSymbolElements = [];
    this.symbolLookup = new Map();
    this.balanceElement = document.getElementById("balance");
    this.betElement = document.getElementById("bet");
    this.boardSizeElement = document.getElementById("boardSize");
    this.resultElement = document.getElementById("result");
    this.spinButton = document.getElementById("spinButton");
    this.leverButton = document.getElementById("leverButton");
    this.spinControlLabel = document.getElementById("spinControlLabel");
    this.themeToggleButton = document.getElementById("themeToggle");
    this.rulesButton = document.getElementById("rulesButton");
    this.rulesDialog = document.getElementById("rulesDialog");
    this.closeRulesButton = document.getElementById("closeRulesButton");
    this.rulesBoardSizeElement = document.getElementById("rulesBoardSize");
    this.rulesFixedBetElement = document.getElementById("rulesFixedBet");
    this.rulesPayoutRowsElement = document.getElementById("rulesPayoutRows");
    this.winCelebrationElement = document.getElementById("winCelebration");
    this.winCelebrationAmountElement = document.getElementById("winCelebrationAmount");
    this.coinRainElement = document.getElementById("coinRain");
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

  buildCoinElement() {
    const coinElement = document.createElement("span");
    coinElement.className = "coin-drop";
    coinElement.style.setProperty("--coin-size", `${Math.floor(24 + Math.random() * 18)}px`);
    coinElement.style.setProperty("--coin-x-start", `${Math.floor(Math.random() * 96 + 2)}vw`);
    coinElement.style.setProperty("--coin-drift", `${Math.floor(Math.random() * 180 - 90)}px`);
    coinElement.style.setProperty("--coin-roll", `${Math.floor(Math.random() * 140 - 70)}deg`);
    coinElement.style.setProperty("--coin-fall-duration", `${Math.floor(1200 + Math.random() * 900)}ms`);
    coinElement.style.setProperty("--coin-fall-delay", `${Math.floor(Math.random() * 420)}ms`);

    const coinBody = document.createElement("span");
    coinBody.className = "coin-body";
    coinBody.style.setProperty("--coin-spin-duration", `${Math.floor(460 + Math.random() * 520)}ms`);
    coinBody.style.setProperty("--coin-tilt-x", `${Math.floor(56 + Math.random() * 28)}deg`);
    coinBody.style.setProperty("--coin-tilt-z", `${Math.floor(Math.random() * 40 - 20)}deg`);
    coinBody.style.setProperty("--coin-turn", Math.random() > 0.5 ? "1turn" : "-1turn");

    const frontFace = document.createElement("span");
    frontFace.className = "coin-face coin-face-front";
    frontFace.textContent = "$";

    const edgeFace = document.createElement("span");
    edgeFace.className = "coin-edge";

    const backFace = document.createElement("span");
    backFace.className = "coin-face coin-face-back";
    backFace.textContent = "$";

    coinBody.append(frontFace, edgeFace, backFace);
    coinElement.append(coinBody);

    return coinElement;
  }

  showWinCelebration(totalPayout) {
    if (!this.winCelebrationElement) {
      return;
    }

    if (this.winCelebrationTimeoutId !== null) {
      clearTimeout(this.winCelebrationTimeoutId);
      this.winCelebrationTimeoutId = null;
    }

    if (this.winCelebrationAmountElement) {
      this.winCelebrationAmountElement.textContent = this.formatMoney(totalPayout);
    }

    if (this.coinRainElement) {
      this.coinRainElement.innerHTML = "";

      for (let coinIndex = 0; coinIndex < 30; coinIndex += 1) {
        this.coinRainElement.append(this.buildCoinElement());
      }
    }

    this.winCelebrationElement.classList.remove("is-active");
    void this.winCelebrationElement.offsetWidth;
    this.winCelebrationElement.classList.add("is-active");

    this.winCelebrationTimeoutId = setTimeout(() => {
      this.winCelebrationElement.classList.remove("is-active");

      if (this.coinRainElement) {
        this.coinRainElement.innerHTML = "";
      }

      this.winCelebrationTimeoutId = null;
    }, 2800);
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

  renderRules({ columnCount, rowCount, fixedBet, symbols = [] }) {
    if (this.rulesBoardSizeElement) {
      this.rulesBoardSizeElement.textContent = `${columnCount} x ${rowCount}`;
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
