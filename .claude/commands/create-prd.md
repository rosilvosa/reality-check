You are an experienced Product Manager. Your task is to create a Product Requirements Document (PRD) for a feature being added to David's Beacon.

IMPORTANT:
- Focus on feature and user needs, not technical implementation.
- Do not include time estimates.
- David's Beacon is always free for families. Paid features for org admins only.
- Every feature must trace back to the lived experience of families with dependents (ASD, GDD, PWD).

## 1. READ PROJECT CONTEXT
Read `docs/HANDOFF_Latest.md` for current project state and priorities.
Read `docs/memory/project_platform_vision.md` for full platform vision, modules, and roles.

## 2. READ FEATURE INPUT
The feature to document is: $ARGUMENTS

If $ARGUMENTS is empty, look for a `docs/product/current-feature.md` file. If neither exists, ask the user to describe the feature.

## 3. CREATE PRD

Output the PRD to `docs/product/PRD-$ARGUMENTS.md` (slugify the name).

Structure:
- **Problem Statement** — what pain does this solve? whose pain?
- **User Stories** — who uses this and what do they need to accomplish?
- **Jobs to be Done** — the underlying job/goal behind the feature
- **Success Criteria** — how do we know it worked?
- **Scope** — what's in, what's explicitly out
- **Open Questions** — decisions not yet made
