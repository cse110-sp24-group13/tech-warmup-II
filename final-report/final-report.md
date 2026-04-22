# AI Slot Machine Final Report

## 1. Project Overview

We built an improved version of a slot machine game using an AI-assisted development workflow. The final product includes:

- Pixelate pirate theme
- Smoother animations
- Overall quality of life changes to make it a more user friendly interface to make it more engaging and easy to use

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
- Constantly test new features

---

## 5. Challenges & Limitations

During development, we encountered several challenges:

### AI-related issues
- [Example: AI generated incorrect logic]
- [Example: inconsistent or overcomplicated code]
- [Example: required multiple prompt iterations]

### Engineering challenges
- Adjusting how rewarding the slot machine

---

## 6. Key Insights & Learnings

From this project, we learned:

- AI is effective for scaffolding and boilerplate generation
- AI struggles with consistency across larger systems
- Clear, constrained prompts produce better results
- Testing early is critical when using AI-generated code
- Human oversight is still necessary for correctness and structure

---

## 7. Reflection

### What worked well
- [AI helped speed up development]
- [Feature iteration was faster]
- [Debugging assistance]

### What didn’t work well
- [AI sometimes produced incorrect or overcomplex solutions]
- [Required multiple iterations to fix issues]

### Final thoughts
[Your honest reflection on AI-assisted development]

We conclude that AI is a powerful tool for software development, but it requires careful prompting, validation, and engineering discipline to produce reliable results.

---

## 8. Repository & Workflow Evidence

- Commit history shows iterative development
- AI use is documented in `ai-use-log.md`
- Planning artifacts are stored in `/plan`
- Code was tested and linted during development