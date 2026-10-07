# Playwright · accessibility

[Português](README.md)

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
[![Accessibility](https://github.com/brunobaccari/playwright-accessibility/actions/workflows/tests.yml/badge.svg)](https://github.com/brunobaccari/playwright-accessibility/actions/workflows/tests.yml)

Accessibility checks against the hosted [W3C Before and After Demonstration survey](https://www.w3.org/WAI/demos/bad/after/survey.html). The risk is a form that works with a mouse but whose fields cannot be reached by keyboard or identified through assistive technology.

## Scenarios

| Scenario | Release blocker |
| --- | --- |
| Initial form | Any axe violation in the selected WCAG 2.0/2.1 A/AA tags |
| Skip links | Tab/Enter cannot reach the first field from the document start |
| Radio group | Arrow keys fail to move focus/selection, multiple options remain checked or Tab traps focus |
| Contact fields | Missing accessible names, incorrect Tab/Shift+Tab order or lost typed values |
| Filled form | An axe violation after selecting options and filling fields |
| Negative control | Axe no longer detects the missing labels and document language in the `before` version |

The last case confirms that the detector finds known defects. A green result **does not mean that the before page is accessible**. Full axe results, including `incomplete`, are attached to the report; no rules or elements are excluded within the selected tags.

## Run

Node 24 and Python 3 for the CI gate checks.

```bash
npm ci
cp .env.example .env
npx playwright install chromium
npm run typecheck
npm test
npm run report
python check_summary.py
```

`BASE_URL` points to the hosted HTTPS demo. Changing it requires compatible `after/survey.html` and `before/survey.html` pages; this is not a generic website scanner. Input data is synthetic and the form is not submitted.

## CI and triage

Execution uses one worker, Chromium and zero retries. There are no sleeps, DOM edits or forced focus: keyboard navigation starts at the document and uses Tab, Enter, arrows and Shift+Tab.

Actions publishes a per-case summary and a `test-results` artifact retained for 7 days: HTML report, JUnit, full axe JSON and failure traces/screenshots. Extract the ZIP and open `playwright-report/index.html`. `.env` and outputs are ignored from the first commit.

The gate requires all six scenarios and rejects missing, malformed, empty or incomplete reports, failures, skips and an unsuccessful test step. `check_summary.py` verifies these conditions using ten inputs. W3C availability failures fail the run: inspect HTTP responses/traces before rerunning.

For axe violations, inspect the rule, selector and `helpUrl` in the attachment. Reproduce the issue before changing the test. For focus failures, check the actual Tab sequence and accessible name. Do not add exclusions just to get a green result.

## Limits

This is an educational demo originally from 2012, not a client application. The suite covers six scenarios across two versions of one page, not the entire website. It does not certify WCAG conformance or replace screen-reader testing, manual contrast/visible-focus assessment, zoom, other browsers or testing with people with disabilities. Post-submission state is not covered.

Axe can return `incomplete` results; these require manual review and are not treated as automatic approval. Focus assertions establish its destination, not the visual quality of the focus indicator.

References checked on 2026-10-06: [Playwright and axe](https://playwright.dev/docs/accessibility-testing), [W3C demo scope and purpose](https://www.w3.org/WAI/demos/bad/Overview.html).

Final-state screenshots are also captured for passing UI tests and stored in artifacts, outside Git.
