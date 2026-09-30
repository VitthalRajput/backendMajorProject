# StreamCore Frontend-to-Backend API Mapping Audit

| Frontend Feature | HTTP Method | Backend Endpoint | React Page / Component | Status |
| :--- | :--- | :--- | :--- | :--- |
| **User Sign In** | `POST` | `/api/v1/users/login` | `AuthModal.jsx`, `AuthContext.jsx` | Integrated |
| **User Registration** | `POST` | `/api/v1/users/register` | `AuthModal.jsx`, `AuthContext.jsx` | Integrated |
| **User Sign Out** | `POST` | `/api/v1/users/logout` | `Topbar.jsx`, `AuthContext.jsx` | Integrated |
| **Fetch Current User** | `GET` | `/api/v1/users/current-user` | `AuthContext.jsx` | Integrated |
| **Refresh Access Token** | `POST` | `/api/v1/users/refresh-token` | `axios.js`, `auth.api.js` | Integrated |
| **Update Account Details** | `PATCH` | `/api/v1/users/update-account` | `users.api.js` | Integrated |
| **Update User Avatar** | `PATCH` | `/api/v1/users/avatar` | `users.api.js` | Integrated |
| **Update Cover Image** | `PATCH` | `/api/v1/users/cover-image` | `users.api.js` | Integrated |
| **Change Password** | `POST` | `/api/v1/users/change-password` | `auth.api.js` | Integrated |
| **User Channel Profile** | `GET` | `/api/v1/users/c/:username` | `Channel.jsx`, `Watch.jsx` | Integrated |
| **User Watch History** | `GET` | `/api/v1/users/history` | `History.jsx` | Integrated |
| **Home Video Feed** | `GET` | `/api/v1/videos` | `Home.jsx`, `VideoGrid.jsx` | Integrated |
| **Video Search** | `GET` | `/api/v1/videos?query={query}` | `Topbar.jsx`, `Home.jsx` | Integrated |
| **Channel Videos Feed** | `GET` | `/api/v1/videos?userId={userId}` | `Channel.jsx`, `VideoGrid.jsx` | Integrated |
| **Watch Video Details** | `GET` | `/api/v1/videos/:videoId` | `Watch.jsx` | Integrated |
| **Video Recommendations** | `GET` | `/api/v1/videos?limit=16` | `Watch.jsx`, `HorizontalVideoCard.jsx` | Integrated |
| **Publish / Upload Video** | `POST` | `/api/v1/videos` | `UploadModal.jsx` | Integrated |
| **Update Video Details** | `PATCH` | `/api/v1/videos/:videoId` | `EditVideoModal.jsx` | Integrated |
| **Delete Video** | `DELETE` | `/api/v1/videos/:videoId` | `StudioDashboard.jsx`, `StudioVideoRow.jsx` | Integrated |
| **Toggle Video Visibility** | `PATCH` | `/api/v1/videos/toggle/publish/:videoId` | `PublishToggle.jsx`, `StudioVideoRow.jsx` | Integrated |
| **Fetch Video Comments** | `GET` | `/api/v1/comments/:videoId` | `Watch.jsx` | Integrated |
| **Add Comment** | `POST` | `/api/v1/comments/:videoId` | `Watch.jsx`, `CommentInput.jsx` | Integrated |
| **Update Comment** | `PATCH` | `/api/v1/comments/c/:commentId` | `Watch.jsx`, `CommentCard.jsx` | Integrated |
| **Delete Comment** | `DELETE` | `/api/v1/comments/c/:commentId` | `Watch.jsx`, `CommentCard.jsx` | Integrated |
| **Toggle Video Like** | `POST` | `/api/v1/likes/toggle/v/:videoId` | `Watch.jsx`, `LikeButton.jsx` | Integrated |
| **Toggle Comment Like** | `POST` | `/api/v1/likes/toggle/c/:commentId` | `CommentCard.jsx`, `LikeButton.jsx` | Integrated |
| **Toggle Tweet Like** | `POST` | `/api/v1/likes/toggle/t/:tweetId` | `TweetCard.jsx`, `LikeButton.jsx` | Integrated |
| **Liked Videos Feed** | `GET` | `/api/v1/likes/videos` | `LikedVideos.jsx`, `VideoGrid.jsx` | Integrated |
| **Toggle Channel Subscription**| `POST`| `/api/v1/subscriptions/c/:channelId` | `SubscribeButton.jsx`, `Watch.jsx`, `Channel.jsx` | Integrated |
| **Get Channel Subscribers** | `GET` | `/api/v1/subscriptions/c/:channelId` | `subscriptions.api.js` | Integrated |
| **Get Subscribed Channels** | `GET` | `/api/v1/subscriptions/u/:subscriberId` | `Sidebar.jsx` | Integrated |
| **Create Playlist** | `POST` | `/api/v1/playlist` | `PlaylistSaveButton.jsx` | Integrated |
| **User Playlists Listing** | `GET` | `/api/v1/playlist/user/:userId` | `Channel.jsx`, `PlaylistSaveButton.jsx` | Integrated |
| **Playlist Detail & Videos** | `GET` | `/api/v1/playlist/:playlistId` | `PlaylistDetail.jsx` | Integrated |
| **Add Video to Playlist** | `PATCH` | `/api/v1/playlist/add/:videoId/:playlistId` | `PlaylistSaveButton.jsx` | Integrated |
| **Remove Video from Playlist**| `PATCH`| `/api/v1/playlist/remove/:videoId/:playlistId` | `PlaylistSaveButton.jsx`, `PlaylistDetail.jsx` | Integrated |
| **Update Playlist** | `PATCH` | `/api/v1/playlist/:playlistId` | `playlists.api.js` | Integrated |
| **Delete Playlist** | `DELETE` | `/api/v1/playlist/:playlistId` | `PlaylistDetail.jsx` | Integrated |
| **Create Tweet** | `POST` | `/api/v1/tweets` | `Channel.jsx`, `TweetComposer.jsx` | Integrated |
| **Get User Tweets** | `GET` | `/api/v1/tweets/user/:userId` | `Channel.jsx`, `TweetCard.jsx` | Integrated |
| **Update Tweet** | `PATCH` | `/api/v1/tweets/:tweetId` | `Channel.jsx`, `TweetCard.jsx` | Integrated |
| **Delete Tweet** | `DELETE` | `/api/v1/tweets/:tweetId` | `Channel.jsx`, `TweetCard.jsx` | Integrated |
| **Creator Studio Stats** | `GET` | `/api/v1/dashboard/stats` | `StudioDashboard.jsx`, `MetricCard.jsx` | Integrated |
| **Creator Studio Videos** | `GET` | `/api/v1/dashboard/videos` | `StudioDashboard.jsx`, `StudioVideoTable.jsx` | Integrated |
| **Server Healthcheck** | `GET` | `/api/v1/healthcheck` | `healthcheck.api.js` | Integrated |
