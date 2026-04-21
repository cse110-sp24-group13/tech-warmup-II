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

## Reasoning
We tried the first prompt on both Codex and Claude to see whether either model could output a functioning slot machine. However, both models failed to do so. Because of this, we slightly simplified the prompt and increased the reasoning level from medium to high on the chosen Codex model to get a better output. On the second run, we got a workable baseline and made small feature improvements to stabilize the first functional version of the machine.

Features that needed revisions:
1. The spin button was not spinning the machine, so we used a prompt that explicitly called out the issue. This took one prompt ("the spin button doesn't work properly"), and the model was able to target the feature and adjust it accordingly. Once this feature worked, the slot machine functioned properly.

After the spin button functionality was wired up and working, we developed specific features of the game with multiple AI models working in parallel. We had one model focused on building and refining a light/dark mode toggle, another refining the base theme (we chose a simple pirate theme), and another focused on developing a lever instead of a button. For the lever model, we found that every iteration was not very usable, and that a button was more fun and interactive. So, we scrapped lever development and stuck with a more engaging spin button.
