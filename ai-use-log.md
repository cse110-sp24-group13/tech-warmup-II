# V1 - Slot Machine Foundation

## Prompts
<details>
  <summary>Prompt 1: didn't work</summary>

  Okay, we're going to build out V1 of the slot machine. I want a working model. Don't stress too much about design and UI/UX. The focus on this first run is to have a functioning machine with clear win/loss outcomes. Specifics for the slot machine:

  - basic slot machine functionality
  - 3 reels
  - each spin produces a random result
  - a visible player balance/credit count
  - fixed bet amount per spin
  - a Spin button
  - clear win/loss result shown after each spin
  - prevent spinning if balance is too low
  - prevent multiple spins at the same time

  Game rules:

  - player starts with 100 credits
  - each spin costs 10 credits
  - use a small set of symbols, for example: Cherry, Lemon, Bell, Seven
  - if all 3 symbols match, the player wins
  - if the symbols do not all match, the player loses the spin cost
  - use a simple payout table:
    - Cherry Cherry Cherry = 20 credits
    - Lemon Lemon Lemon = 30 credits
    - Bell Bell Bell = 50 credits
    - Seven Seven Seven = 100 credits

  specifics for code:

  - modular so easy to edit
  - tech stack: html, css, js
</details>

<details>
  <summary>Prompt 2: did build something that worked</summary>

  Okay, we're going to build out V1 of the slot machine. I want a working model. Don't stress too much about design and UI/UX. The focus on this first run is to have a functioning machine with clear win/loss outcomes. Specifics for the slot machine:

  - basic slot machine functionality
  - 3 reels
  - each spin produces a random result
  - a visible player balance/credit count
  - fixed bet amount per spin
  - a Spin button
  - clear win/loss result shown after each spin
  - prevent spinning if balance is too low
  - prevent multiple spins at the same time

  specifics for code:

  - modular so easy to edit
  - tech stack: html, css, js

  build it out in /source
</details>

<details>
  <summary>Prompt 3: fixed the initial spin button</summary>

  The spin button isn't functioning.
</details>

<details>
  <summary>Prompt 4: specifying spinning functionality</summary>

  I want a spinning cylinder for the slots. Make it look fancier, and reference the images in /plan/raw research/images.
</details>

<details>
  <summary>Prompt 5: adjusting and fixing changes made</summary>

  Okay, you've used an image as a background. I meant to use the images as reference. Let's go with a pirate theme for the slot machine. Create a border and fancy lettering for the machine.
</details>

<details>
  <summary>Prompt 6: light/dark mode</summary>

  Add a dark mode and light mode toggle for the slot machine.
</details>

<details>
  <summary>Prompt 7: lever button functionality</summary>

  I want the spin button to be a clickable lever.
</details>

<details>
  <summary>Prompt 8: fixing lever</summary>

  Put the lever on the right side of the spinner. It should be clickable and draggable.
</details>

<details>
  <summary>Prompt 9: fixing lever</summary>

  The lever is buggy. It has two pieces that break apart and come back together. I want a lever that can be clicked, dragged, and pulled on the outside of the slot machine. Think of a machine in Vegas where a user can pull the lever to spin. The idea behind this machine is to be immersive and responsive.
</details>

<details>
  <summary>Prompt 10: lever idea wasn't working, so adjusted back to a button</summary>

  Let's turn it back into a button. Make it circular, animated, and fun. The user shouldn't be able to spam the button. It should look and feel clickable, and there should be an animation to show it's being spun.
</details>

<details>
  <summary>Prompt 11: adding a 6 x 5 grid to the game</summary>

  Can we make this game from a 1 x 3 grid to a 6 x 5 grid.
</details>

<details>
  <summary>Prompt 12: spinning starts column by column from left to right</summary>

  Rather than having the entire slot machine all spin at once, can you make it spin starting column by column from left to right and stop in the order it started in.
</details>

<details>
  <summary>Prompt 13: make the spin equal</summary>

  For the spin, although we start from left to right, can you align all the spins to be spinning equally once the spin from left to right once all the columns sync and are already spinning.
</details>

<details>
  <summary>Prompt 14: slowing down the spinning</summary>

  Can you slow down how quickly the columns are spinning, and make the spin not last as long.
</details>

<details>
  <summary>Prompt 15: change reward function for 6 x 5 grid and add tumble winnings</summary>

  Can you adjust the reward/win mechanism to instead count the number of a certain symbol across the entire board, and if it exceeds a certain number, the player wins a small amount of money.

  Different symbols should be worth different amounts - some are more valuable, some are less.

  The more symbols above the minimum that the player hits, the more they win from it.

  Then these symbols should be removed from the board after an effect that shows the player winning a prize, and then symbols should drop to fill their place.

  Basically, we are implementing a tumble-win feature. The total winnings should build up.

  The return rate should be approximately 96%. Please adjust values to fit this.
