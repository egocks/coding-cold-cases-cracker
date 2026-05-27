# UI Flow Open Questions

These are open product and interaction questions for the UI/UX revamp. They are phrased as decisions to make, not critiques.

1. Should `E=Examine` open a compact Evidence Board first, with raw logs available on demand, or should raw Lark output be prominent by default?

2. What exact sections should the Evidence Board contain for **Resolution Validated** cases?

3. Should the Evidence Board for **Unproven** cases use the same layout as validated cases, or a more diagnostic layout focused on why validation failed?

4. Should **Download** appear only after artifacts exist, or should it always appear and create a partial archive when the case is not complete?

5. Should **Approve** ask for confirmation before marking a case **Case Closed**, or should it close immediately and allow reopening from Bulletins or the Gallery?

6. Should approving closure allow the user to add a short closure note?

7. If a user wants further work after **Resolution Validated**, should that happen through **Confer**, or should there be a dedicated action after the Kiro session proposes the next step?

8. When a run pauses for user input, what should the paused status be called in the UI?

9. What actions should appear when a run is paused: `Resume`, `Confer`, `Edit Direction`, `Cancel`, or something else?

10. Should paused casework appear as its own status filter in the Cold Cases Cabinet, or remain under **Casework Started** or **Unproven** with a reason?

11. What is the exact mapping from internal pipeline phases to public statuses?

12. Should **Unproven** cases always remain in the Cold Cases Cabinet until the user approves closure, even if the system can no longer proceed?

13. What fields should each Cold Cases Cabinet row show now that the real count is 150?

14. Should the Cold Cases Cabinet row include latest run status when a case has active or previous casework?

15. Should the Cold Cases Cabinet support sorting later, or should v1 keep sorting fixed and rely only on search plus status filters?

16. Should Bulletins be a global inbox only, or should each Case File also have a case-specific bulletin view?

17. Should Bulletins have read/unread state and dismissal, or remain a permanent chronological log?

18. What should the Solved Cases Gallery detail view prioritize first: narrative case file, Lark verdict, replay commands, or artifact links?

19. Should the Title Page’s Options and the TUI Options screen control the same settings, or should the title page only expose visual/browser shell settings?

20. Should the optional reflected investigator silhouette remain a nice-to-have, or should it become part of the first implemented visual identity?
