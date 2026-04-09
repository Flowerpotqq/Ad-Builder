# Orchestration Guide

## File Loading Logic
1. Always load:
- `system.md`
- `input-schema.md`
- `output-schema.md`
- `guardrails.md`

2. Load by email type:
- promotional -> `frameworks.md` promo section + `examples/promo.md`
- welcome -> `frameworks.md` welcome section + `examples/welcome.md`
- newsletter -> `frameworks.md` newsletter section + `examples/newsletter.md`
- transactional -> `frameworks.md` transactional section + `examples/transactional.md`
- reengagement -> `frameworks.md` reengagement section + `examples/reengagement.md`

3. Load by goal:
- conversion/demo booking -> `agents/marketing.md`
- reminders/nudges -> `agents/recall.md`
- release announcements -> `agents/newRelease.md`
- setup/education -> `agents/onboarding.md`
- dormant user wake-up -> `agents/followup.md`

4. Always enrich with:
- `design-system.md`
- `components.md`
- `tone.md`
- `personalization.md`
- `deliverability.md`
- `playbooks/subject-lines.md`
- `playbooks/cta-library.md`

## Agent Selection Priority
1. Explicit requested intent
2. Email type default mapping
3. Funnel stage override

## Conflict Resolution
If two agents seem valid:
- Choose the agent tied to immediate conversion action.
- Use secondary agent guidance only for tone refinements.
