# Proposed UI/UX revision

## Overall UI flow

Go to site 
    -> **Title Page**
        - Go to Desk  ->  **Full Screen Terminal**
                        -> **Main Menu** (TUI)
                            - Cold Cases Cabinet  
                                -> **Cold Cases Cabinet**
                                    - (list of cold cases) 
                                        -> **Case Detail**
                                            - Solve Case
                                            - Back
                            - Solved Cases Gallery 
                                -> **Solved Cases Gallery**
                                    - (list of solved cases) 
                                        -> **Case Detail**
                                            - Back
                            - Bulletins -> **Bulletins**
                                - (status updates and case movement notices)
                            - Options -> **Options Screen**
                            - About -> **About Screen**
        - Options -> **Options Page**
        - About -> **About Page**
        - [ ] Skip title next time

Full Screen Terminal

## UX language

Design principle:

The UI should feel like a serious investigative terminal, not a parody detective game. The noir layer gives atmosphere; the evidence layer gives trust.

### Text

1. Actions, labels, statuses, and other text use investigative, noir, and forensic debugging vocabulary. Avoid language that turns the app into a police-procedural parody.
  - **Pull Case File** - view case details
  - **Start Casework** - run the entire pipeline

2. Status messages use investigation terminology
   - **Casework Started** - case is being worked on, but no activity yet
   - **Scene Reconstructed** - Kiro has reconstructed the buggy setup
   - **Evidence Collected** - the first Lark run has completed
   - **Case Resolved** - the system has produced a candidate solution, but final validation is not yet complete
   - **Resolution Validated** - the second Lark run passed; the system believes the case is resolved and awaits user approval
   - **Case Closed** - the user reviewed and approved the system's resolution; no further action is currently needed
   - **Unproven** - the case has not passed final validation; useful evidence may exist, but closure has not been earned
   - **Cold Case** - unsolved case
   - **Lead Exhausted** - no more clues

   Note: internal implementation statuses should not leak into the UI when they break the theme. For example, internal `partial` and `blocked` states are both shown to users as **Unproven**. A reason field explains what happened: external blocker, ambiguous source case, failed reproduction, failed repair, failed verification, or user intervention needed.

   **Resolution Validated** and **Case Closed** are intentionally different. The system can validate a resolution by completing the Vet -> Vibe -> Validate workflow and producing Lark-validated evidence. Only the user can close a case, because the user may reject the proposed solution, ask for a stricter reproduction, request additional evidence, or order further action.

3. Navigation uses investigative movement language
   - **Go to Desk** - enter the investigation terminal
   - **Proceed to Scene** - move forward
   - **Investigate Further** - drill down


### Iconography

1. Buttons and actions use investigative/CSI symbolism
  - Search icon for search/lookup
  - Clipboard/FileText icon for case files
  - Footprints icon for evidence trails
  - PencilLine or Wrench icon for casework
  - Settings icon for options
  - Info icon for about

  Implementation note: use lucide icons where feasible, even in a plain frameworkless JavaScript frontend. Lucide can be used through static SVG markup, generated icon imports in a bundler, or a lightweight browser module, depending on the final frontend setup. Emoji may be used in early mock-ups, but should not be the primary production icon style.

2. Investigation results, from initial -> unproven -> validated, are progressively positively illustrated

3. Consistent directional indicators for actions and navigation


### Layout

1. Terminal-style layout with clear hierarchy
   - Header bar shows current location/investigation status
   - Main content area centered with case information
   - Footer shows available actions and navigation
   - Side panels for additional context when needed

2. Information density follows investigation priority
   - Critical case details prominently displayed
   - Supporting evidence in secondary visual hierarchy
   - Metadata and timestamps in tertiary position


### Geometry

1. Sharp, angular shapes suggest precision and investigation
   - Rectangular frames for case files and evidence
   - Corner brackets [ ] for terminal-style containers
   - Sharp borders for evidence boxes
   - Avoid rounded card-heavy UI. If a frame is needed, keep corners tight and utilitarian.

2. Grid-based alignment for organized case presentation
   - Consistent spacing between case entries
   - Aligned evidence lists for easy scanning
   - Modular sections that can expand/collapse

3. Monospace-friendly proportions for terminal aesthetic
   - Character-based spacing for text alignment
   - Fixed-width considerations for TUI elements


### Color

