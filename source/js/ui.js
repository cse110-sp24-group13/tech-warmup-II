class SlotMachineUI {
  constructor() {
    this.reelElements = Array.from(document.querySelectorAll(".reel"));
    this.reelSymbolElements = this.reelElements.map((reel) => reel.querySelector(".reel-symbol"));
    this.balanceElement = document.getElementById("balance");
    this.betElement = document.getElementById("bet");
    this.resultElement = document.getElementById("result");
    this.spinButton = document.getElementById("spinButton");
    this.spinControlLabel = document.getElementById("spinControlLabel");
    this.themeToggleButton = document.getElementById("themeToggle");
    this.currentTheme = "dark";
  }

  formatMoney(value) {
    return `$${value}`;
  }

  renderReels(reels) {
    this.reelSymbolElements.forEach((reelSymbolElement, index) => {
      if (reelSymbolElement) {
        reelSymbolElement.textContent = reels[index] || "❔";
      }
    });
  }

  renderSingleReel(index, symbol) {
    const reelSymbolElement = this.reelSymbolElements[index];

    if (reelSymbolElement) {
      reelSymbolElement.textContent = symbol || "❔";
    }
  }

  startSpinning() {
    this.reelElements.forEach((reelElement) => {
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

  renderBalance(balance) {
    this.balanceElement.textContent = this.formatMoney(balance);
  }

  renderBet(fixedBet) {
    this.betElement.textContent = this.formatMoney(fixedBet);
  }

  setSpinButtonState({ canSpin, isSpinning, noBalance }) {
    this.spinButton.disabled = !canSpin;
    this.spinButton.classList.toggle("is-spinning", isSpinning);
    this.spinButton.classList.toggle("is-disabled", !canSpin);

    const setLabel = (value) => {
      if (this.spinControlLabel) {
        this.spinControlLabel.textContent = value;
      } else {
        this.spinButton.textContent = value;
      }
    };

    if (isSpinning) {
      this.spinButton.setAttribute("aria-label", "Spin in progress");
      setLabel("Spinning...");
      return;
    }

    if (noBalance) {
      this.spinButton.setAttribute("aria-label", "No balance");
      setLabel("No Balance");
      return;
    }

    this.spinButton.setAttribute("aria-label", "Spin");
    setLabel("Spin");
  }

  showResult(message, type = "neutral") {
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
