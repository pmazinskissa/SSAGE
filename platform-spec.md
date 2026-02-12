# Consulting Training Platform — Product Specification & Requirements

## Document Sections

1. [Product Requirements Document](#1-product-requirements-document)
2. [Information Architecture & Content Model](#2-information-architecture--content-model)
3. [Functional Specification](#3-functional-specification)
4. [Technical Architecture](#4-technical-architecture)
5. [UI/UX Specification](#5-uiux-specification)
6. [User Stories & Acceptance Criteria](#6-user-stories--acceptance-criteria)
7. [Phased Delivery Plan](#7-phased-delivery-plan)
8. [Appendix: Future Enhancements](#8-appendix-future-enhancements)

---

# 1. Product Requirements Document

## 1.1 Purpose

A **white-label training and learning platform** that consulting teams deploy to clients for guided, self-paced education on any topic — AI-enabled problem solving, Lean Six Sigma, data literacy, process improvement, or any structured methodology.

The platform replaces static delivery formats (PowerPoint decks, PDFs, instructor-only workshops) with an interactive web-based experience that improves learner engagement and retention, gives client leadership visibility into adoption, and gives the consulting team a scalable, rebrandable product asset that can be stood up for any engagement without rebuilding.

This is a **content delivery and learning platform**. Every feature must serve one of three goals: helping learners learn, helping admins verify adoption, or helping consultants deploy efficiently.

## 1.2 Users

### Learner (Primary User)
A working professional at the client organization, typically non-technical, who has been assigned this training by their management. They may have no prior familiarity with the subject matter. They will access the platform from a desktop at work, occasionally from a tablet, and rarely from a phone. Their time is limited and their motivation is extrinsic — the platform must be engaging enough to hold attention and clear enough to build genuine competency without requiring an instructor.

### Client Administrator
A manager or program lead at the client organization responsible for the training initiative. They need to verify that employees are completing the training, identify who is falling behind, and report adoption metrics to leadership. They also configure platform settings such as AI features and branding. They do not care about the technology — they want simple answers to simple questions about participation and completion.

### Consulting Team (Platform Owner)
The team that creates course content, configures deployments, and hands the platform to clients. They need to rebrand the platform for each client, update or create course content without code changes, and deploy new instances quickly. The platform is a reusable asset across engagements — the faster they can stand up a new branded instance with new or adapted content, the more leverage they get from the investment.

## 1.3 Success Criteria

| Criteria | Measure | Target |
|----------|---------|--------|
| Learner completion rate | % of enrolled users who complete all modules | > 70% within 60 days of enrollment |
| Learner engagement | Average time per lesson vs. estimated reading time | Within 0.7x–2.0x of estimated time (not skimming, not stuck) |
| Knowledge retention | Average knowledge check scores | > 75% average across all learners |
| Admin time to answer | Time for admin to determine "who has / hasn't completed training" | < 60 seconds from login |
| Deployment speed | Time to rebrand and deploy a new client instance with existing content | < 4 hours |
| Content update speed | Time for a non-developer to edit lesson text and see it reflected | < 30 minutes including rebuild |
| New course creation | Time to add a new course using the established content structure | < 2 days for content authoring (platform work is zero) |

## 1.4 Scope

### In Scope
- Self-paced course delivery with text, images, diagrams, video, and downloadable resources.
- Interactive learning elements: knowledge checks, reflection prompts, scenario decision points, and hands-on exercises.
- OAuth-based single sign-on (Microsoft Entra ID, Google Workspace, generic OIDC).
- Automatic user provisioning on first login, with optional pre-enrollment.
- Session persistence and progress bookmarking.
- Progress tracking for learners, reporting and data export for admins.
- Admin area for user management, platform settings, adoption metrics, and content feedback.
- Contextual AI learning assistant and AI-powered interactive exercises (optional per deployment, configurable by client admin).
- Client branding and theming via configuration.
- Course content stored in editable MDX flat files, separate from application code.
- Containerized deployment (Docker Compose with application and PostgreSQL containers).
- Content search within courses.

### Out of Scope
- LMS integration (SCORM, xAPI, or direct API integration with third-party LMS platforms). CSV export of tracking data is the bridge.
- In-app content authoring or WYSIWYG editor. Content is authored in MDX files externally.
- Real-time collaboration, discussion forums, or social learning features.
- Payment, subscription, or licensing management.
- Native mobile applications. The platform is web-based and responsive.
- Proctored assessments, formal grading, or credentialing/certification.
- Multi-language / internationalization (future enhancement).
- SAML-based SSO (future enhancement; OAuth/OIDC covers the initial provider set).

---

# 2. Information Architecture & Content Model

## 2.1 Content Hierarchy

```
Platform Instance (branded for a specific client)
└── Course Catalog (auto-hidden when only one course exists)
    └── Course
        ├── Course Overview
        │   ├── Description & estimated duration
        │   ├── Learning objectives
        │   ├── Audience & prerequisites
        │   └── Narrative synopsis (if applicable)
        ├── Module 1
        │   ├── Module overview & learning objectives
        │   ├── Lesson 1.1
        │   ├── Lesson 1.2
        │   ├── ...
        │   └── Module Knowledge Check
        ├── Module 2
        │   └── ...
        ├── ...
        ├── Course Glossary
        └── Course Completion Summary
```

## 2.2 Content Definitions

### Course
A complete training program on one topic. Contains an ordered set of modules, a glossary, and metadata (title, description, estimated total duration, audience description, optional prerequisites). A course may be structured around a running narrative example that carries through all modules, or it may be structured as a reference-based progression of concepts. The platform supports both approaches — this is a content decision, not a platform constraint.

### Module
A thematic unit covering one major phase or concept within a course. Each module has stated learning objectives visible to the learner before entry. Each module ends with a knowledge check. Modules are completed sequentially by default, though the platform supports both linear and non-linear navigation (configurable per course).

### Lesson
The atomic unit of content. A single coherent topic, rendered as a scrollable page. Length is driven by the content — there is no fixed template or page size. A lesson may contain any combination of:
- Prose text (with inline glossary term references)
- Headings and subheadings
- Images and diagrams (including animated SVG diagrams)
- Embedded video (hosted externally, embedded via iframe or player component)
- Downloadable resources (PDFs, templates, worksheets)
- Styled callout boxes (tips, key concepts, warnings, notes)
- Interactive example displays (prompt/response mockups, code examples, before/after comparisons, data displays)
- Data reveal cards (animated metric displays)
- Reflection prompts
- Scenario-based decision points
- Hands-on exercises
- Estimated reading/completion time

When the topic changes, a new lesson begins.

### Knowledge Check
A lightweight, low-stakes assessment at the end of each module. Not formally graded — completion of the check (regardless of score) marks the module as complete. Includes immediate explanatory feedback for every answer. Question types supported: multiple choice (single and multi-select), matching, drag-to-rank/prioritize, true/false, and fill-in-the-blank. Results are stored for analytics.

### Glossary
A course-level dictionary of terms. Entries are referenced inline in lessons (rendered as interactive tooltips) and also accessible as a standalone searchable page. Each entry has: term, definition, and optionally a link to the lesson where the term is first introduced.

## 2.3 Content Storage Principles

All course content lives in structured flat files **separate from application code**. The guiding principles:

1. **Readable and editable by non-developers.** Lesson content is authored in MDX (Markdown with embedded React components). Prose is written in standard Markdown syntax. Rich interactive elements are inserted as component tags. Course metadata and configuration are in YAML. A content author with a text editor and a component reference guide can create, modify, and reorganize content.

2. **Predictable conventions.** Every course follows the same directory structure and file naming pattern. A consultant who has worked with one course can immediately navigate another.

3. **Assets co-located with content.** Images, diagrams, videos (as references/URLs), and downloadable files live alongside the lessons that reference them.

4. **Theme and content are independent.** Branding configuration is completely separate from course content. The same course can be deployed under any theme with no content changes.

5. **No runtime dependency on external content services.** All content is bundled with the deployment (baked into the container image or mounted as a volume). The platform does not fetch content from a CMS or CDN at runtime.

### Recommended File Structure

```
/content
  /courses
    /[course-slug]
      course.yaml                  # title, description, duration, objectives, module order, config flags
      /modules
        /[01-module-slug]
          module.yaml              # title, objectives, lesson order, estimated duration
          /lessons
            [01-lesson-slug].mdx   # lesson content in MDX (Markdown + React components)
            [02-lesson-slug].mdx
          knowledge-check.yaml     # questions, options, correct answers, feedback text
        /[02-module-slug]
          ...
      /assets                      # images, diagrams, downloadable files for this course
      glossary.yaml                # term/definition pairs, optional lesson references
      coach-prompt.md              # system prompt for AI learning assistant (if enabled)
  /themes
    /[theme-name]
      theme.yaml                   # colors, typography, logo path, organization name
      logo.svg
      favicon.ico
```

## 2.4 Course Configuration

Each course can configure behavioral options via its `course.yaml`:

```yaml
title: "AI-Enabled Problem Solving"
slug: "ai-problem-solving"
description: "A practitioner's guide to using AI tools for structured problem solving."
estimated_duration_minutes: 240
audience: "Non-technical professionals with basic familiarity with problem-solving concepts."
prerequisites: []  # list of course slugs, if any
navigation_mode: "linear"  # "linear" (must complete in order) or "open" (any order)
ai_features_enabled: true  # whether this course uses AI assistant and/or live AI exercises
completion_certificate: false
narrative_synopsis: |
  Optional. If this course follows a running example/story,
  describe it here. Displayed on the course overview page.
modules:
  - "01-defining-the-problem"
  - "02-diagnosing-root-causes"
  - "03-designing-solutions"
  - "04-prioritizing-and-recommending"
```

---

# 3. Functional Specification

Feature IDs follow the convention: **F-[audience]-[number]**. L = Learner, A = Admin, P = Platform.

## 3.1 Learner-Facing Features

### F-L01: Course Overview
On entering a course, the learner sees an overview page displaying: title, description, estimated total duration, audience description, prerequisite courses (if any), a list of all modules with their learning objectives and estimated durations, and the narrative synopsis (if the course has one). A "Start Course" or "Continue" button is prominently placed.

### F-L02: Lesson Content Rendering
Lessons are authored in MDX and rendered as styled React components within the application frame. MDX allows content authors to write prose in standard Markdown while embedding the platform's interactive components (callout boxes, glossary terms, reflection prompts, decision points, exercises, animated diagrams, data reveals, video embeds, and downloadable resource links) as JSX tags directly in the content. Lessons scroll vertically with no artificial page breaks. Content elements animate into view on scroll using the platform's standard reveal animation.

### F-L03: Embedded Interactive Examples
A flexible component for displaying worked examples within lessons. The visual presentation adapts to the course content:
- **Prompt/response displays** for AI-related courses — styled to resemble a user typing into an AI interface and receiving a response.
- **Code examples** with syntax highlighting for technical courses.
- **Before/after comparisons** for process improvement courses.
- **Data table displays** for analytics-related courses.

These are static, illustrative displays — not live interactive tools. They show the learner what a real interaction looks like.

### F-L04: Embedded Video
Lessons can include video content via external hosting (YouTube, Vimeo, or any embeddable player). Videos render inline within the lesson flow in a responsive 16:9 container. The platform does not host video files directly.

### F-L05: Downloadable Resources
Lessons can link to downloadable files (PDFs, Excel templates, worksheets, reference cards). These are stored in the course's asset directory and served by the platform. Displayed as a styled download card within the lesson with file name, type, and size.

### F-L06: Navigation & Progress Map
A persistent sidebar (collapsible) displays the full module/lesson structure with completion status indicators:
- ○ Not started
- ● In progress
- ✓ Complete

The sidebar shows the learner's current position. Clicking a module expands its lessons and displays its learning objectives. Clicking a lesson navigates directly to it (subject to navigation mode — in linear mode, only completed and next-available lessons are clickable). A thin progress bar showing overall course completion percentage is always visible.

Within each lesson, a "Lesson X of Y" indicator and forward/back navigation buttons are present. Estimated time for the current lesson is displayed near the title.

### F-L07: Inline Glossary Tooltips
Terms annotated in MDX lesson content are rendered as visually distinct text (subtle dotted underline). On click, a popover displays the term's definition. The popover includes a "View in Glossary" link. Dismissing the popover returns focus to the reading position.

### F-L08: Full Glossary Page
Accessible at any time from the sidebar navigation. Displays all terms alphabetically with definitions. Includes search/filter functionality. Each entry optionally links to the lesson where the term is first introduced.

### F-L09: Reflection Prompts
Embedded within lessons at key conceptual moments. Displays a question or prompt in a distinct visual card. Optionally provides a text area for the learner to type a response. A "Reveal" button advances the lesson to show the answer or explanation. The learner's typed response is not graded or stored. The purpose is to pause and activate thinking before presenting the answer.

### F-L10: Knowledge Checks
Appear at the end of each module (or as the final lesson of a module). Presented one question at a time for focus.

**Question types:**
- **Multiple choice (single select):** Radio buttons.
- **Multiple choice (multi-select):** Checkboxes with "select all that apply."
- **True / False:** Two-option single select.
- **Matching:** Pair items from two columns (drag-and-drop or dropdown).
- **Drag-to-rank:** Reorder items by priority or sequence.
- **Fill-in-the-blank:** Short text input compared against accepted answers (case-insensitive, with a tolerance list of acceptable variants).

After each answer: immediate feedback panel showing correct/incorrect status and an explanation. The explanation is where most learning occurs — it should be substantive, not just "Correct!" or "Try again."

After all questions: a summary showing score, which concepts were missed, and links back to the relevant lessons for review. Completing the knowledge check (regardless of score) marks the module as complete.

### F-L11: Scenario-Based Decision Points
Embedded within lessons as interactive forks. Present a realistic situation and 2–4 options. The learner selects one. The app then reveals an explanation for **every** option — what would happen if you chose it, why one approach is more effective, and the trade-offs involved. All options remain visible so the learner can read through each explanation. No penalty for any selection.

### F-L12: Hands-On Exercises
A framework for embedding practice activities within lessons. The platform provides a standard exercise container with: an instructions panel, a workspace area, and a results/feedback area. The specific exercise content and logic are defined per course.

**Examples by course type:**
- AI problem-solving: write a prompt for a given scenario, see a live AI response, compare against a reference prompt.
- Lean Six Sigma: identify waste in a described process, categorize items, build a simple priority matrix.
- Data literacy: interpret a chart and answer questions about it, select the right visualization for a data set.

Exercise definitions are stored in the course content files. Simple exercises (select an answer, categorize items) are fully client-side. Complex exercises (live AI interaction) require the AI backend and are only available when AI features are enabled by the client admin (F-A05). When AI features are disabled, these exercises display a notice explaining they require AI configuration.

### F-L13: Session Persistence & Bookmarking
On login, if the learner has a course in progress, a "Continue where you left off" prompt appears showing the course name and current lesson. Clicking it navigates directly to that lesson. All module, lesson, and knowledge check completion states persist across sessions. The learner's scroll position within a lesson is **not** persisted — they resume at the top of their current lesson.

### F-L14: AI Learning Assistant
A collapsible chat panel accessible from any lesson. Slides in from the right side of the screen without displacing lesson content.

**Behavior:**
- Contextually aware of the current course, module, and lesson. The system prompt includes the course's defined AI prompt plus the current lesson content.
- Answers questions about the material, explains concepts in simpler terms, provides additional examples, and helps learners work through exercises.
- Scoped to the course content. Off-topic questions receive a polite redirect.
- Does not fabricate information outside the provided course material.
- Conversation history persists within the session. Clears on logout or session expiration.

**Configuration:**
- Enabled/disabled globally via admin settings (F-A05) and per course via `course.yaml`.
- System prompt defined per course in the content files (`coach-prompt.md`).
- Model-agnostic: supports Claude and OpenAI APIs. Model and API key configured by admin.
- All requests proxied through the backend — API key is never exposed to the client browser.

**When disabled or unconfigured:** The AI assistant button is hidden from the sidebar. If a course has AI-dependent exercises but AI features are disabled, those exercises display a fallback notice.

### F-L15: Content Search
A search function accessible from the sidebar and top navigation bar. Searches across all lesson content, glossary terms, and module/lesson titles within the current course. Returns results with the matching term highlighted in context and a direct link to the relevant lesson. If multiple courses exist, search scope defaults to the current course with an option to search all courses.

### F-L16: Course Completion
When all modules are marked complete, the course status changes to "completed." A completion summary page displays: completion date, total time spent, and module-by-module knowledge check score summary. If `completion_certificate` is enabled in course config, a downloadable/printable completion certificate is generated with the learner's name, course name, and completion date.

## 3.2 Admin-Facing Features

### F-A00: Admin Area & Navigation
Users with the `admin` role have access to a dedicated **Admin Area** — a unified interface for platform management. The admin area is accessed via a persistent "Admin" link in the top navigation bar (visible only to admin-role users).

**Admin area navigation tabs:**
- **Dashboard** — adoption metrics and completion analytics (F-A01).
- **Users** — user list, detail views, role management, pre-enrollment (F-A03).
- **Settings** — AI configuration, theme selection, OAuth info (F-A04).
- **Feedback** — content feedback entries from reviewers (F-A05).

**Admin landing behavior:** When an admin logs in, they land on the **course overview page** (the same as a learner) — admins are often learners too and should experience the platform as a learner by default. The admin area is one click away in the top nav. Admins can freely switch between the learner experience and the admin area at any time.

**Role indicator:** A subtle badge or label in the user menu indicates the user's admin role.

### F-A01: Admin Dashboard
The Dashboard tab within the admin area. Summary metrics displayed as cards:
- Total enrolled users (pre-enrolled + logged in)
- Number completed / in progress / not started
- Average completion percentage across all users
- Average time to completion (for those who have completed)

A **module-level completion funnel**: a bar chart or stepped visualization showing what percentage of learners completed each module. Drop-off points are visually obvious.

Dashboard reflects current data on load. An empty-state message guides new admins when no users are enrolled yet.

### F-A02: User Detail Table & Export
A table within the Users tab showing all users (both those who have logged in via OAuth and pre-enrolled users who haven't) with sortable and filterable columns: name, email, role, enrollment date, last active date, current module/lesson, completion percentage, total time spent, status.

**Status filter:** All | Not Started | In Progress | Completed.

Users inactive for 14+ days are flagged with a warning indicator.

Clicking a user row opens a detail view: per-module completion status, knowledge check scores per module, lesson-level timestamps.

**CSV Export:** One-click download. The CSV includes: user name, email, role, enrollment date, last active date, overall completion percentage, status, total time spent, and per-module completion status and knowledge check scores. File is timestamped.

### F-A03: User Management
- **Automatic provisioning:** Users are created automatically on first OAuth login. No manual user creation is needed for standard enrollment.
- **Role management:** Admins can promote a user to admin or demote an admin to learner.
- **Deactivate / remove user:** Deactivated users are blocked from accessing the platform even if they can still authenticate through the identity provider. Their progress data is retained. Removed users have all data deleted.
- **Pre-enrollment:** Admin can upload a CSV of email addresses. These users appear in the admin dashboard as "Not started (pre-enrolled)" before they've logged in, giving the admin a complete view of the enrollment list. When a pre-enrolled user logs in, their record is linked and their enrollment date reflects the pre-enrollment date.
- **Optional: Access control by group.** If the identity provider supports group claims, the platform can be configured to allow access only to users in a specific group. Users outside the group see an "Access denied — contact your administrator" message after authentication.

### F-A04: Platform Settings
The Settings tab within the admin area. Organized into sections:

**AI Configuration**
- **API key entry:** Masked input field. Stored encrypted in the database. A "Test Connection" button verifies the key is valid and the selected model responds.
- **Model selection:** Dropdown to choose the AI provider and model (e.g., Claude Sonnet, Claude Opus, GPT-4o). Supports Claude and OpenAI APIs.
- **Enable/disable toggle:** Controls whether AI-powered features are active across the platform. When disabled, both the AI learning assistant (F-L14) and any live AI-powered exercises (F-L12) are hidden from learners. When enabled, both use the configured API key and model.
- **Explanatory note:** "This API key powers the AI Learning Assistant and any interactive AI exercises within courses. When disabled, learners will still see all non-AI content and exercises."
- **Unconfigured state:** If AI is enabled but no API key is entered, the page shows a warning. Learners see a "Not yet configured" message on AI features rather than an error.

**OAuth Configuration (Read-Only)**
- Displays the currently configured identity provider, issuer URL, and client ID (masked).
- These values are set via environment variables at deployment and are not editable through the UI.
- Note: "OAuth settings are configured at deployment. Contact your platform administrator to change these."

**Theme**
- Dropdown to select from available themes in the `/themes` directory. Color swatch preview for each theme. Changes apply on next page load.

All settings (except OAuth) persist across container restarts (stored in the database).

### F-A05: Content Feedback
A lightweight mechanism for content review. Each lesson has a small "Submit Feedback" button (visible only to admin-role users). Clicking it opens a text input. Feedback is stored with a reference to the specific course, module, and lesson.

The Feedback tab in the admin area shows a chronological list of all entries, filterable by module, sortable by date. Each entry shows: lesson reference, feedback text, submitter name, and date. Entries can be marked as "resolved."

This is a development/review tool — it can be disabled for production deployments via a configuration flag.

## 3.3 Platform-Level Features

### F-P01: Authentication & Authorization
- **OAuth 2.0 / OpenID Connect (OIDC)** single sign-on. The platform does not manage passwords. Users authenticate through their organization's identity provider.
- **Supported providers:** Microsoft Entra ID (Azure AD), Google Workspace, and a generic OIDC option for other providers. The active provider is configured per deployment via environment variables.
- **Login flow:** User clicks "Sign in with [Provider]" → redirected to the identity provider → authenticates with their existing organizational credentials → redirected back to the platform → platform creates or retrieves their user record and establishes a session.
- **Automatic user provisioning:** On first login, the platform creates a user record from the identity provider's profile (name, email). No admin action required.
- **Role assignment:** All users default to the `learner` role on first login. Admins promote users manually. Optionally, role can be mapped from the identity provider's group claims.
- **Initial admin bootstrapping:** An environment variable `INITIAL_ADMIN_EMAIL` is set at deployment time. When a user with that email authenticates for the first time, they are automatically assigned the `admin` role. This solves the cold-start problem on a fresh deployment where no admin exists yet. After the first admin is established, they can promote others through the admin UI and the environment variable becomes inert.
- **Session management:** After OAuth authentication, the platform issues its own JWT (httpOnly cookie) with configurable expiration.
- **Logout:** Clears the platform session. Optionally redirects to the identity provider's logout endpoint.

### F-P02: Adaptive Course Display
- **Single-course mode:** When only one course exists in the content directory, the learner bypasses the course catalog and lands directly on the course overview. No catalog UI visible.
- **Multi-course mode:** When multiple courses exist, the learner sees a course catalog with cards displaying title, description, estimated duration, and the learner's progress status. This switches automatically.

### F-P03: Theming & Branding
All visual identity properties are controlled through the theme configuration file. Changing the active theme requires no code modification. Configurable properties: organization name, logo, favicon, color palette (primary, primary-light, secondary, accent, background, surface, text colors, success/error/warning), and typography (heading, body, monospace fonts).

Design principle: **accent on white.** Brand colors serve as highlights against a predominantly white/light interface. This ensures readability across client brand palettes.

### F-P04: Responsive Layout
- **Primary target:** Desktop, 1280px+.
- **Secondary target:** Tablet, 768px–1279px. Sidebar collapses to a hamburger menu. All functionality preserved.
- **Tertiary target:** Mobile, < 768px. Content is readable and navigable. Interactive elements remain functional but may use simplified layouts. AI assistant panel becomes full-screen overlay.

### F-P05: Accessibility
- WCAG 2.1 AA compliance as a baseline across all themes.
- Full keyboard navigation for all interactive elements.
- Semantic HTML with appropriate ARIA labels.
- Sufficient color contrast ratios enforced in the theming system.
- Visible focus indicators on all interactive elements.
- Alt text for all images (defined in MDX content).
- Video embeds should reference externally hosted captions/transcripts where available.
- All animations respect `prefers-reduced-motion` media query.

### F-P06: Error Handling & Edge Cases
- **Failed authentication:** Clear error message on the login page. No sensitive details exposed.
- **Deactivated user:** After OAuth authentication, if the user is deactivated, they see a clear "Access denied" message and are not logged in.
- **Network interruption during a lesson:** Progress is saved on each lesson transition and periodically (every 60 seconds of active time). If the connection drops, the learner sees a notification and can continue reading (content is already loaded). Progress syncs when connectivity resumes.
- **AI assistant error:** If the API call fails, the assistant panel displays a clear error message rather than failing silently.
- **Empty states:** Dashboard with no users, course catalog with no courses, glossary with no terms — all display helpful contextual messages.
- **Content rendering errors:** If an MDX file contains invalid syntax or references a missing asset, the lesson renders what it can and displays a visible warning (admin-only) rather than crashing.

### F-P07: Print Support
Lesson content is printable via the browser's native print function. A print stylesheet removes navigation chrome, expands content to full page width, renders glossary tooltips as inline parenthetical definitions, styles interactive elements as static text, and ensures readable typography and margins.

### F-P08: Content Versioning
When course content is updated and the container is rebuilt/restarted:
- If a lesson's content changes but its slug stays the same, the learner's completion status is preserved.
- If a module is added, it appears as "not started" without affecting other module statuses.
- If a module or lesson slug is removed, the associated progress data becomes orphaned (retained in the database but invisible in the UI). The admin dashboard surfaces a warning if orphaned progress records exist.
- Content authors should be instructed that renaming slugs breaks progress continuity.

---

# 4. Technical Architecture

## 4.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Front End | React with Tailwind CSS, Framer Motion (animation), and a custom component library | Component-based architecture suits the variety of interactive content types. Framer Motion provides the animation layer essential for a polished, premium feel. Tailwind extended with a design token system for consistent spacing, typography, and color application. |
| Back End | Node.js (Express or Fastify) or Python (FastAPI) | Lightweight, handles auth, content API, progress tracking, and AI proxy. Team should use whichever they're faster in. |
| Database | PostgreSQL | Production-grade relational database. Handles concurrent writes, supports enterprise backup tooling, and is familiar to most client IT teams. Runs as a separate container alongside the application via Docker Compose. |
| Content Pipeline | MDX → React rendering (next-mdx-remote or @mdx-js/mdx) | MDX extends Markdown with the ability to embed React components directly in content files. Content authors write prose in familiar Markdown syntax and drop in rich interactive components (animated diagrams, data reveals, prompt simulations) as JSX tags. |
| Animation | Framer Motion | Page transitions, scroll-triggered reveals, micro-interactions on interactive elements, and physics-based spring animations. The layer that makes the platform feel like a product rather than a website. |
| Diagrams & Visualization | SVG React components, Mermaid (simple flowcharts), Recharts or D3 (data visualizations) | Diagrams are theme-aware (colors adapt to client branding), resolution-independent, and can animate progressively. |
| Icons | Lucide React | Consistent, lightweight icon system used across all components. |
| Typography | Variable fonts (Inter for body/headings, JetBrains Mono for code/prompts) loaded locally | Avoids external font service dependencies. Variable fonts enable fine-grained weight control for visual hierarchy. |
| AI Assistant Proxy | Server-side REST proxy to Claude / OpenAI APIs | Keeps API keys off the client. Injects system prompt and lesson context. |
| Containerization | Docker Compose (app container + Postgres container) | Portable across Render, client infrastructure, or any container host. Compose bundles both services into a single deployment unit. |
| Version Control | Git (GitHub) | Standard branch-based workflow. Feature branches → pull requests → merge to main. |

## 4.2 Deployment Architecture

```
┌─── Docker Compose ───────────────────────────────────────────┐
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              Application Container                        ││
│  │                                                           ││
│  │  ┌──────────────┐     ┌────────────────────────────────┐ ││
│  │  │  Static       │     │         Backend Server          │ ││
│  │  │  Front End    │◄───►│  - OAuth flow & session mgmt    │ ││
│  │  │  (React SPA)  │     │  - Content API (reads /content) │ ││
│  │  │               │     │  - Progress API (reads/writes   │ ││
│  │  │               │     │    Postgres)                    │ ││
│  │  │               │     │  - Admin API                    │ ││
│  │  │               │     │  - AI proxy (external API calls)│ ││
│  │  └──────────────┘     └──────────────┬─────────────────┘ ││
│  │                                       │                    ││
│  │  /content   ← Course files (baked in or mounted volume)   ││
│  │  /themes    ← Theme configurations                        ││
│  │  .env       ← OAuth credentials, secrets, config          ││
│  └──────────────────────────────────────────────────────────┘│
│                                          │                    │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              PostgreSQL Container                         ││
│  │                                                           ││
│  │  Port 5432 (internal only — not exposed to host)          ││
│  │  Data volume: /var/lib/postgresql/data (persistent)       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
└──────────────────────────────────────────────────────────────┘
         │                              │
         │ HTTPS                        │ HTTPS
         ▼                              ▼
    [Learner Browser]          [Claude / OpenAI API]
```

**Deployment targets:**
- **Development / demo:** Render or similar PaaS (using their managed Postgres add-on or the Compose file). Accessible via URL for stakeholder review.
- **Production / client handoff:** Docker Compose file delivered with documentation. Client deploys both containers to their infrastructure. If the client already has a managed Postgres instance, the app container can point to it via connection string instead of running its own Postgres container.
- **Content updates:** For MVP, content is baked into the app image at build time (rebuild to update). Future enhancement: mount `/content` as a Docker volume so files can be updated on disk and picked up on restart without rebuilding the image.
- **Database persistence:** The Postgres data directory is mapped to a named Docker volume, ensuring data survives container restarts and rebuilds.

## 4.3 Data Model

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| oauth_provider | VARCHAR(50) | NOT NULL (e.g., 'microsoft', 'google', 'oidc') |
| oauth_subject_id | VARCHAR(255) | NOT NULL — unique user ID from the identity provider |
| role | ENUM('learner','admin') | NOT NULL, DEFAULT 'learner' |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | NOT NULL |
| last_active_at | TIMESTAMP | |
| UNIQUE(oauth_provider, oauth_subject_id) | | |

### pre_enrolled_users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| enrolled_at | TIMESTAMP | NOT NULL |
| enrolled_by | UUID | FK → users (admin who uploaded the list) |

*When a user logs in via OAuth, the platform checks this table by email. If found, the user's enrollment date reflects the pre-enrollment date. This allows admins to track "not started" users who haven't logged in yet.*

### course_progress
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| course_slug | VARCHAR(100) | NOT NULL |
| current_module_slug | VARCHAR(100) | |
| current_lesson_slug | VARCHAR(100) | |
| status | ENUM('not_started','in_progress','completed') | DEFAULT 'not_started' |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| total_time_seconds | INTEGER | DEFAULT 0 |
| UNIQUE(user_id, course_slug) | | |

### lesson_progress
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| course_slug | VARCHAR(100) | NOT NULL |
| module_slug | VARCHAR(100) | NOT NULL |
| lesson_slug | VARCHAR(100) | NOT NULL |
| status | ENUM('not_started','in_progress','completed') | DEFAULT 'not_started' |
| time_spent_seconds | INTEGER | DEFAULT 0 |
| first_viewed_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |
| UNIQUE(user_id, course_slug, module_slug, lesson_slug) | | |

### knowledge_check_results
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| course_slug | VARCHAR(100) | NOT NULL |
| module_slug | VARCHAR(100) | NOT NULL |
| question_id | VARCHAR(100) | NOT NULL |
| selected_answer | TEXT | NOT NULL |
| is_correct | BOOLEAN | NOT NULL |
| attempted_at | TIMESTAMP | NOT NULL |

### content_feedback
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| course_slug | VARCHAR(100) | NOT NULL |
| module_slug | VARCHAR(100) | |
| lesson_slug | VARCHAR(100) | |
| feedback_text | TEXT | NOT NULL |
| is_resolved | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMP | NOT NULL |

### platform_settings
| Column | Type | Constraints |
|--------|------|-------------|
| key | VARCHAR(100) | PK |
| value | TEXT | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

*Stores: ai_api_key (encrypted), ai_model, ai_enabled, active_theme. OAuth configuration (client ID, client secret, issuer URL) is stored in environment variables, not in this table.*

## 4.4 API Routes

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/auth/login` | Initiate OAuth flow — redirects to identity provider |
| GET | `/api/auth/callback` | OAuth callback — exchanges code for token, creates/retrieves user, establishes session |
| POST | `/api/auth/logout` | Clear platform session |
| GET | `/api/auth/me` | Return current user info and role |

### Content
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/courses` | List all courses (metadata only) |
| GET | `/api/courses/:slug` | Course detail: modules, objectives, synopsis |
| GET | `/api/courses/:slug/modules/:moduleSlug` | Module detail: lessons list, objectives, estimated duration |
| GET | `/api/courses/:slug/modules/:moduleSlug/lessons/:lessonSlug` | Rendered lesson content + metadata |
| GET | `/api/courses/:slug/glossary` | All glossary terms for a course |
| GET | `/api/courses/:slug/search?q=` | Search course content |

### Progress
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/progress/:courseSlug` | Current user's full progress for a course |
| POST | `/api/progress/:courseSlug/heartbeat` | Update time-on-task (called periodically) |
| POST | `/api/progress/:courseSlug/lessons/:lessonSlug/complete` | Mark lesson completed |
| POST | `/api/progress/:courseSlug/modules/:moduleSlug/check` | Submit knowledge check answers, receive feedback |

### AI Assistant
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/assistant/message` | Send message with course/module/lesson context, receive response |

### Admin
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/dashboard` | Aggregate metrics for dashboard cards and funnel |
| GET | `/api/admin/users` | User list with progress summaries |
| GET | `/api/admin/users/:id` | Detailed user progress |
| PUT | `/api/admin/users/:id/role` | Change user role (learner ↔ admin) |
| PUT | `/api/admin/users/:id/deactivate` | Deactivate user |
| PUT | `/api/admin/users/:id/activate` | Reactivate user |
| DELETE | `/api/admin/users/:id` | Remove user and all associated data |
| POST | `/api/admin/users/pre-enroll` | Bulk pre-enroll by CSV upload |
| GET | `/api/admin/export` | Download CSV of all user progress data |
| GET | `/api/admin/feedback` | List all content feedback entries |
| PUT | `/api/admin/feedback/:id/resolve` | Mark feedback entry as resolved |
| GET | `/api/admin/settings` | Current platform settings |
| PUT | `/api/admin/settings` | Update settings (API key, model, AI toggle, theme) |
| POST | `/api/admin/settings/test-ai` | Test AI connection with current key and model |
| GET | `/api/health` | Health check: DB connection, content directory accessible |

## 4.5 Security

- **Authentication:** OAuth 2.0 / OIDC delegated to the client's identity provider. The platform never handles or stores user passwords. OAuth client credentials (client ID, client secret, issuer URL) are stored in environment variables.
- **OAuth state parameter:** The login flow uses the `state` parameter to prevent CSRF attacks during the callback.
- **API keys:** AI provider API keys stored encrypted in the database. Never included in frontend bundles or API responses.
- **Sessions:** JWTs with configurable expiration, stored in httpOnly, Secure, SameSite=Strict cookies.
- **Role enforcement:** Middleware on all admin routes verifies admin role. All learner routes verify authentication. Deactivated users are rejected at the session validation layer.
- **Rate limiting:** AI assistant endpoint (max 20 requests per minute per user). Progress write endpoints (max 60 per minute per user).
- **Input sanitization:** All user input (feedback, AI messages, search queries) sanitized before processing. MDX content is rendered in a sandboxed context to prevent XSS.
- **HTTPS:** Required in production. The Docker container serves HTTP; a reverse proxy or platform layer terminates TLS.

## 4.6 Performance Targets

| Metric | Target |
|--------|--------|
| Lesson page load (content render) | < 1 second |
| Navigation between lessons | < 500ms |
| Search results | < 1 second |
| AI assistant first token | < 2 seconds |
| Admin dashboard load | < 2 seconds |
| Concurrent users supported | Up to 5,000+ simultaneous (PostgreSQL) |
| Maximum course size | 100 lessons, 500 glossary terms, 1,000 asset files |

## 4.7 Logging & Monitoring

- **Application logs:** All API requests logged with timestamp, user ID, route, and response code. Errors logged with stack traces.
- **Access logs:** OAuth login events (success and failure) logged with timestamp.
- **Health check endpoint:** `GET /api/health` returns 200 with basic system status (DB connection, content directory accessible). Used by hosting platforms for uptime monitoring.
- **Log output:** Stdout/stderr (standard for Docker). The hosting environment handles log aggregation.

## 4.8 Backup & Data Recovery

- **PostgreSQL database:** The Postgres data directory is persisted via a Docker named volume. Backups should be scheduled using `pg_dump` (logical backup) or volume-level snapshots. Deployment documentation must include backup instructions and a sample script for automated daily backups.
- **Content files:** Version-controlled in Git. The Git repository is the backup.
- **Data export:** The admin CSV export (F-A02) serves as a human-readable backup of all progress data.
- **Restore procedure:** Documentation must cover: restoring from a `pg_dump` file, rebuilding the app container from the image, and verifying data integrity after restore.

---

# 5. UI/UX Specification

## 5.1 Design Principles

1. **Content is the product.** Lesson content occupies the majority of the viewport. Navigation, progress indicators, and toolbars are present but never compete with the content for attention.

2. **Clean and professional.** The audience is corporate employees. No gamification, points, badges, or leaderboards. Completion is the goal, not competition.

3. **Impressively polished.** The platform must make a strong first impression. When a client stakeholder sees it for the first time, the reaction should be "this is way beyond what we expected." Every surface — login page, course overview, lesson content, interactive elements, admin dashboard — should feel like a finished, premium product.

4. **Motion with purpose.** Animation is used throughout, but always in service of clarity and delight. Page transitions orient the learner spatially. Elements reveal on scroll to create rhythm and focus. Interactive feedback uses motion to feel satisfying and responsive. A static page should be the exception.

5. **Quiet interactivity.** Interactive elements are woven into the natural reading flow. There is no jarring transition between "reading mode" and "exercise mode." Everything lives on the same scrollable page.

6. **Generous whitespace and constrained width.** Text blocks are limited to ~700px maximum width for comfortable reading. Ample vertical spacing. Dense information is broken into digestible visual chunks.

7. **Distinct but cohesive components.** Every interactive element type has a recognizable visual pattern so learners quickly identify what kind of element they're encountering.

8. **Theme-native visuals.** All visual elements — diagrams, charts, icons, component accents — adapt to the active theme. A diagram created for one client's brand automatically renders in another client's brand.

## 5.2 Visual Design Language

### Color Application
The theme defines a palette. How it's applied:
- **Background layer (~70%):** White/near-white. Clean, open.
- **Surface layer (~20%):** Light gray. Cards, panels, sidebar. Creates depth without heaviness.
- **Accent layer (~8%):** Primary color. Active states, interactive borders, progress indicators, links, buttons. Draws the eye to what matters.
- **Feedback layer (~2%):** Success/error/warning. Reserved for response states in interactive elements.

The client's brand color is visible and recognizable but never overwhelming.

### Typography Hierarchy

| Level | Use | Style |
|-------|-----|-------|
| Display | Course title, hero sections | 36–48px, semibold, tight letter-spacing |
| H1 | Module titles | 28–32px, semibold |
| H2 | Lesson titles | 22–26px, semibold |
| H3 | Section headings within lessons | 18–20px, semibold |
| Body | Lesson prose | 16–17px, regular, 1.6–1.7 line height, ~700px max width |
| Caption | Metadata, timestamps, lesson count | 13–14px, regular, secondary text color |
| Mono | Prompts, code, technical terms in examples | 14–15px, JetBrains Mono |

### Elevation & Depth
- **Level 0:** Flat. Lesson prose, headings.
- **Level 1:** Slight shadow or border. Cards, callouts, sidebar.
- **Level 2:** Moderate shadow. Modals, tooltips, dropdowns, AI assistant panel.
- **Level 3:** Pronounced shadow. Overlay panels, mobile navigation drawer.

Shadows are soft and diffused with consistent top-down direction.

### Border & Corner Treatment
- Default corner radius: 8px (cards), 12px (large cards), 4px (small elements like badges).
- Interactive elements have a left-accent-border (4–6px) to signal interactivity.
- Borders: 1px, theme border color. Consistency matters more than any specific value.

## 5.3 Animation & Motion

All animations use Framer Motion. All animations respect `prefers-reduced-motion`.

### Page & Lesson Transitions
Advancing forward: content slides left slightly and fades in. Going back: slides right. Duration: 250–350ms, ease-out.

### Scroll-Triggered Reveals
Content elements fade in and translate upward (12–20px) as the learner scrolls. Duration: 400–500ms. Stagger: 50–80ms between consecutive elements. Already-scrolled elements do not re-animate.

### Interactive Feedback
- **Knowledge check selection:** Subtle scale (1.02x), accent border. Unselected options fade to 0.7 opacity. 200ms.
- **Correct/incorrect reveal:** Spring animation. Color fill. 300ms.
- **Decision point selection:** Card lifts (translateY -2px, shadow increase). Explanation panels expand with smooth height animation. 300–400ms.
- **Reflection prompt reveal:** Hidden content slides down and fades in. 400ms.
- **Glossary tooltip:** Scale 0.95→1.0 + fade. 150ms.

### Progress Animations
- Progress bar fill: 600ms, ease-in-out.
- Module completion (● → ✓): scale-bounce 1.0→1.2→1.0. 300ms.
- Course completion: tasteful celebratory animation (subtle confetti or radial reveal). 1–2 seconds.

### AI Assistant Panel
- Open: slide in from right. 300ms, ease-out.
- New messages: fade + upward translate. Typing indicator before content.
- Close: slide out right. 250ms.

### Performance Rules
- Animate only `transform` and `opacity` (GPU-composited).
- No animation exceeds 600ms for UI feedback. Decorative animations max 2 seconds.
- No animation blocks interaction.

## 5.4 Page Layouts

### Login Page
- Centered card on a clean background with subtle gradient or faded client logo watermark.
- Client logo displayed prominently.
- Platform name or tagline below.
- A single button: **"Sign in with [Provider]"** with the provider's brand icon and the platform's accent color. Full width.
- No email/password fields. The simplicity of a single button is part of the premium feel.
- Error states: inline message with slide-down animation.
- Card: Level 2 elevation, fade + translateY entrance animation.

### Course Overview Page
- **Hero section:** Full-width. Course title in display typography. One-line description. Prominent "Start Course" / "Continue" button. Subtle gradient, geometric pattern, or thematic illustration in the background. Should feel like a product landing page.
- **Key metadata:** Estimated duration, audience, prerequisites — horizontal row of icon + label pairs.
- **Narrative synopsis** (if present): Visually distinct section (different background or accent-bordered card). Inviting and readable.
- **Module roadmap:** Visual, interactive representation — vertical timeline or card layout. Each module shows title, learning objectives (expandable), estimated duration, and progress status. The learner sees the full journey at a glance.
- Scroll-triggered reveals on each section.

### Lesson Page (Primary View)
```
┌────────────────────────────────────────────────────────────────┐
│  [Logo]   Course Title              [Search] [Admin] [User ▼] │
│  ┌─────────────┬──────────────────────────────────────────┐   │
│  │ Progress ▲  │  ░░░░░░░░░░░░░░░░░░░░░░░░ 45% complete  │   │
│  ├─────────────┼──────────────────────────────────────────┤   │
│  │             │                                          │   │
│  │ Module 1 ✓  │  Module 2: Diagnosing Root Causes        │   │
│  │ Module 2 ●  │  Lesson 3 of 5 · ~8 min                 │   │
│  │  L2.1 ✓     │  ─────────────────────────               │   │
│  │  L2.2 ✓     │                                          │   │
│  │  L2.3 ●     │  [Lesson content area]                   │   │
│  │  L2.4 ○     │                                          │   │
│  │  L2.5 ○     │  Prose, images, diagrams, callouts,      │   │
│  │  Check ○    │  interactive examples, reflection        │   │
│  │ Module 3 ○  │  prompts, decision points, exercises,    │   │
│  │ Module 4 ○  │  video embeds, download links...         │   │
│  │             │                                          │   │
│  │ ──────────  │                                          │   │
│  │ 📖 Glossary │                                          │   │
│  │ 🤖 AI Coach │  ┌──────────┐       ┌──────────┐        │   │
│  │ 🔍 Search   │  │  ← Back  │       │  Next →  │        │   │
│  │             │  └──────────┘       └──────────┘        │   │
│  └─────────────┴──────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

- **Sidebar** (left, collapsible): module/lesson tree with status indicators. Glossary, AI Coach, and Search links at the bottom.
- **Main content** (center): scrollable lesson. Forward/back navigation at bottom.
- **AI assistant** (right, hidden by default): slides in as overlay or side panel without displacing content. Full-screen overlay on mobile.
- **Top bar:** Logo, course title, search icon, admin link (admin users only), user dropdown.

### Admin Area
- Same top bar as the learner view. An "Admin" context with sub-navigation tabs: **Dashboard | Users | Settings | Feedback**.
- **Dashboard tab:** Metric cards (top), completion funnel chart (middle), recent user activity or quick-view table (bottom). "Export CSV" button in top-right. Empty state when no users enrolled.
- **Users tab:** Full table with status filter bar (All | Not Started | In Progress | Completed). Sortable columns. 14-day inactivity warning. Click to expand detail view. Role, deactivate, remove actions with confirmation dialogs. Pre-enrollment CSV upload button.
- **Settings tab:** Sections for AI Configuration, OAuth (read-only), and Theme. Clean form layout with labels and descriptions. Save button per section.
- **Feedback tab:** Chronological list, filterable by module. Each entry shows lesson reference, text, submitter, date. Resolve toggle.

### Knowledge Check
- Centered, elevated card. "Question 2 of 5" at top.
- H3-level question text. Large click-target options.
- Submit button (accent color).
- Feedback panel: spring animation, green/red left border, status icon, explanation, link to relevant lesson.
- Summary after last question: score, per-question mini-bars, missed concept links, "Continue to Next Module" button.

## 5.5 Component Visual Specifications

### Callout Boxes
Elevated cards (Level 1) with colored left border (4px) and tinted background.

| Type | Icon | Border / Tint | Use |
|------|------|---------------|-----|
| Tip | 💡 | Teal | Suggestions, best practices |
| Key Concept | 🔑 | Primary | Core ideas to remember |
| Warning | ⚠️ | Amber | Common mistakes, misconceptions |
| Note | ℹ️ | Gray | Additional context |

### Interactive Example Display
Surface background with accent-colored top border. Labeled header ("Example: Prompt & Response"). Content styled per type:
- **Prompt/response:** Chat-bubble layout. User prompt right-aligned, AI response left-aligned. Monospace font. Avatar icons.
- **Code:** Syntax-highlighted, dark surface. Copy button. Language label.
- **Before/after:** Two-column comparison with labeled headers and divider.
- **Data display:** Themed table or chart.

Slight inset shadow — feels "set into" the page.

### Animated Diagram Component
SVG React components. Resolution-independent, theme-aware, animatable.
- **Progressive reveal:** Steps animate in sequentially on scroll or interaction. Connector lines draw between steps.
- **Hover annotations:** Key elements reveal explanatory tooltips.
- **Simple diagrams** via Mermaid. **Data visualizations** via Recharts/D3, animated on scroll entry.

### Data Reveal Card
Large number with count-up animation on scroll. Label below. Optional before/after comparison with directional arrow and percentage change. Accent color highlight. Surface card, Level 1 elevation.

### Reflection Prompt
Full-width card, primary accent left border (6px). "Pause & Reflect" label with icon. Semibold question text. Optional text area. "Reveal Answer" secondary button. On reveal: smooth height expansion (400ms) with divider between question and answer.

### Decision Point
**Scenario card:** Full-width, surface background, accent header bar labeled "Your Decision." **Option cards:** Row (desktop) or stack (mobile). Letter label in accent circle, title (semibold), description. Hover: lift + shadow. Selected: accent background/border. After selection: all cards remain, each expands to show outcome. Recommended option gets ✓ badge and green accent. 400ms expansion animation.

### Knowledge Check Question
Centered Level 1 card. Question number at top (caption). H3 question text. Full-width option rows with clear hover and selected states. Feedback panel: spring animation, colored left border, icon, explanation, lesson link.

### Glossary Tooltip
Term: subtle dotted underline in accent color (not a hyperlink style). On click: popover anchored to term (scale + fade, 150ms). Level 2 elevation. Term (semibold), definition, "View in Glossary →" link. Dismisses on click-away, Escape, or scroll.

### Downloadable Resource Card
Inline card. Surface background, Level 1. File type icon in colored badge, file name (semibold), size (caption). Download button. Hover: accent border.

### Video Embed
Responsive 16:9 container. Rounded corners. Thin border or shadow. Scroll-triggered reveal. Native embed player.

### Progress Indicators
- Sidebar: ○ (gray) → ● (accent, subtle pulse) → ✓ (green, scale-bounce on transition).
- Top bar: 3–4px progress bar, accent color on light tint background. Animated fill (600ms).
- Lesson header: "Lesson X of Y · ~Z min" in caption text.

### Empty States
Relevant icon/illustration (line-art, accent color), short message, action prompt. Every potentially empty view has a designed empty state.

### Loading States
Skeleton screens (pulsing gray rectangles matching layout). Only visible if load exceeds 200ms. Long operations show progress indicator with message.

### Error States
Inline errors: red text below field, slide-down animation. Full-page errors: clean page with icon, human-readable message, "Go back" action.

## 5.6 Platform Component Library

A library of reusable MDX components that content authors embed in lessons. These are part of the platform, not course-specific. Styled by the active theme. Animated by Framer Motion.

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `<Callout>` | Styled aside | `type` (tip/concept/warning/note), `title` |
| `<PromptExample>` | AI prompt/response display | `prompt`, `response`, `model` |
| `<CodeExample>` | Syntax-highlighted code | `language`, `title` |
| `<BeforeAfter>` | Side-by-side comparison | `before`, `after`, `labels` |
| `<DataReveal>` | Animated metric display | `value`, `previousValue`, `unit`, `label`, `direction` |
| `<ProcessFlow>` | Animated step diagram | `steps[]`, `activeStep` |
| `<ComparisonMatrix>` | Option comparison table | `options[]`, `criteria[]`, `values[][]` |
| `<Timeline>` | Animated timeline | `events[]` |
| `<ReflectionPrompt>` | Pause-and-think card | `question`, `revealContent` |
| `<DecisionPoint>` | Scenario with options | `scenario`, `options[]` |
| `<KnowledgeCheck>` | Inline quick-check | `question`, `options[]`, `correct`, `feedback` |
| `<VideoEmbed>` | Responsive video | `url`, `title`, `caption` |
| `<DownloadResource>` | File download card | `filename`, `filetype`, `size`, `path` |
| `<GlossaryTerm>` | Inline term tooltip | `term` |
| `<Diagram>` | Mermaid diagram | `code`, `title` |
| `<DataChart>` | Themed chart | `type`, `data[]`, `xKey`, `yKey`, `title` |

### Component Development Principles
- Every component renders correctly with just required props. Optional props enhance but are never required.
- Every component is theme-aware — colors from theme, never hardcoded.
- Every component includes scroll-triggered entrance animation (disable with `animated={false}`).
- Every component is accessible: keyboard-navigable, screen-reader-compatible, respects `prefers-reduced-motion`.
- Every component renders gracefully on mobile.
- The library includes a **Storybook** or equivalent component showcase displaying each component with all variants and example usage. This serves as both a development tool and the content author's visual reference.

## 5.7 Theming System

```yaml
name: "Client Name"
logo: "logo.svg"
favicon: "favicon.ico"
organization_name: "Client Name"

colors:
  primary: "#6B2D8B"
  primary_light: "#F3E8FF"
  secondary: "#1A1A2E"
  accent: "#6B2D8B"
  background: "#FFFFFF"
  surface: "#F8F9FA"
  success: "#22C55E"
  error: "#EF4444"
  warning: "#F59E0B"
  text_primary: "#1A1A2E"
  text_secondary: "#6B7280"
  border: "#E5E7EB"

typography:
  heading_font: "Inter"
  body_font: "Inter"
  mono_font: "JetBrains Mono"
  base_size: "16px"
  line_height: 1.6
```

The application reads this file at build time (or startup) and maps values to CSS custom properties. All component styles reference these properties.

**Contrast validation:** The theme system should validate that key color pairings meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text). Build-time warning if a theme fails validation.

---

# 6. User Stories & Acceptance Criteria

## 6.1 Learner Stories

### US-L01: First Login
**As a** learner, **I want to** sign in with my existing work account and immediately see what the training is about, **so that** I can start without creating a new account or remembering another password.

**Acceptance Criteria:**
- Login page shows a single "Sign in with [Provider]" button.
- Clicking it redirects to my organization's identity provider.
- After authenticating, I'm redirected back and a user record is created automatically.
- I land on the course overview page with title, description, estimated time, module list, and objectives.
- A "Start Course" button begins at Module 1, Lesson 1.

### US-L02: Reading a Lesson
**As a** learner, **I want to** read through content at my own pace without distraction, **so that** I can focus on understanding the material.

**Acceptance Criteria:**
- Content renders on a single scrollable page. All content types render inline.
- Forward/back buttons always visible. Sidebar reflects current position.
- "Lesson X of Y · ~Z min" shown in the header.
- Scrolling to the bottom of the lesson is sufficient to mark it as viewed.

### US-L03: Understanding a Term I Don't Know
**As a** learner encountering an unfamiliar term, **I want to** see its definition immediately without losing my place.

**Acceptance Criteria:**
- Glossary terms are visually distinct (subtle dotted underline).
- Click shows a popover with the definition and a "View in Glossary" link.
- Dismissible with click-away or Escape. Focus returns to reading position.

### US-L04: Testing My Understanding
**As a** learner finishing a module, **I want to** check whether I understood the key concepts.

**Acceptance Criteria:**
- Knowledge check begins after the last lesson or is navigable from the sidebar.
- One question at a time. Immediate feedback with explanation after each answer.
- Summary at end with score, missed concepts, and lesson links.
- Module marked complete on finishing, regardless of score.

### US-L05: Making a Decision in a Scenario
**As a** learner, **I want to** practice applying concepts in a realistic situation, **so that** I build judgment.

**Acceptance Criteria:**
- Scenario and options clearly presented. Clickable with clear hover/focus states.
- After selecting, explanations for all options revealed. Recommended approach highlighted.
- No penalty for any selection.

### US-L06: Pausing and Coming Back Later
**As a** learner who can't finish in one sitting, **I want to** resume exactly where I left off.

**Acceptance Criteria:**
- On login, a "Continue where you left off" prompt shows the current lesson.
- Clicking it navigates directly to that lesson.
- All prior completion states intact.

### US-L07: Asking a Question About the Material
**As a** learner confused by a concept, **I want to** ask a question and get a relevant answer without leaving my lesson.

**Acceptance Criteria:**
- AI panel opens from a clearly visible button without page navigation.
- Response is relevant to the current lesson's topic.
- Off-topic questions get a polite redirect.
- If the AI service is unavailable, a clear error message is shown.

### US-L08: Searching for Something I Remember Reading
**As a** learner, **I want to** search for a concept I saw earlier without clicking through every lesson.

**Acceptance Criteria:**
- Search accessible from sidebar and header.
- Returns results from lesson content, glossary, and titles with context and direct links.
- Fast (< 1 second).

### US-L09: Completing the Course
**As a** learner who has finished all modules, **I want to** see confirmation of what I accomplished.

**Acceptance Criteria:**
- Course shows "Completed." Completion page shows date, time, module scores.
- If enabled: downloadable certificate with name, course, and date.

### US-L10: Downloading a Resource
**As a** learner, **I want to** download supporting materials referenced in a lesson.

**Acceptance Criteria:**
- Download card visible inline. One click to download. File type and size indicated.

### US-L11: Printing a Lesson
**As a** learner, **I want to** print a lesson for offline reference.

**Acceptance Criteria:**
- Browser print produces a clean document. Chrome removed. Tooltips rendered as inline definitions. Images and diagrams print correctly.

## 6.2 Admin Stories

### US-A01: Accessing the Admin Area
**As a** client admin, **I want to** access all management tools from one place without losing my learner experience.

**Acceptance Criteria:**
- "Admin" link visible in top nav (admin-role users only).
- Admin area has tabs: Dashboard, Users, Settings, Feedback.
- Can return to learner experience at any time. Learner progress unaffected by admin actions.

### US-A02: Checking Adoption at a Glance
**As a** client admin, **I want to** see how many people have completed the training in under a minute.

**Acceptance Criteria:**
- Dashboard loads in < 2 seconds. Shows total users, completed, in progress, not started, average completion %, average time.
- Data is current. Empty state message if no users enrolled yet.

### US-A03: Finding Who Is Falling Behind
**As a** client admin, **I want to** see which users haven't started or have stalled.

**Acceptance Criteria:**
- User table sortable by status, last active, completion %. Filterable by status.
- Users inactive 14+ days are flagged.

### US-A04: Identifying Content Problems
**As a** client admin, **I want to** see where learners are dropping off.

**Acceptance Criteria:**
- Module completion funnel shows % completing each module. Drop-offs visually obvious.

### US-A05: Exporting Data
**As a** client admin, **I want to** export progress data as a CSV.

**Acceptance Criteria:**
- One-click download. Contains: name, email, enrollment date, last active, status, completion %, time spent, per-module status/scores. Timestamped filename.

### US-A06: Managing Users and Access
**As a** client admin, **I want to** see everyone who has accessed the platform and control who can use it.

**Acceptance Criteria:**
- User list shows everyone who has logged in via OAuth.
- Can promote/demote roles, deactivate (blocks access, retains data), and remove users.
- Can pre-enroll email addresses via CSV. Pre-enrolled users show as "Not started (pre-enrolled)."
- If group-based access control is configured, users outside the group see "Access denied."

### US-A07: Configuring the AI Features
**As a** client admin, **I want to** enter an API key and select a model so that all AI features work.

**Acceptance Criteria:**
- Settings page has "AI Configuration" section with masked key input, model dropdown, and enable/disable toggle.
- "Test Connection" button verifies the key works.
- When enabled, AI assistant and live exercises are available to learners. When disabled, they are hidden.
- If enabled without a key, the page warns and learners see "not configured" instead of an error.

## 6.3 Consulting Team Stories

### US-S01: Rebranding for a New Client
**As a** consultant, **I want to** change all branding in under 30 minutes.

**Acceptance Criteria:**
- Edit theme YAML, replace logo/favicon. No application code modified.
- Container rebuild (or restart if volume-mounted) applies changes.
- Login page, header, and certificates all reflect new branding.

### US-S02: Editing Course Content
**As a** content author who is not a developer, **I want to** edit lesson text and interactive elements in a format I can understand.

**Acceptance Criteria:**
- Lessons are MDX files with clear naming conventions.
- A README explains: file structure, how to write prose, how to insert each component (with copy-paste examples).
- A **component reference guide** documents every MDX component with props, visual preview, and example usage.
- Container rebuild reflects changes.

### US-S03: Adding a New Course
**As a** consultant, **I want to** add a second course to an existing deployment.

**Acceptance Criteria:**
- Create a new course directory with the standard file structure. Rebuild.
- Platform automatically switches from single-course to catalog mode.
- Existing learner progress unaffected. New course has independent tracking.

### US-S04: Deploying to a Client's Infrastructure
**As a** consultant handing off the platform, **I want to** give the client a self-hostable package.

**Acceptance Criteria:**
- Deliverable: Docker Compose file with app + Postgres containers.
- Documentation covers: how to run, environment variables, OAuth provider registration (step-by-step for Microsoft Entra ID and Google Workspace), Postgres connection (bundled or external), database backup/restore, content updates, admin onboarding.
- Client IT team can deploy without consulting team assistance.

---

# 7. Phased Delivery Plan

Phases are defined by **dependency logic**. Each phase builds on the previous and produces a functional deliverable. Timeline estimates are relative.

## Phase 1: Content Foundation
**Goal:** All course content viewable in the platform. Core reading and navigation experience works.
**Depends on:** Nothing.

| ID | Feature | Priority |
|----|---------|----------|
| F-L01 | Course overview page | Required |
| F-L02 | Lesson content rendering from MDX | Required |
| F-L03 | Embedded interactive examples | Required |
| F-L06 | Sidebar navigation and progress map (visual only — no persistence) | Required |
| F-L07 | Inline glossary tooltips | Required |
| F-L08 | Full glossary page | Required |
| F-P03 | Theming system with at least two themes | Required |
| — | Docker Compose build, Postgres setup, deployment to staging | Required |
| — | Platform component library (initial set) and Storybook | Required |

**Deliverable:** Working, browsable app on a staging URL. Content stakeholders review for accuracy and flow. No auth required at this stage.
**Estimated effort:** 1–2 weeks.

## Phase 2: Interactivity
**Goal:** Learning experience goes from passive reading to active engagement.
**Depends on:** Phase 1.

| ID | Feature | Priority |
|----|---------|----------|
| F-L09 | Reflection prompts | Required |
| F-L10 | Knowledge checks (all question types + feedback) | Required |
| F-L11 | Scenario-based decision points | Required |
| F-L04 | Embedded video support | Required |
| F-L05 | Downloadable resource cards | Required |
| F-P07 | Print stylesheet | Nice to have |

**Deliverable:** Fully interactive course. Still open access for review.
**Estimated effort:** 1 week.

## Phase 3: Users & Persistence
**Goal:** Real users log in, track progress, and resume where they left off.
**Depends on:** Phase 2.

| ID | Feature | Priority |
|----|---------|----------|
| F-P01 | OAuth authentication (Microsoft Entra ID + Google Workspace + OIDC) | Required |
| F-L13 | Session persistence and bookmarking | Required |
| F-L16 | Course completion state and summary | Required |
| F-A03 | User management (role assignment, deactivation, pre-enrollment) | Required |
| F-P02 | Adaptive course display (single vs. catalog mode) | Required |
| F-P06 | Error handling and edge cases | Required |

**Deliverable:** Working platform with user accounts. Pilot users can complete the full course.
**Estimated effort:** 1–1.5 weeks.

## Phase 4: Admin Visibility
**Goal:** Client administrators see adoption metrics and export data.
**Depends on:** Phase 3 (tracking data must exist).

| ID | Feature | Priority |
|----|---------|----------|
| F-A00 | Admin area with tabbed navigation | Required |
| F-A01 | Dashboard with metrics and completion funnel | Required |
| F-A02 | User detail table and CSV export | Required |
| F-A04 | Platform settings (AI config, OAuth display, theme) | Required |
| F-A05 | Content feedback mechanism | Nice to have |
| F-L15 | Content search | Required |
| F-P05 | Accessibility audit and remediation | Required |
| F-P04 | Responsive layout testing and fixes | Required |

**Deliverable:** Complete platform minus AI features. Ready for broader rollout.
**Estimated effort:** 1 week.

## Phase 5: AI Features
**Goal:** AI learning assistant and AI-powered exercises are available.
**Depends on:** Phase 3 (auth and context required). Can develop in parallel with Phase 4.

| ID | Feature | Priority |
|----|---------|----------|
| F-L14 | AI learning assistant (contextual chat panel) | Required |
| F-L12 | Hands-on exercises (framework + at least one type) | Required |
| F-A04 | AI config: test connection, enable/disable, model selection | Required |
| F-P08 | Content versioning handling | Nice to have |

**Deliverable:** Complete platform. All features functional.
**Estimated effort:** 1 week.

## Phase 6: Production Hardening & Handoff
**Goal:** Production-ready. Client can self-host.
**Depends on:** All previous phases.

| Task | Notes |
|------|-------|
| Content review and revisions | Based on stakeholder feedback |
| Client branding finalized | Apply theme, validate all pages |
| Performance testing | Validate load times and concurrency targets |
| Security review | OAuth flow, input sanitization, API key handling |
| Deployment documentation | Docker Compose, OAuth setup guides, backup/restore, content updates |
| Component reference guide | Finalize Storybook with all components documented |
| Client handoff meeting | Walk through admin functions, deployment, and maintenance |

**Estimated effort:** 3–5 days.

---

# 8. Appendix: Future Enhancements

Items explicitly deferred from the initial build. Architectural decisions should account for these so they don't require major refactoring:

- **SAML support** for clients whose identity providers use SAML instead of OIDC.
- **Content hot-reload** without container rebuild (volume-mounted content with file watcher).
- **In-app content editing** for non-developers (simple CMS layer).
- **Multi-language / internationalization** support.
- **Completion certificates** with customizable templates.
- **Course prerequisites enforcement** (course B requires completion of course A).
- **Analytics expansion:** per-question miss rates, time-per-lesson distributions, cohort analysis.
- **LMS integration** (SCORM/xAPI export) if client demand justifies complexity.
- **Notification system** (email reminders for incomplete training — requires email infrastructure).