1. Dark case-desk terminal base with evidence-board accents
   - Background: Near-black/charcoal (#080b0a or #101210)
   - Primary text: Phosphor off-white/green-white (#e7f5e8)
   - Secondary text: Muted institutional gray-green (#8a9a8f)
   - Paper/evidence accent: aged file amber (#c2a96a)

2. Investigation status color coding
   - **Cold Case**: cold evidence blue (#4a90e2)
   - **Casework Started / active work**: paper amber (#c2a96a)
   - **Evidence Collected / Resolution Validated**: phosphor green (#6ee787)
   - **Unproven / critical evidence**: evidence red (#d64b4b)
   - **Case Closed**: confident green-white (#a6f3b6)

3. Accent colors for interactive elements
   - Action buttons: restrained phosphor green or amber, depending on action weight
   - Selected items: Highlighted with subtle background
   - Links/references: underlined with paper amber or cold blue

4. Depth is subtle and mostly physical
   - Flat colors are preferred over heavy effects
   - Very subtle scanline/glass treatment is acceptable in the terminal area
   - Avoid decorative gradient blobs, bright cyber gradients, or glossy UI panels that break the case-desk mood


## Page Details

The first thing the user sees is the title page, which succintly introduces the user to the concept of the cold cases cracker. From there, most of the interactions happen within the TUI, to give a retro feel.

### Title Page

Title (H1): "Coding Cold Cases Cracker"
Eyebrow: "Vet > Vibe > Validate"
Subtitle: "Reconstruct the failure, work the fix, prove the close."

Menu options:
- Go to Desk
- Options
- About
- [ ] Skip title next time

These are presented as retro-style buttons. The skip is a checkbox.
Hovering over the buttons puts the button within [ square brackets ]. Using arrows on the keyboard should also work.

The page elements are all centered, and the page fits in the viewport without any scrolling. Decreasing the window size keeps the elements centered and doesn't cause any overflow.

### Full Screen Terminal (Case Desk)

Selecting Go to Desk from the Title Page leads directly to the full screen terminal, a.k.a. Case Desk.

This page has very thin borders representing the bezels of a retro CRT monitor. This outer area is not scrollable. 
The bezels contain control buttons that let the user navigate with just the mouse if needed.
Inside the bezels is the embedded terminal, with vertical scrolling.

The bezel should be thin and almost not there. It is a support frame for the terminal, not a decorative game controller. Keyboard flow remains primary; mouse controls are secondary accessibility affordances.

Optional, nice-to-have: the terminal area has a gloss to it. A subtle silhouette of an investigator is faintly visible in the reflection. Its shoulders move a bit, whenever the user pushes a button. E.g. shoulder left when the user presses Esc or Back, shoulder right when the user presses Enter or Forward. 

#### Bezel Controls

Most bezel controls will just be square buttons with icons. No labels, but with tooltips.

- 🔙 : exit the terminal (back to title screen) -- upper left corner
- ℹ️ : go to About page -- upper right corner
- Lower left edge button set (in this order and layout):
  - [⏎] [⬆️] [⬇️] [🔙]
  - (Enter, Up, Down, Back)
  - Enter: confirms current selection, drills down
  - Up/Down: navigates through options
  - Back: goes back to previous screen
- Lower right edge button set:
  - Zoom +/-, Margin +/-, Fullscreen

#### Terminal view

Simply titled "Case Desk" at the top. No decorated heading. Only horizontal lines delineating menu areas.

Provides the following options:
- Cold Cases
- Solved Cases
- Bulletins
- Options
- About

 \> A pointer (\>) is used to indicate the currently selected option.

 The bottom shows the keyboard controls: Enter, Up, Down, Back

Mock-up:

 ```
Case Desk
---------

> Cold Cases
  Solved Cases
  Bulletins
  Options
  About

---------
Actions: Enter=confirm selection, Up=select previous, Down=select next, Esc=go back
 ```


**Cold Cases Cabinet**

Selecting "Cold Cases" from the Case Desk leads to the Cold Cases Cabinet. Same vibe and principles as the case desk.

The Cold Cases Cabinet is the active case inventory. It contains cases in every status except **Case Closed**:
- **Cold Case**
- **Casework Started**
- **Scene Reconstructed**
- **Evidence Collected**
- **Case Resolved**
- **Resolution Validated**
- **Unproven**

When the user approves a validated resolution and marks the case **Case Closed**, the case leaves the Cold Cases Cabinet and moves to the Solved Cases Gallery.

Each case item shows:
- Case title
- Answer count
- Top score
- Lowest score
- Total
- Tags
(no longer shown in the mock-up, but assume they're there)

Mock-up:

```
Cold Cases Cabinet
------------------

Search: (none) | Filter: (none) | Showing 18 of 148 cases

> 1. Case 1 
  2. Case 2
  3. Case 3
  4. Case 4
  5. Case 5

------------------
Actions: Enter=pull case file, Up=select previous, Down=select next, Number=jump to case, /=Search, F=Filter, Esc=go back
```

There is no `prompt>` yet so far in these menu-driven screens. But once the user selects Search (/), a `prompt>` will appear at the bottom of the screen, and the user can type their search query.

```
Search title/tag/signal> ▌
```

The Filter by status shows a list of statuses to filter by, and immediately returns to the cold cases list upon selection or cancellation.

Status filters do not change the default sorting. They only narrow the visible list. When no filter is active, the Cold Cases Cabinet uses normal sorting across every non-closed case.

Filter options:
- All active cases
- Cold Case
- Casework Started
- Scene Reconstructed
- Evidence Collected
- Case Resolved
- Resolution Validated
- Unproven

Filter selection mock-up:

```
Filter Case Status
------------------

> All active cases
  Cold Case
  Casework Started
  Scene Reconstructed
  Evidence Collected
  Case Resolved
  Resolution Validated
  Unproven

------------------
Actions: Enter=apply filter, Up=select previous, Down=select next, Esc=cancel
```

When a filter is active, the list header names it explicitly:

```
Search: lifecycle | Filter: Unproven | Showing 3 of 148 cases
```

**Case File View**

The details of the selected case file are displayed, with further actions that can be done-- mainly to start the investigation and resolution. These are case files that have not yet been solved, so only the problem details will be present; no solution will be included (because technically, that would be impossible at this point). If a case already has a solution, it should not have been selectable from the case file cabinet -- no case file view will be available.

While the narrative report comes later, the Case File View should still feel like opening a real case file. Use a short narrative teaser, not a solved-case story. The teaser may use original Stack Overflow metadata, title, OP handle when available, tags, age, score, and excerpt, but it must not imply facts that have not yet been reconstructed or validated.

Narrative teasers appear only after opening a case dossier. The Cold Cases Cabinet list stays dense and operational; it should not show teaser prose in each row.


Mock-up:

```
Case File #1: Six Arguments Into Five

Mike Nakis had a rule about internal packages: never touch them. The `internal` in
`org.hibernate.jpa.internal` was not decoration. It was a warning label, the kind that
belongs on electrical panels and unmarked drums. He had read it, understood it, and ignored it
anyway — because in 2013, when `Ejb3Configuration` was deprecated and then quietly deleted in
4.3, there was simply no other door.

Status: Cold

=== Origin ===

JPA with Hibernate 5: programmatically create EntityManagerFactory

How can I parse an inbound message with MTOM attachments under Metro without pulling in all the attachment data?

https://stackoverflow.com/questions/10700340/how-can-i-parse-an-inbound-message-with-mtom-attachments-under-metro-without-pul

Posted 2012-05-22 | Score 6 | Views 4908 | Answers 0
Signal: No answers
Tags: java, jax-ws, mtom, xop

Excerpt: Using JAX-WS-RI or Metro I can write a WebService using the com. I can choose to get the whole message including the SOAP headers [code block] I can then write something which parses the message and processes accordingly [code block] However part of the...

------

Actions: S=Start Casework, C=Confer with agent, B=Check case bulletin, Esc=Back

```

Available actions change depending on the case status:
- Permanent actions: C=Confer with agent, B=Check case bulletin, Esc=Back
- Changing actions:
  - Cold: S=Start Casework
  - Casework started or ongoing: M=Monitor Casework
  - Evidence collected: E=Examine evidence
  - Resolved: D=Download fix
  - Resolution Validated: A=Approve, E=Examine, D=Download, C=Confer
  - Closed: (none)

Start Casework runs the full Vet -> Vibe -> Validate flow. After casework has started, `S=Start Casework` changes to `M=Monitor Casework`.

Confer with agent is always available from a Case File. Before casework starts, it supports pre-briefing, brainstorming, risk review, and possible reproduction strategy. After casework starts, it can discuss the active run, evidence, artifacts, and next investigative moves.

Monitor Casework is read-only. It shows the live timeline, phase status, logs, artifacts, and current verdict state, but it does not let the user steer or modify the run.

Confer with agent launches a Kiro terminal session rather than an in-app chat panel. Before casework starts, this is a pre-briefing session grounded in the selected case metadata and source text; it must not start the Vet -> Vibe -> Validate pipeline or imply that evidence has been collected. After casework starts, the Kiro session is grounded in the active run workspace and artifacts, but remains read-only while the run is actively proceeding.

Intervention is allowed only when a specific step pauses for user input, or when the entire run finishes. Until then, ongoing casework remains protected from mid-stream steering.

When a case reaches **Resolution Validated**, the action footer becomes focused on final review:

```
Actions: A=Approve, E=Examine, D=Download, C=Confer, Esc=Back
```

- **Approve** marks the case **Case Closed**, moves it from the Cold Cases Cabinet to the Solved Cases Gallery, and creates a bulletin.
- **Examine** opens the evidence view: Lark verdict, reproduction and verification logs, replay commands, artifact links, and evidence map.
- **Download** creates or opens the case archive.
- **Confer** launches a Kiro session grounded in the completed run; because the run has finished, the user can ask questions, challenge assumptions, or plan further action.

**Solved Cases Gallery**

The Solved Cases Gallery contains only truly closed cases: cases whose validated resolution has been approved by the user. A case that is merely **Resolution Validated** does not appear here yet, because the user may still object to the solution, request a stricter reproduction, ask for more evidence, or order further action.

When a case moves from **Resolution Validated** to **Case Closed**, it is removed from the Cold Cases Cabinet and added to the Solved Cases Gallery.

**Bulletins**

Bulletins are the status update inbox for the Case Desk. They explain important case movement and investigation events, especially transitions that would otherwise feel invisible:

- A case was prepared.
- Casework started.
- A scene was reconstructed.
- Evidence was collected.
- A candidate solution was produced.
- A resolution was validated.
- A case became **Unproven**, with the reason.
- A user closed a case.
- A closed case was reopened for further action.

Bulletins should use concise investigative language and link back to the relevant Case File.
