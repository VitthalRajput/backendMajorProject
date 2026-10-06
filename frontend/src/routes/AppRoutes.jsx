import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import Home from '../pages/Home/Home.jsx';
import Watch from '../pages/Watch/Watch.jsx';
import Channel from '../pages/Channel/Channel.jsx';
import StudioDashboard from '../pages/Studio/StudioDashboard.jsx';
import LikedVideos from '../pages/LikedVideos/LikedVideos.jsx';
import History from '../pages/History/History.jsx';
import PlaylistDetail from '../pages/Playlists/PlaylistDetail.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/watch/:videoId" element={<Watch />} />
        <Route path="/c/:username" element={<Channel />} />
        <Route path="/studio/dashboard" element={<StudioDashboard />} />
        <Route path="/liked-videos" element={<LikedVideos />} />
        <Route path="/history" element={<History />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

