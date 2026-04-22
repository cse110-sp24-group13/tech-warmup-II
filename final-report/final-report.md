# AI Slot Machine Final Report

## 1. Project Overview

We built an improved version of a slot machine game using an AI-assisted development workflow. The final product includes:

- Pixelated pirate theme
- Smoother animations
- Overall quality of life changes to make it have a more user friendly interface as well making it more engaging and easy to use

The goal of this project was to explore how AI tools can assist in building software while still maintaining engineering discipline, including testing, clean code, and iterative development.

---

## 2. Final Product Summary

### Features
- Pull lever mechanic
- More specified, clear theme, much like what a real slot machine would have, and a more user interactive interface than the previous tech-warmup
- Different backgrounds available(light and dark)
- Different difficulties added; more money to bet based on difficulty
- Pirate themed symbols used in the slots(eg. skulls, anchors, canons, gold coins, etc)
- Huge gold coin flow animation on major wins
- Game Rules feature to assist users
- Adjusted payout values and assigned rarities to symbols

### How to Play
1. Read the rules to decide what difficulty and mode(light/dark) to play on
2. Pull the lever or click the spin button to begin the slot machine
3. Collect your earnings, if any

### Technical Stack
- Language(s): JavaScript, Html, CSS
- Tools: Codex

---

## 3. AI Tools & Usage Strategy

We used the following AI tool consistently throughout the project:

- **Tool Used:** OpenAI Codex (GPT-5.3-Codex)

### Why we chose it
During the first ai-prompt run we tested in on both Codex and Claude to if both outputs would be a functioning slot machine, however both models failed to do so. This made us slightly modify our prompt to be simpler and increased the reasoning from medium to high on the chosen Codex model to see a better output. The second run resulted in something functional that could be built upon so we decided to choose that model.

### How we used AI
- Generated initial baseline of the slot machine
- Iteratively improved features one at a time
- Used AI for debugging, documentation, & bug fixes

### Prompting Strategy
- Used small, focused prompts rather than large requests
- Iterated step-by-step instead of full rewrites after the first initial prompt
- Refined prompts when AI output was incorrect or incomplete

---

## 4. Software Engineering Practices

### Testing
- Lever systems, spin mechanics its speed
- Ensuring theme consistency
- Adding new features and testing them in conjuction with others

### Clean Code Practices
- Added new small features one at a time, usually split up, one per person
- Constantly tested new features

---

## 5. Challenges & Limitations

During development, we encountered several challenges:

### AI-related issues
- Often misunderstood prompts, so they had to be adjusted/modified to be more specific, smaller requests.
- AI didn't quite understand win-rates in a typical gambing setting, so that also had to be adjusted. 

### Engineering challenges
- Adjusting how rewarding the slot machine
- Adding in our own gifs for animations
- Adding different difficulties & modes
- Making sure everyone knew what their task/feature was and that it was completed


---

## 6. Reflection

### What worked well
- AI definitely sped up a lot of the processes
- When it fully understand what we're asking, it does it somewhat well

### What didn’t work well
- Still required human intervention at times, leading to modifying prompts or even back tracking
- AI doesn't understand how a slot machine should be "engaging" to humans, so we had to go back in to correct prompts as, for instance, the spin button was spammable, which is definitely not realistic in a real-world scenario. 

### Final thoughts

We conclude that AI can be a powerful tool in the development/design process of a product, but requires extensive checking, testing, and the right prompts in order to be effective.