# StreamCore Frontend-Backend API Mapping

This document provides a 1:1 inventory of all backend API endpoints in StreamCore, their authentication requirements, parameters, payload structures, responses, and how they map directly to frontend components and services.

---

## 1. Authentication & User Endpoints (`/api/v1/users`)

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body / Multipart Fields | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/users/register` | No | None | None | `multipart/form-data`<br>- `fullName` (text, req)<br>- `email` (text, req)<br>- `username` (text, req, lowercase)<br>- `password` (text, req)<br>- `avatar` (file, req)<br>- `coverImage` (file, opt) | `{ statusCode: 201, data: User, message: "User registered Successfully" }` | Registers a new user account.<br>Used in: `AuthModal.jsx` |
| **POST** | `/api/v1/users/login` | No | None | None | `application/json`<br>- `email` or `username` (req)<br>- `password` (req) | `{ statusCode: 200, data: { user: User, accessToken: string, refreshToken: string }, message: "User logged in Successfully" }` | Authenticates user; sets HTTP-only cookies and returns tokens for Bearer storage.<br>Used in: `AuthModal.jsx`, `AuthContext.jsx` |
| **POST** | `/api/v1/users/logout` | Yes (`verifyJWT`) | None | None | None | `{ statusCode: 200, data: {}, message: "User logged Out" }` | Clears refresh token on server and removes client cookies/tokens.<br>Used in: `Topbar.jsx`, `AuthContext.jsx` |
| **POST** | `/api/v1/users/refresh-token` | No (Cookie/Body) | None | None | `application/json`<br>- `refreshToken` (opt if cookie set) | `{ statusCode: 200, data: { accessToken: string, refreshToken: string }, message: "Access token refreshed" }` | Silently refreshes expired access token.<br>Used in: `axios.js` interceptor |
| **POST** | `/api/v1/users/change-password` | Yes (`verifyJWT`) | None | None | `application/json`<br>- `oldPassword` (req)<br>- `newPassword` (req) | `{ statusCode: 200, data: {}, message: "Password changed successfully" }` | Changes password of the authenticated user.<br>Used in: `users.api.js` |
| **GET** | `/api/v1/users/current-user` | Yes (`verifyJWT`) | None | None | None | `{ statusCode: 200, data: User, message: "current user fetched successfully" }` | Verifies active session on page load.<br>Used in: `AuthContext.jsx` |
| **PATCH** | `/api/v1/users/update-account` | Yes (`verifyJWT`) | None | None | `application/json`<br>- `fullName` (req)<br>- `email` (req) | `{ statusCode: 200, data: User, message: "Account details updated successfully" }` | Updates current user's profile information.<br>Used in: `users.api.js`, `Channel.jsx` |
| **PATCH** | `/api/v1/users/avatar` | Yes (`verifyJWT`) | None | None | `multipart/form-data`<br>- `avatar` (file, req) | `{ statusCode: 200, data: User, message: "Avatar image updated successfully" }` | Uploads new channel avatar to Cloudinary.<br>Used in: `users.api.js`, `Channel.jsx` |
| **PATCH** | `/api/v1/users/cover-image` | Yes (`verifyJWT`) | None | None | `multipart/form-data`<br>- `coverImage` (file, req) | `{ statusCode: 200, data: User, message: "cover image updated successfully" }` | Uploads new channel banner to Cloudinary.<br>Used in: `users.api.js`, `Channel.jsx` |
| **GET** | `/api/v1/users/c/:username` | Yes (`verifyJWT`) | `username` | None | None | `{ statusCode: 200, data: { _id, username, email, fullName, avatar, coverImage, subscribersCount, channelsSubscribedToCount, isSubscribed }, message: "User channel fetched successfully" }` | Fetches public channel profile with subscription counters and status.<br>Used in: `Channel.jsx` |
| **GET** | `/api/v1/users/history` | Yes (`verifyJWT`) | None | None | None | `{ statusCode: 200, data: [Video & { owner: User }], message: "watch history fetched successfully" }` | Retrieves list of watched videos ordered by recently viewed.<br>Used in: `History.jsx` |

---

## 2. Videos Endpoints (`/api/v1/videos`)

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body / Multipart Fields | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/videos` | No | None | `page`, `limit`, `query`, `sortBy`, `sortType`, `userId` | None | `{ statusCode: 200, data: [Video & { owner: User }], message: "Videos fetched successfully" }` | Fetches paginated videos feed, search results, or user uploads.<br>Used in: `Home.jsx`, `Topbar.jsx` (Search), `Channel.jsx` |
| **POST** | `/api/v1/videos` | Yes (`verifyJWT`) | None | None | `multipart/form-data`<br>- `title` (text, req)<br>- `description` (text, req)<br>- `videoFile` (file, req)<br>- `thumbnail` (file, req) | `{ statusCode: 200, data: Video, message: "Video uploaded successfully" }` | Uploads video and thumbnail to Cloudinary.<br>Used in: `UploadModal.jsx` |
| **GET** | `/api/v1/videos/:videoId` | No | `videoId` | None | None | `{ statusCode: 200, data: Video & { owner: User }, message: "Video fetched successfully" }` | Fetches video details and increments view count.<br>Used in: `Watch.jsx` |
| **PATCH** | `/api/v1/videos/:videoId` | Yes (`verifyJWT`) | `videoId` | None | `multipart/form-data`<br>- `title` (text, req)<br>- `description` (text, req)<br>- `thumbnail` (file, opt) | `{ statusCode: 200, data: Video, message: "Video updated successfully" }` | Updates video metadata and optional new thumbnail.<br>Used in: `EditVideoModal.jsx` |
| **DELETE** | `/api/v1/videos/:videoId` | Yes (`verifyJWT`) | `videoId` | None | None | `{ statusCode: 200, data: {}, message: "Video deleted successfully" }` | Deletes video record from database.<br>Used in: `StudioVideoRow.jsx`, `StudioDashboard.jsx` |
| **PATCH** | `/api/v1/videos/toggle/publish/:videoId` | Yes (`verifyJWT`) | `videoId` | None | None | `{ statusCode: 200, data: Video, message: "Video publish status toggled successfully" }` | Toggles video `isPublished` visibility status.<br>Used in: `PublishToggle.jsx`, `StudioDashboard.jsx` |

