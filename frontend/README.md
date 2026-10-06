# StreamCore — Production Video Hosting Frontend

StreamCore is a production-grade, responsive dark-themed video hosting platform frontend built with **React**, **Vite**, **React Router DOM**, **Axios**, and **Lucide React**. It is designed to match modern streaming UI standards and connects 1:1 with the StreamCore Express + MongoDB backend.

---

## 🚀 Features

- **Home Feed (`/`)**:
  - Responsive 4-column video grid with custom thumbnails, durations, channel avatars, view counts, and relative upload dates.
  - Live debounced search querying the backend API without page reloads.
- **Watch Page (`/watch/:videoId`)**:
  - 70/30 split view layout on desktop.
  - Native 16:9 HTML5 video player powered by Cloudinary streams.
  - Channel info with live subscriber counts and Subscribe / Unsubscribe toggle.
  - Video like pill with server-synchronized like status and counts.
  - Save to Playlist modal for quick curation and on-the-fly playlist creation.
  - Rounded expandable description panel with views and formatted timestamps.
  - Video comments section with creation, editing, deletion, and comment liking.
  - Vertical recommendation column showing related videos.
- **Channel Profile (`/c/:username`)**:
  - Channel cover banner and high-resolution channel avatar.
  - Channel metrics (subscribers count, channels subscribed to).
  - Multi-tab view: **Videos**, **Playlists**, and **Tweets** (Community updates).
  - Tweet composer allowing creators to publish, edit, and delete status updates.
- **Studio Dashboard (`/studio/dashboard`)**:
  - Analytics cards: Total Views, Total Subscribers, Total Videos, and Total Likes.
  - Video Management Table: Title, thumbnail, views, likes, upload date, and live publish toggle switch (`isPublished`).
  - Edit video metadata (title, description, and thumbnail replacement).
  - Video deletion with confirmation modal.
- **Playlist Detail (`/playlist/:playlistId`)**:
  - Hero card showcasing playlist cover art, title, description, owner link, total video count, and cumulative views.
  - "Play All" continuous playback entrypoint.
  - Interactive video list with owner controls to remove individual videos or delete the playlist.
- **Liked Videos (`/liked-videos`) & History (`/history`)**:
  - Dedicated pages displaying user's liked videos and watch history with clear empty states and authentication prompts.
- **Global App Shell & Navigation**:
  - Topbar with hamburger toggle, brand logo, live search bar, "+ Upload" modal trigger, and user profile avatar / Auth dropdown.
  - Collapsible Sidebar with navigation items, active route highlighting, and real-time Subscriptions list.
  - Seamless JWT session handling with access token / refresh token rotation and credentials support.

---

## 🎨 Design System Tokens

The application strictly implements the design system specification:

```css
--surface-base: #0F0F0F;       /* Primary canvas background */
--surface-raised: #181818;     /* Panels, sidebars, cards */
--surface-card: #212121;       /* Elevating card elements */
--surface-hover: #272727;      /* Hover states */

--border-subtle: #303030;      /* Dividers and borders */
--brand-primary: #FF0033;      /* Red accent brand color */
--brand-hover: #E6002E;

--text-primary: #FFFFFF;       /* High-contrast headings and titles */
--text-secondary: #AAAAAA;     /* Metadata and secondary text */
--text-muted: #717171;         /* Timestamps, icons */

--status-success: #22C55E;     /* Published badges and success states */
--status-danger: #EF4444;      /* Destructive actions and delete buttons */
```

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **H1**: 22px / 700
- **H2**: 18px / 600
- **Body**: 14px / 400
- **Meta**: 12px / 400

---

## 📁 Directory Structure

```text
frontend/
├── src/
│   ├── api/                   # 1:1 Backend API modules
│   │   ├── axios.js           # Axios instance with auth interceptor & refresh loop
│   │   ├── auth.api.js        # Register, login, logout, current-user
│   │   ├── users.api.js       # Channels, history, avatars, profile
│   │   ├── videos.api.js      # Video feed, detail, upload, publish toggle
│   │   ├── comments.api.js    # Comments CRUD
│   │   ├── likes.api.js       # Video/comment/tweet like toggles & list
│   │   ├── subscriptions.api.js # Subscribe toggle, subscriber channels
│   │   ├── playlists.api.js   # Playlist CRUD and item management
│   │   ├── tweets.api.js      # Community tweets CRUD
│   │   └── dashboard.api.js   # Channel analytics & video tables
│   │
│   ├── assets/                # Logos and icons
│   │
│   ├── components/            # Custom modular React components
│   │   ├── common/            # Avatar, modals, dialogs, buttons, fallbacks, skeletons
│   │   ├── navigation/        # Topbar, Sidebar, SidebarItem
│   │   ├── video/             # VideoCard, HorizontalVideoCard, VideoGrid, DescriptionBox
│   │   ├── comments/          # CommentInput, CommentCard
│   │   ├── tweet/             # TweetComposer, TweetCard
│   │   ├── playlist/          # PlaylistCard, PlaylistSaveButton
│   │   ├── studio/            # MetricCard, StudioVideoTable, StudioVideoRow, EditVideoModal
│   │   └── upload/            # UploadModal with progress and Cloudinary upload
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # User session, JWT token sync, global auth state
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx     # App shell with Topbar, responsive Sidebar, and Outlet
│   │
│   ├── pages/
│   │   ├── Home/              # Feed & search results
│   │   ├── Watch/             # Video player & recommendations
│   │   ├── Channel/           # Profile, videos, playlists, tweets
│   │   ├── Studio/            # Creator dashboard & video management
│   │   ├── LikedVideos/       # Saved likes
│   │   ├── History/           # Watch history
│   │   └── Playlists/         # Playlist detail page
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx      # Route declarations
│   │
│   ├── styles/
│   │   ├── variables.css      # Design tokens
│   │   ├── globals.css        # Reset, typography, utility classes
│   │   └── responsive.css     # Media queries for 1440px, 1280px, 1024px, 768px, 480px
│   │
│   ├── utils/
│   │   ├── formatViews.js     # View counter formatter (e.g., 324K, 1.2M)
│   │   ├── formatDuration.js  # Seconds to MM:SS or HH:MM:SS
│   │   ├── relativeTime.js    # Relative date calculator (e.g., 6 days ago)
│   │   └── formatDate.js      # Full date formatter
│   │
│   ├── App.jsx                # Router & Context provider root
│   └── main.jsx               # React 19 root bootstrap
│
├── .env                       # Environment variables
├── .env.example
├── package.json
└── vite.config.js
```

---

## 🛠️ Setup & Running

### 1. Prerequisites
- Node.js (v18+)
- Backend server running on `http://localhost:8000` (or configured API URL)

### 2. Environment Configuration
Create or verify `.env` inside `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Development Server
```bash
npm run dev
```
By default, the Vite dev server starts at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
```
Generates production-optimized static assets in `frontend/dist/`.

### 6. Linting
```bash
npm run lint
```
