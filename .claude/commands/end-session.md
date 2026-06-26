Wrap up the current session: update HANDOFF_Latest, refresh stale memory files, and commit everything.

## Step 1 — Read current state
Read these files before making any changes:
- `docs/HANDOFF_Latest.md`
- `.claude/memory/MEMORY.md`

## Step 2 — Update HANDOFF_Latest.md
1. Bump the session number and set Last Updated to today's date
2. Replace "COMPLETED THIS SESSION" with a concise bullet list of what was actually built or changed this session (infer from the conversation — do not ask Ron to repeat it)
3. Remove any PENDING items that shipped this session
4. Add any new pending items or bugs discovered this session
5. Keep under 120 lines

## Step 3 — Update memory files
Identify which memory files in `.claude/memory/` are stale based on what shipped. Common ones to check:
- `project_key_files.md` — if new views, stores, or routes were added
- `project_firestore_schema.md` — if new collections were added
- `project_nav_structure.md` — if nav items changed
- `project_org_provisioning.md` — if org flow changed
- `feedback_visual_style.md` — if UI patterns were approved
- `project_design_tokens.md` — if colors, fonts, or spacing changed
- `feedback_commit_grouping.md` — if commit strategy was adjusted

Update the Q2 status table in MEMORY.md if any tasks completed or changed.

If Ron mentioned something to do next session, write a `project_*.md` memory file for it and add a "## Next Session" entry to MEMORY.md index so it loads at session start.

Update only files that are actually stale. Update the one-line hook in MEMORY.md index if the description changed.

## Step 4 — Commit and push
Stage all changes in `.claude/memory/` and `docs/` and commit with a brief end-of-session message. Push to origin.

## Step 5 — Back up global memory to ron-notes
After pushing the project repo, back up the global memory folder to GitHub:
```powershell
cd "C:\Users\rsilv\.claude\projects\C--Projects\memory"
git add -A
git commit -m "Session backup $(Get-Date -Format 'yyyy-MM-dd')"
git push
```
If nothing changed, `git commit` will fail with "nothing to commit" — that's fine, skip it.

## Rules
- Never ask Ron to summarize what was done — infer it from the conversation history
- Do not modify CLAUDE.md or any source files
- Do not create new memory files unless something genuinely new was learned; update existing ones instead
