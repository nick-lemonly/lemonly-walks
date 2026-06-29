# Walking Challenge Dashboard

The following are specifications, details, and preferences for an interactive dashboard I want to build for Lemonly's
upcoming walking challenge, happening in July 2026. The premise of the challenge is that we're going to "Walk to
Vancouver" — because our teammate, Dafne, lives in Vancouver, BC.

It'll be a month-long challenge where Lemonheads log their daily steps, and we'll add up the running total to see if we
can walk the equivalent distance from Lemonly HQ in Sioux Falls to Vancouver, BC.

I want to build an interactive dashboard to facilitate the step entry and tracking, with a visual way for teammates to
track our progress.

## Distance & Route

Starting point: Lemonly HQ at 217 N Nesmith Ave, Sioux Falls, SD 57103. Ending point: Vancouver, British Columbia

- Distance in miles: 1612 miles
- Distance in kilometers: 2595 kilometers
- Number of steps: 3,224,000 steps (assumes 2,000 steps per mile)
- Route: Take I-90 west from Sioux Falls to Seattle, then I-5 north across the Canadian border to Vancouver.

## Dashboard

### Goals

- Team members can track their daily steps every day for the month of July 2026.
- We can track progress with a visual(s) showing our cumulative steps and distance covered.
- Build a dashboard that's cooler and more fun for tracking the challenge than a spreadsheet.

### Design

- Use Lemonly's brand stylings as provided in the `Lemonly Brand Styles.md` file. Light gray page background, white
  containers for the various interface elements. I'm picturing a dashboard or Bento box type of look.

Some design specifics:

- Logo: Put the Lemonly logo (lemonly-logo.svg) in the upper-left corner next to the dashboard title
- Dashboard title: "2026 Walking Challenge"
- Subtitle: "Walk to Vancouver"
- Calendar: Show a monthly calendar view of July 2026 where users can click between days or weeks to see the total
  number of steps and total distance covered in a given day or week, aggregated first, with the option to expand the
  view to see it broken out by team member. Load the monthly view by default and allow the user to click into the weekly
  or daily views. When the user chooses the daily or weekly view, update the Leaderboard to show the steps per user
  during the selected timeframe.
- Map: Show a map with the route from Lemonly HQ to Vancouver traced in a line. Fill in the line to trace the route as
  we traverse the distance, giving a visual of how far we are along the route. Make the map a simplified 2D schematic
  following the route noted above, with state borders and city markers for major cities along the route like Sioux
  Falls, Rapid City, Billings, Spokane, Seattle, Vancouver, etc.
- Thermometer: Along with the map, use a "thermometer" visual to show how far we are along in our goal, measured by
  total steps and the total distance covered in both miles and kilometers out of the total steps/distance needed. Along
  with the total cumulative number of steps, include counters showing the average number of steps per day and the
  average number of steps per person per day.
- Leaderboard: Show a leaderboard ranking all team members by total steps accumulated so far.
- Team photos: Show photos of each team member next to their name in the leaderboard. Photos for all team members are
  provided in the /team-headshots/ folder within the app directory. Photos are named first-last.jpg corresponding with
  the list of team members below.

#### Accessibility

Everything should meet WCAG Level AA guidelines for accessibility.

#### Mobile Responsiveness

The app should be reasonably usable on mobile, but desktop is the primary experience.

### Functionality & User Experience

- Users should be able to click any day on the calendar (for July 2026) to enter their steps for that day, edit a
  previous entry, or delete their entry from that day. (It's okay if all users can edit all other users' entries — in
  fact, that could be helpful for us event organizers to be able to manage the data if needed.)
- Store user data across sessions and update live as users enter data (including if multiple users are entering their
  data at the same time).

## Resources

### List of Users

The following are all the Lemonheads (team members) who will be participating in the walking challenge. Each of these
team members has a headshot in the team-headshots folder for use in the leaderboard.

