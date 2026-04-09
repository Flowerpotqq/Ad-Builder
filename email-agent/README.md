# Email Agent Prompt System

This package is a markdown-native context system for campaign email generation only.

Scope:
- Included: campaign emails (promotional, welcome, newsletter, transactional, re-engagement, launch, follow-up)
- Excluded: ad creative and visual studio ad prompts

Primary outcomes:
- Consistent, high-converting email copy and structure
- Visual clarity inspired by modern SaaS emails
- Reusable agent-specific behavior for campaign goals

## Folder map

- `system.md`: master behavior and hard output contract
- `design-system.md`: visual language and layout logic
- `frameworks.md`: campaign-type playbooks
- `components.md`: reusable blocks and formatting rules
- `tone.md`: voice modes and writing constraints
- `guardrails.md`: legal, trust, and anti-spam boundaries
- `personalization.md`: merge fields and segment rules
- `deliverability.md`: inbox placement rules
- `quality-checklist.md`: pre-send QA checklist
- `input-schema.md`: normalized request format
- `output-schema.md`: required response structure
- `orchestration.md`: file loading order and agent routing
- `master-prompt.md`: production prompt to run the system
- `playbooks/*.md`: deep libraries for subject lines, CTAs, testing, sequencing
- `examples/*.md`: example banks by email type
- `agents/*.md`: specialized sub-agent instructions

## Suggested runtime order

1. `system.md`
2. `input-schema.md`
3. `orchestration.md`
4. Selected `agents/*.md`
5. `design-system.md`
6. `frameworks.md`
7. `components.md`
8. `tone.md`
9. `personalization.md`
10. `deliverability.md`
11. Relevant `examples/*.md`
12. `output-schema.md`
13. `quality-checklist.md`

## Quick implementation note

For your codebase, load this package only in campaign-generation routes (for example email generation endpoints). Do not load it in visual studio ad generation routes.
