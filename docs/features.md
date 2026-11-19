# Block Builder features in detail

What the page does, rule by rule. The [README](../README.md) has the one-line version of each feature; this page has the numbers and the edge cases. Keep both in step with `index.html` and `engine.js`.

- [Building the plan](#building-the-plan)
- [Checks and warnings](#checks-and-warnings)
- [The plan screen](#the-plan-screen)
- [Today card](#today-card)
- [Quick workout](#quick-workout)
- [Exports](#exports)
- [Settings and display](#settings-and-display)

## Building the plan

- **Goals:** train for a race (5K, 10K, half marathon, marathon, or a custom distance) or build a personal plan over a set number of weeks.
- **Settings sections:** Goal, Race (Focus and dates for a personal plan), Your running now, Week shape and Run types, on every screen size.
- **New plan:** starts empty, distance, race date and weeks included. The plan builds once distance, race date (race goal), weeks of training, weekly volume, longest run and runs per week are filled in; until then the plan side lists what is missing. Only Easy run is switched on until you add more types.
- **New plan on a phone (under 900 px):** 4 steps, one at a time: Goal (three cards: Train for a race, Personal plan, Quick workout, which opens the quick workout and makes no plan), Race or Focus and dates, Your running now, Your week (week shape and run types). Next checks that step's required fields and says what is missing; from step 3 the load profile previews the plan once it can be built. Build my plan on step 4 opens the plan. Back goes a step back; Show all settings leaves the steps for the full form. Desktop shows the full form.
- **Dialogs on a phone (under 640 px):** the run editor, Quick workout, My plans and confirmations open as bottom sheets: full width, on the bottom edge, with a grab bar and larger buttons. They slide up, or just appear with Reduce Motion on. Escape, a tap outside or Cancel closes them; focus stays inside while open and goes back to what opened them.
- **Runs per week:** 1 to 7.
- **Experience level:** New to running, Regular (the default, and what plans saved before 1.2.0 use) or Experienced, under "Your running now".
  - New to running: no hard runs in the base phase (strides only, if switched on), then at most 1 hard run a week; a cutback week every 3rd week; shorter minimum runs (easy 3 km, recovery 2.5 km, hard 4 km instead of 4, 3 and 5).
  - Regular: up to 2 hard runs a week from 5 runs a week; a cutback week every 4th week.
  - Experienced: up to 2 hard runs a week from 4 runs a week, but only when the running days leave a day's gap around both hard runs and the long run (otherwise 1); a cutback week every 4th week.
- **Phases:** base, build, peak and taper, with cutback weeks (every 4th week, every 3rd for new runners; none before the last base-to-taper week or in plans of fewer than 5 weeks before the taper). Taper long runs step down from the longest run the plan actually reached (75%, then 60%).
- **Recovery after the race:** for a race plan, None (default), 1 week or 2 weeks of easy running after race day, shown as a "recovery" phase. Week 1 has 2 runs fewer (at least 2, or your runs per week if fewer) at about 40% of the biggest week (30% after a marathon), the first one a recovery run if that type is on; week 2 has 1 run fewer at about 60% (50%), with strides if that type is on and the run on your long-run day a bit longer. No run in the two days after the race; runs are spread as far apart as your days allow, 3 to 10 km (14 km in week 2). Weeks of training, the start date, weeks to go and the race flag are unchanged; the +10% and goal-readiness checks skip these weeks. Not offered for a personal plan.
- **Weekly increase:** week 1 stays within the weekly volume you run now, and each full week after stays within +10% of the last full week before it. After rounding, easy runs are shortened first, then the hard runs, then the long run.
- **Long run limits:** the long run is kept to about 40% of the week (45% at 3 runs a week, 50% at 2), to 2:30 for a half marathon and 3:00 for a marathon at your easy pace, and grows by at most 2 km or 15 minutes (whichever is more) on the last full week's long run, starting from your current longest run. The km it gives up go to the easy runs.
- **Paces:** worked out from a recent race result (easy, tempo, intervals, race pace). The finish time is read to fit the race: "1:45" for a half means 1 h 45 min, a lone "52" for a 10K means 52 minutes, and the field shows the reading (1:45:00). A time that fits no reading for that race is flagged instead of being ignored.
- **Run types:** easy, recovery, long, tempo, intervals, hill repeats, fartlek, progression and race pace, shown as chips grouped Easy and Quality: tap one to switch it on or off (Easy run is always on). You can switch off the long run (that day becomes an easy run). Under "Customise workouts" you can rename types, add custom ones, and edit their description templates and the phases they're used in.
- **Why this run:** each built-in type has one line on what it is for and how it should feel, as effort out of 10 and a talk test (easy 3-4, long run 4-5, recovery 2-3, tempo about 7, intervals 8-9, hills about 8, fartlek 7-8, progression 3-4 to 7, race pace 7-9 by distance). It shows in the run editor under the type (and follows it when you change the type), in the Quick workout sheet under the type, and in the PDF as a "Run types in this plan" table listing the types the plan uses. Custom types and race day have none.

## Checks and warnings

- **Goal readiness:** for a half or a full marathon, the plan warns when it peaks too low for the race (longest run under about 60% of a half or 75% of a marathon, or biggest week under about 30 or 45 km) and suggests more weeks or the Personal plan goal.
- **Week 1 above your volume:** when even the shortest runs add up to more than the weekly volume you entered (many runs at a low volume), the plan says how much week 1 comes to and suggests fewer runs, or the New to running level and its shorter runs. A hand edit that does it is flagged too.
- **Weeks that still jump:** if every run is already at its minimum distance (low volume with many runs), the plan says which weeks still go over +10% and suggests fewer runs. A hand edit that makes a week jump is flagged too.
- **Hard runs per week:** a week with more hard runs than its runs per week allow (new runners: 1; regular: 1 at 4 runs or fewer, 2 above; experienced: 1 at 3 runs or fewer, 2 above), whether built that way or edited, gets a warning line right under it and a line in the warnings above the plan.
- **Spacing:** the same goes for a hard run on the day next to another hard run, the long run or race day (Sunday into Monday counts), and for a week with runs on all 7 days.
- **Running days:** picking 3 or more days in a row at 4 runs a week or fewer, days that leave every run next to the long run, or 7 runs a week gives one warning about the days chosen, not one per week.

## The plan screen

- **Summary:** above the plan, weeks to go (counting the current week, up to race day), peak week and longest run in km, and the target time for the race worked out from your recent race (for example 1h55; hover for the exact time). Plan totals are in the PDF.
- **Load profile:** a bar per week (cutback weeks paler, the long run as a line), drawn over shaded phase bands labelled base, build, peak and taper. The current week's number is in bold with a dashed line on today, and the race week carries a flag.
- **Editing:** edit, move (drag and drop), add or delete any run, with a personal note per run. Edited weeks go through the same checks as generated ones.
- **Effort colours:** each run's colour bar shows how hard it is, cool to hot: recovery, easy, long run, steady quality (tempo, progression, race pace, fartlek), hard quality (intervals, hills, custom quality types), race day. Same colours on the chips, the plan, the Today card and the PDF.
- **Race countdown:** optional, with the race name, city and a link to its page (Finishers search built in).

## Today card

Above the load profile, a card leads with today's run: its name, the distance in large type and an estimated time, a bar that draws the workout step by step (warm-up, each rep and recovery, cool-down; width is time, colour is effort), and the target paces it uses (from your recent race, or effort words without one).

- **Send to watch** is the main button and names the device you last used; Edit sits next to it.
- On a rest day it shows the next run and its date; before the plan starts, the start date and first run.
- **Weather:** one line (temperature, sky, rain chance, driest slot, city) that opens the full forecast: current conditions and feels-like temperature, high and low, rain chance, wind, sunset, and an hourly strip to 22:00 that marks the driest slot left in the day. Type a city or use your location; the city and whether the forecast is open are remembered in your browser.
- **Heat note:** on hot days (feels-like 22° or more at the driest slot) a note slows easy and tempo paces by 10 s/km (20 s/km from 28°) and says to run hard parts by effort. The watch file keeps the plan paces.

## Quick workout

Build one workout from the run types and send it to a watch without changing the plan.

- **Where:** the plan toolbar, the "Run anyway?" link on a rest day, "Just want one session? Quick workout" under Goal in the settings (it opens the sheet and leaves the plan's goal as it is), and a new, empty plan.
- **Building it:** pick a type; measure by distance or time (remembered). For easy runs set the distance or duration; for quality sessions pick Short / Medium / Long and the target race (5K to marathon), with warm-up and cool-down on or off.
- **Preview:** the distance, estimated time, the workout bar and every step, then Send to Apple Watch, Garmin or another device.
- **Fine-tune:** changes the reps (down to 1), rep length and recovery, and takes a target pace you type (min:sec per km) that the watch alerts around, with or without a race time. Reset undoes it. Jog recoveries stay in time in both units.
- **Paces:** from your plan's recent race. Without one, enter a recent race in the sheet (kept for quick workouts only, never written into the plan) or go by effort.
- **Recent:** the last 5 workouts sent come back as chips.
- **Also add it to …:** with a plan open (off by default), puts the workout on a chosen day of the plan as well, where it counts in the weekly checks like any added run.

## Exports

- **Watch:** Apple Watch (`.workout`, through WorkoutKit), Garmin and other devices (`.fit`), per run, per week or for the whole plan, in one zip. Files are named by week, day and run (`w01-mon-easy-run.fit`); two runs with the same name on one day get `-2`, `-3` instead of overwriting each other.
- **Calendar:** `.ics`.
- **Plan file:** a format dropdown for spreadsheet (`.csv`) or printable PDF (A4 landscape week-by-day grid with phases, weekly km, run descriptions and plan totals). The dropdown remembers the last format picked.
- **All plans:** My plans → Export / Import, see [Privacy and storage](../README.md#privacy-and-storage).
- **Importing a plan you already have** (same plan, for example exported from another device): a newer copy in the file replaces yours; the same version is skipped; if yours was changed more recently, yours is kept and the file's version is added beside it as "(imported)". The toast says which happened. If the plan you have open is replaced, it reloads.

## Settings and display

- **Languages:** English and French (the browser language by default), changed from the gear menu at the end of the header.
- **Themes:** dark "night track" by default, with a light theme or Auto (follows the device) in the gear menu; the choice is remembered on the device. The volt accent marks only today's run and the main button. Cards are told apart by their surface rather than outlines; only the Today card is framed and lifted.
- **Phone layout:** once the plan is complete, the page is the plan (Today card first) with an Edit plan button pinned at the top. It opens the settings as a sheet over the plan: Goal, Race, Your running now, Week shape and Run types as one scrolling form, with the plan behind it rebuilding as you change things. Done, Escape or a tap outside closes it, focus stays inside while it is open, and the header waits until it closes (save from there). While a new plan's steps are running or the setup is incomplete, Plan and Settings tabs switch between the two. Under 760 px wide the plan is a list of week cards, one row per day (rest days included, tap to add a run), instead of the wide grid; drag and drop stays on the desktop grid. Weeks before the current one fold behind "Show N earlier weeks", so the current week (outlined) is the first card; shown again, they are dimmed. A finished plan shows every week.
- **Keyboard and screen readers:** messages such as "Plan saved" are announced, dialogs are named by their title, Tab stays inside an open dialog, and closing it returns to the button or run that opened it.