</details>

<details>
  <summary>Prompt 16: adjusting how common payouts are</summary>

  Can you adjust the number required for a win to be lower (say, 7 symbols), but in return adjust the winnings when the player does win to be lower. Wins should be more common, but are less impactful per win. Should try to aim for 96% RTP.
</details>

<details>
  <summary>Prompt 17: clarify symbol payouts and rebalance for 96% RTP</summary>

  They should all payout at 7 symbols, though some symbols should be rarer than others. Adjust the payout values to reach 96% RTP. If needed, add more symbol types (1 or 2 more symbols so there is more spread).
</details>

<details>
  <summary>Prompt 18: rearrange UI features</summary>

  For the formatting of the game, I want the spin button and the balance information on the same line, not two separate blocks.
</details>

<details>
  <summary>Prompt 19: trying the lever again</summary>

  Can you also add a clickable lever to the right side of the slot machine, make sure the functionality is clean and fun.
</details>

<details>
  <summary>Prompt 20: rearranging</summary>

  For the formatting of the game, I want the spin button and the balance information on the same line, not two separate blocks.

  Not just the "balance"; everything that was in there should be on that one line.
</details>

<details>
  <summary>Prompt 21: modifying rearranging</summary>

  Place the spin button on the right side.
</details>

<details>
  <summary>Prompt 22: clickable rules popup</summary>

  Add a rules clickable popup.
</details>

<details>
  <summary>Prompt 23: theming slot machine icons</summary>

  I am really trying to sell this pirate theme; can you make new slot machine icons to look super fun pirate-themed gambling.
</details>

<details>
  <summary>Prompt 24: modifying icons</summary>

  Looks better. Maybe also try incorporating or swapping in some letters and numbers; we're building a gambling slot machine.
</details>

<details>
  <summary>Prompt 25: importing new background</summary>

  Can you change the background to the GIF I just added in `assets`.

  I feel like it does not really match the theme of the game that much. Is there anything we can alter to the GIF.
</details>

<details>
  <summary>Prompt 26: coin GIF implementation</summary>

  I want fun animations on wins. Can you implement a win animation that pops up in the center and rains gold coins (like Mario-styled, and 3D so they are able to rotate).
</details>

<details>
  <summary>Prompt 27: more coin GIF</summary>

  I want more in-your-face feedback, and the bigger the win, the more coins.
</details>

<details>
  <summary>Prompt 28: more coin GIF</summary>

  If it is not a super big win, do not do too much. Only go heavy for super big wins, and max wins should maybe be a red color, like there are levels.
</details>

<details>
  <summary>Prompt 29: more coin GIF</summary>

  Make the coins way bigger, I want to be showered in money.

  I added a gold coin animation but the background is not dropping, so find a workaround or I need a new PNG.
</details>

<details>
  <summary>Prompt 30: more coin GIF</summary>

  Make the coins huge and I want more coins. I want to be smacked in the face by coins if I win.
</details>

## Reasoning
We tried the first prompt on both Codex and Claude to see whether either model could output a functioning slot machine. However, both models failed to do so. Because of this, we slightly simplified the prompt and increased the reasoning level from medium to high on the chosen Codex model to get a better output. On the second run, we got a workable baseline and made small feature improvements to stabilize the first functional version of the machine.

Features that needed revisions:
1. The spin button was not spinning the machine, so we used a prompt that explicitly called out the issue. This took one prompt ("the spin button doesn't work properly"), and the model was able to target the feature and adjust it accordingly. Once this feature worked, the slot machine functioned properly.

After the spin button functionality was wired up and working, we developed specific features of the game with multiple AI models working in parallel. We had one model focused on building and refining a light/dark mode toggle, another refining the base theme (we chose a simple pirate theme), and another focused on developing a lever instead of a button. For the lever model, we found that every iteration was not very usable, and that a button was more fun and interactive. So, we scrapped lever development and stuck with a more engaging spin button. We went ahead and pushed this as V1, using it as a base for future implementation.

As development continued, we reattempted the lever functionality, and ran into quite a few bugs that took multiple prompts to rework. There was a shadow bug in the lever, and no matter how many new models tried to find this bug, it was only discovered when we manually went into the html inspect functionality in our browser to identify where in the code this bug was stemming from, and from there it was a simple fix (line deletion).

In summary, we found that working with the AI model for development is really strong when targeting specific features. We also found that an understanding of code structure is necessary to identify issues in within the code to easily target issues AI may overlook. 