Amy Moore Ashton Dockendorf Brett Hanes Dafne Sagastume Michael Mazourek Maddie Mack Emily Petoske Carly Schultz Nick
Lorang Chris Prendergast Ty MacConnell Jade Delaney Emily Larson Nicholas Schnell Kaley Schweitzer Rachel Meyer Hayleigh
Elkins Ella Olsen Cortney Carmody Tessa Sánchez Alex Munce Deirdre Nuebel Carly Vavra Natalie Eisenberg Greta Feist
Madisyn Stogsdill Reagan Monson Quinn Tisdale

## Technical Implementation

### Architecture

This is a static frontend app with Firebase as the backend. There is no server-side code. The app itself (HTML, CSS,
JavaScript) is hosted as a static site. All user data is stored in and retrieved from Firebase Firestore. The Firebase
SDK runs entirely in the browser.

### Hosting

The app will be hosted at nick-lemonly.github.io/walking-challenge-dashboard. No Firebase CLI required. The Firebase SDK
is loaded via npm or CDN script tag and runs in the browser.

I have a custom domain (lemonlywalks.com) that will be configured at the registrar level and does not affect the app's
code.

### Firebase Setup

The Firebase project has been created at console.firebase.google.com under a personal Google account. Use the following
Firebase config object to initialize the SDK in the app:

const firebaseConfig = { apiKey: "AIzaSyCwoL-6WhuSLkWIPld3xPpqRr26hmfZp70", authDomain:
"lemonly-walking-challenge.firebaseapp.com", projectId: "lemonly-walking-challenge", storageBucket:
"lemonly-walking-challenge.firebasestorage.app", messagingSenderId: "888431680562", appId:
"1:888431680562:web:2a10f6b76614e153ad702b", measurementId: "G-HSBTSNXBVX" };

Initialize Firebase and Firestore at the top of the app's main JavaScript file using this config.

### Data Storage (Firestore)

All step data is stored in Firebase Firestore. Do not use localStorage, sessionStorage, or any other client-side storage
for step data — Firestore is the single source of truth.

#### Collection Structure

The app uses a single Firestore collection called steps. Each document in this collection represents one step entry for
one team member on one day.

Collection: "steps" Document ID: auto-generated userName: string // Full name, e.g. "Nick Lorang" date: string // ISO
format: "2026-07-14" steps: number // Integer, e.g. 8432 submittedAt: timestamp // Firestore server timestamp

One document per person per day. If a user edits an existing entry, update the existing document rather than creating a
new one. If a user deletes an entry, delete the document.

### Real-Time Data Sync

Use Firestore's onSnapshot() listener (not getDocs()) to subscribe to the steps collection. The dashboard should update
automatically whenever data changes in Firestore — no page refresh required. This ensures that if multiple team members
are entering data simultaneously, all open dashboards reflect the latest state.

Unsubscribe from the listener appropriately when it is no longer needed.

### Data Entry UX

- Users select their name from a dropdown (populated from the static user list provided in this document) when logging
  steps.
- A save/submit button explicitly commits the entry to Firestore. Do not auto-save on input change.
- All users can edit or delete any other user's entries. No edit restrictions are needed.
- When a user clicks a day on the calendar, display all entries for that day. Show an edit button and a delete button
  next to each entry.

### Security Rules

Allow anyone to read the steps collection. Require authentication to write. Pair with Firebase Authentication (see
below).

Security rules are deployed manually in the Firebase console (Firestore → Rules tab), not via the Firebase CLI. The
following rules should be applied before launch:

rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /steps/{document} { allow
read: if true; allow write: if request.auth != null; } } }

### Authentication

Enable Google Sign-In via Firebase Authentication. The dashboard is publicly viewable without signing in. To enter or
edit step data, users must sign in with a Google account. After sign-in, check that the authenticated user's email ends
in @lemonly.com — if it does not, show an error and sign them out. Users who are not signed in can view the dashboard
but all edit/entry controls should be disabled or hidden.
