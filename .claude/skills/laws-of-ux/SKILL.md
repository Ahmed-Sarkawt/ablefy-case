---
name: laws-of-ux
description: Reference the relevant Laws of UX when justifying design decisions in commit messages, the decision log, or the slide deck. Use when explaining WHY a particular layout/flow choice was made — not for naming-convention purposes.
---

# Laws of UX (project-relevant subset)

These are the laws that come up most often in this project. Cite them when a decision needs justification.

## Hick's Law
> The time to make a decision increases with the number and complexity of choices.

**Where it applies here:** The 6-step onboarding form, the Advanced Settings payment panel with 12+ toggles, the 8-tab product editor. Every choice we *don't* show at the wrong moment saves time.

## Miller's Law
> The average person can keep ~7 (±2) items in working memory.

**Where it applies here:** The post-creation screen showing 4 next-action options. The dashboard mixing admin tasks with creation steps. Reduce to 3 at most for primary actions.

## Fitts's Law
> The time to acquire a target is a function of the distance to and size of the target.

**Where it applies here:** The "Create Course Content" CTA being buried below 3 secondary options. Make the primary action big and close to the cursor's resting position.

## Aesthetic-Usability Effect
> Users perceive aesthetically pleasing designs as easier to use.

**Where it applies here:** ablefy's UI has the right design tokens but inconsistent application. Tightening visual consistency raises perceived usability without changing functionality.

## Doherty Threshold
> Productivity soars when computer and user interact at <400ms response time.

**Where it applies here:** Animations should never exceed 300ms for micro-interactions. Form submissions need optimistic UI when possible.

## Jakob's Law
> Users spend most of their time on other sites and prefer ours to work the same way.

**Where it applies here:** Kajabi, Teachable, and Circle all use value-first onboarding. Deviating from this expectation is what creates Alex's confusion.

## Peak-End Rule
> People judge an experience by its peak (most intense point) and its end.

**Where it applies here:** The peak of frustration in the current flow is the foroom blank-page redirect. The "end" of onboarding for Alex is seeing his course created — make that moment celebratory.

## Tesler's Law (Conservation of Complexity)
> Every system has a minimum amount of complexity that cannot be reduced.

**Where it applies here:** The compliance data ablefy needs is real. We can move *who handles* the complexity (platform vs. user) and *when* (now vs. later), but the total complexity in the system is fixed. Option 02's chatbot moves it from user to AI; Option 01 moves it from now to later.
