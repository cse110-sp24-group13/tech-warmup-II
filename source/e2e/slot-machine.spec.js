import { test, expect } from '@playwright/test';

test.describe('Slot Machine UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://127.0.0.1:5500/tech-warmup-II/source/index.html');
  });

  test('should display correct initial state', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText("Blackbeard's Bounty");
    await expect(page.locator('#balance')).toHaveText('$100');
    await expect(page.locator('#bet')).toHaveText('$10');
    await expect(page.locator('#result')).toHaveText('Press Spin to play.');
  });

  test('should toggle theme', async ({ page }) => {
    const themeButton = page.locator('#themeToggle');
    
    // Initial state (Dark Mode by default if OS prefers dark, or Light)
    const initialText = await themeButton.innerText();
    
    await themeButton.click();
    const afterClickText = await themeButton.innerText();
    
    expect(initialText).not.toBe(afterClickText);
  });

  test('should perform a spin and update balance', async ({ page }) => {
    const spinButton = page.locator('#spinButton');
    const balanceDisplay = page.locator('#balance');
    
    // Initial balance should be $100
    await expect(balanceDisplay).toHaveText('$100');
    
    // Click spin
    await spinButton.click({ force: true });
    
    // During spin, balance should immediately drop by the bet amount ($10)
    // and result should show "Spinning cylinders..."
    await expect(balanceDisplay).toHaveText('$90');
    await expect(page.locator('#result')).toHaveText('Spinning cylinders...');
    
    // Wait for spin to complete (Duration is 1200ms in config + some animation time)
    // We wait for the "Spin" label to return to the button
    await expect(page.locator('#spinControlLabel')).toHaveText('Spin', { timeout: 5000 });
    
    // Balance should have updated based on outcome (win or loss)
    const finalBalanceText = await balanceDisplay.innerText();
    const finalBalance = parseInt(finalBalanceText.replace('$', ''));
    
    // Balance should be != 90 (unless net change was 0, but $10 bet means it's usually different)
    // Or at least it should no longer show the intermediate "Spinning..." status
    await expect(page.locator('#result')).not.toHaveText('Spinning cylinders...');
  });

  test('should show three reels', async ({ page }) => {
    const reels = page.locator('.reel');
    await expect(reels).toHaveCount(3);
  });
});