---

## 3. Likes Endpoints (`/api/v1/likes`)

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/likes/toggle/v/:videoId` | Yes (`verifyJWT`) | `videoId` | None | None | `{ statusCode: 200, data: {}, message: "Liked video successfully" / "Unliked video successfully" }` | Toggles like on a video.<br>Used in: `LikeButton.jsx`, `Watch.jsx` |
| **POST** | `/api/v1/likes/toggle/c/:commentId` | Yes (`verifyJWT`) | `commentId` | None | None | `{ statusCode: 200, data: {}, message: "Liked comment successfully" / "Unliked comment successfully" }` | Toggles like on a comment.<br>Used in: `CommentCard.jsx` |
| **POST** | `/api/v1/likes/toggle/t/:tweetId` | Yes (`verifyJWT`) | `tweetId` | None | None | `{ statusCode: 200, data: {}, message: "Liked tweet successfully" / "Unliked tweet successfully" }` | Toggles like on a community tweet.<br>Used in: `TweetCard.jsx` |
| **GET** | `/api/v1/likes/videos` | Yes (`verifyJWT`) | None | None | None | `{ statusCode: 200, data: [Video & { owner: User }], message: "Liked videos fetched successfully" }` | Retrieves all videos liked by authenticated user.<br>Used in: `LikedVideos.jsx` |

---

## 4. Subscriptions Endpoints (`/api/v1/subscriptions`)

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/subscriptions/c/:channelId` | Yes (`verifyJWT`) | `channelId` | None | None | `{ statusCode: 200, data: {}, message: "Subscribed to channel successfully" / "Unsubscribed from channel successfully" }` | Toggles subscription status to a channel.<br>Used in: `SubscribeButton.jsx`, `Watch.jsx`, `Channel.jsx` |
| **GET** | `/api/v1/subscriptions/c/:channelId` | Yes (`verifyJWT`) | `channelId` | None | None | `{ statusCode: 200, data: [{ _id, subscriber: { _id, username, fullName, avatar } }], message: "Channel subscribers fetched successfully" }` | Lists all subscribers of the specified channel.<br>Used in: `subscriptions.api.js` |
| **GET** | `/api/v1/subscriptions/u/:subscriberId` | Yes (`verifyJWT`) | `subscriberId` | None | None | `{ statusCode: 200, data: [{ _id, channel: { _id, username, fullName, avatar } }], message: "Subscribed channels fetched successfully" }` | Fetches channels the user is subscribed to.<br>Used in: `Sidebar.jsx` |

---

