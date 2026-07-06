# MADSuite AI OS Loop

For every feature request:

1. Planner → create plan
2. Revenue → validate business value
   - if score < 4 → reduce scope or reject
3. Builder → implement MVP
4. Reviewer → validate correctness
5. Security → validate isolation
   - if fail → return to Builder
6. Orchestrator → finalize PR

---

# RULE

- No step can be skipped
- If conflict → Security wins
- If overengineering → Builder must simplify
