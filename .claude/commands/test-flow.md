---
description: Run the end-to-end test for the signup → course created flow and report time-to-completion.
---

Run `cd prototype && npx playwright test tests/e2e/signup-to-course-created.spec.ts --reporter=list`.

After it finishes, parse the timing output and compare against the target (under 5 minutes per the redesign goal). Report the actual time and the delta from target.