## 5. Playlists Endpoints (`/api/v1/playlist`) *(Note: Singular `playlist` mount)*

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/playlist` | Yes (`verifyJWT`) | None | None | `application/json`<br>- `name` (req)<br>- `description` (req) | `{ statusCode: 201, data: Playlist, message: "Playlist created successfully" }` | Creates a new playlist for the user.<br>Used in: `PlaylistSaveButton.jsx`, `Channel.jsx` |
| **GET** | `/api/v1/playlist/user/:userId` | Yes (`verifyJWT`) | `userId` | None | None | `{ statusCode: 200, data: [Playlist & { totalVideos, totalViews }], message: "User playlists fetched successfully" }` | Lists all playlists owned by a user.<br>Used in: `Channel.jsx`, `PlaylistSaveButton.jsx` |
| **GET** | `/api/v1/playlist/:playlistId` | Yes (`verifyJWT`) | `playlistId` | None | None | `{ statusCode: 200, data: Playlist & { totalVideos, totalViews, videos: [Video], owner: User }, message: "Playlist fetched successfully" }` | Retrieves playlist details, video items, and owner.<br>Used in: `PlaylistDetail.jsx` |
| **PATCH** | `/api/v1/playlist/add/:videoId/:playlistId` | Yes (`verifyJWT`) | `videoId`, `playlistId` | None | None | `{ statusCode: 200, data: Playlist, message: "Video added to playlist successfully" }` | Adds a video to a user playlist.<br>Used in: `PlaylistSaveButton.jsx` |
| **PATCH** | `/api/v1/playlist/remove/:videoId/:playlistId` | Yes (`verifyJWT`) | `videoId`, `playlistId` | None | None | `{ statusCode: 200, data: Playlist, message: "Video removed from playlist successfully" }` | Removes video from user playlist.<br>Used in: `PlaylistDetail.jsx` |
| **PATCH** | `/api/v1/playlist/:playlistId` | Yes (`verifyJWT`) | `playlistId` | None | `application/json`<br>- `name` (req)<br>- `description` (req) | `{ statusCode: 200, data: Playlist, message: "Playlist updated successfully" }` | Updates playlist title and description.<br>Used in: `PlaylistDetail.jsx` |
| **DELETE** | `/api/v1/playlist/:playlistId` | Yes (`verifyJWT`) | `playlistId` | None | None | `{ statusCode: 200, data: {}, message: "Playlist deleted successfully" }` | Deletes user playlist.<br>Used in: `PlaylistDetail.jsx` |

---

## 6. Comments Endpoints (`/api/v1/comments`)

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/comments/:videoId` | Yes (`verifyJWT`) | `videoId` | `page`, `limit` | None | `{ statusCode: 200, data: [Comment & { owner: User, likesCount: number, isLiked: boolean }], message: "Comments fetched successfully" }` | Lists paginated comments for a video.<br>Used in: `Watch.jsx` |
| **POST** | `/api/v1/comments/:videoId` | Yes (`verifyJWT`) | `videoId` | None | `application/json`<br>- `content` (req) | `{ statusCode: 201, data: Comment, message: "Comment added successfully" }` | Adds a new comment on a video.<br>Used in: `CommentInput.jsx`, `Watch.jsx` |
| **PATCH** | `/api/v1/comments/c/:commentId` | Yes (`verifyJWT`) | `commentId` | None | `application/json`<br>- `content` (req) | `{ statusCode: 200, data: Comment, message: "Comment updated successfully" }` | Updates user's comment content.<br>Used in: `CommentCard.jsx` |
| **DELETE** | `/api/v1/comments/c/:commentId` | Yes (`verifyJWT`) | `commentId` | None | None | `{ statusCode: 200, data: {}, message: "Comment deleted successfully" }` | Deletes user's comment.<br>Used in: `CommentCard.jsx` |

---

## 7. Tweets / Community Endpoints (`/api/v1/tweets`)

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/tweets` | Yes (`verifyJWT`) | None | None | `application/json`<br>- `content` (req) | `{ statusCode: 201, data: Tweet, message: "Tweet created successfully" }` | Publishes a channel tweet/update.<br>Used in: `TweetComposer.jsx`, `Channel.jsx` |
| **GET** | `/api/v1/tweets/user/:userId` | Yes (`verifyJWT`) | `userId` | None | None | `{ statusCode: 200, data: [Tweet & { owner: User, likesCount: number, isLiked: boolean }], message: "Tweets fetched successfully" }` | Fetches community tweets for a channel.<br>Used in: `Channel.jsx` |
| **PATCH** | `/api/v1/tweets/:tweetId` | Yes (`verifyJWT`) | `tweetId` | None | `application/json`<br>- `content` (req) | `{ statusCode: 200, data: Tweet, message: "Tweet updated successfully" }` | Updates an existing tweet.<br>Used in: `TweetCard.jsx` |
| **DELETE** | `/api/v1/tweets/:tweetId` | Yes (`verifyJWT`) | `tweetId` | None | None | `{ statusCode: 200, data: {}, message: "Tweet deleted successfully" }` | Deletes a channel tweet.<br>Used in: `TweetCard.jsx` |

---

## 8. Studio Dashboard Endpoints (`/api/v1/dashboard`)

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/dashboard/stats` | Yes (`verifyJWT`) | None | None | None | `{ statusCode: 200, data: { totalVideos: number, totalViews: number, totalSubscribers: number, totalLikes: number }, message: "Channel stats fetched successfully" }` | Channel analytics overview metrics.<br>Used in: `StudioDashboard.jsx`, `MetricCard.jsx` |
| **GET** | `/api/v1/dashboard/videos` | Yes (`verifyJWT`) | None | None | None | `{ statusCode: 200, data: [Video & { totalLikes: number }], message: "Channel videos fetched successfully" }` | Table of uploaded videos with publish toggles, likes, and dates.<br>Used in: `StudioDashboard.jsx`, `StudioVideoTable.jsx` |

---

## 9. System / Healthcheck (`/api/v1/healthcheck`)

| Method | Endpoint | Auth Required | Request Params | Query Params | Request Body | Response Structure | Purpose & Frontend Component |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/healthcheck` | No | None | None | None | `{ statusCode: 200, data: {}, message: "OK" }` | Backend health check verification endpoint. |

