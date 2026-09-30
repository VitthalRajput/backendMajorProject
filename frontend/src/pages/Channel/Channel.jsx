import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import usersApi from '../../api/users.api.js';
import videosApi from '../../api/videos.api.js';
import tweetsApi from '../../api/tweets.api.js';
import playlistsApi from '../../api/playlists.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ChannelAvatar from '../../components/common/ChannelAvatar.jsx';
import SubscribeButton from '../../components/common/SubscribeButton.jsx';
import VideoGrid from '../../components/video/VideoGrid.jsx';
import TweetComposer from '../../components/tweet/TweetComposer.jsx';
import TweetCard from '../../components/tweet/TweetCard.jsx';
import PlaylistCard from '../../components/playlist/PlaylistCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import formatViews from '../../utils/formatViews.js';
import { MessageSquare, ListVideo } from 'lucide-react';

export const Channel = () => {
  const { username } = useParams();
  const { user } = useAuth();

  const [channel, setChannel] = useState(null);
  const [loadingChannel, setLoadingChannel] = useState(true);
  const [channelError, setChannelError] = useState(null);

  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'tweets' | 'playlists'

  // Tab data states
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const [tweets, setTweets] = useState([]);
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [tweetSubmitting, setTweetSubmitting] = useState(false);

  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const isOwner = user && channel && user._id === channel._id;

  // Fetch channel profile
  const fetchChannel = useCallback(async () => {
    if (!username) return;
    setLoadingChannel(true);
    setChannelError(null);

    try {
      const data = await usersApi.getUserChannelProfile(username);
      setChannel(data);
    } catch (err) {
      console.error('Failed to load channel profile:', err);
      setChannelError(err.response?.data?.message || err.message || 'Channel not found');
    } finally {
      setLoadingChannel(false);
    }
  }, [username]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  // Load active tab content
  useEffect(() => {
    if (!channel?._id) return;

    if (activeTab === 'videos') {
      const fetchVideos = async () => {
        setLoadingVideos(true);
        try {
          const res = await videosApi.getAllVideos({ userId: channel._id });
          setVideos(res?.docs || (Array.isArray(res) ? res : []));
        } catch (err) {
          console.warn('Failed to load channel videos:', err);
        } finally {
          setLoadingVideos(false);
        }
      };
      fetchVideos();
    } else if (activeTab === 'tweets') {
      const fetchTweets = async () => {
        setLoadingTweets(true);
        try {
          const res = await tweetsApi.getUserTweets(channel._id);
          setTweets(Array.isArray(res) ? res : []);
        } catch (err) {
          console.warn('Failed to load channel tweets:', err);
        } finally {
          setLoadingTweets(false);
        }
      };
      fetchTweets();
    } else if (activeTab === 'playlists') {
      const fetchPlaylists = async () => {
        setLoadingPlaylists(true);
        try {
          const res = await playlistsApi.getUserPlaylists(channel._id);
          setPlaylists(Array.isArray(res) ? res : []);
        } catch (err) {
          console.warn('Failed to load channel playlists:', err);
        } finally {
          setLoadingPlaylists(false);
        }
      };
      fetchPlaylists();
    }
  }, [channel?._id, activeTab]);

  // Tweet action handlers
  const handleCreateTweet = async (content) => {
    setTweetSubmitting(true);
    try {
      const res = await tweetsApi.createTweet(content);
      const created = res?.tweet || res;
      if (created) {
        const formatted = {
          ...created,
          owner: {
            username: channel.username,
            fullName: channel.fullName,
            avatar: channel.avatar,
          },
        };
        setTweets((prev) => [formatted, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create tweet:', err);
    } finally {
      setTweetSubmitting(false);
    }
  };

  const handleUpdateTweet = async (tweetId, newContent) => {
    await tweetsApi.updateTweet(tweetId, newContent);
    setTweets((prev) =>
      prev.map((t) => (t._id === tweetId ? { ...t, content: newContent } : t))
    );
  };

  const handleDeleteTweet = async (tweetId) => {
    await tweetsApi.deleteTweet(tweetId);
    setTweets((prev) => prev.filter((t) => t._id !== tweetId));
  };

  if (channelError) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <ErrorState message={channelError} onRetry={fetchChannel} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Cover Banner */}
      <div
        style={{
          width: '100%',
          height: '200px',
          backgroundColor: 'var(--surface-card)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {loadingChannel ? (
          <Skeleton width="100%" height="200px" borderRadius="0" />
        ) : channel?.coverImage ? (
          <img
            src={channel.coverImage}
            alt="Channel banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #181818 0%, #262626 100%)',
            }}
          />
        )}
      </div>

      {/* Profile Header */}
      <div style={{ padding: '0 32px' }}>
        <div
          className="channel-header-inner"
          style={{
            marginTop: '-40px',
            marginBottom: '24px',
            position: 'relative',
          }}
        >
          {/* Avatar & User Details */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
            <ChannelAvatar
              avatar={channel?.avatar}
              username={channel?.username}
              fullName={channel?.fullName}
              size={110}
              style={{
                border: '4px solid var(--surface-base)',
                boxShadow: 'var(--shadow-md)',
              }}
            />

            <div style={{ paddingBottom: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {channel?.fullName || channel?.username}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 500 }}>@{channel?.username}</span>
                <span>•</span>
                <span>{formatViews(channel?.subscribersCount || 0)} subscribers</span>
                <span>•</span>
                <span>{formatViews(channel?.channelsSubscribedToCount || 0)} subscribed</span>
              </div>
            </div>
          </div>

          {/* Action: Subscribe */}
          {channel && (
            <div style={{ paddingBottom: '8px' }}>
              <SubscribeButton
                channelId={channel._id}
                initialSubscribed={channel.isSubscribed || false}
                onToggle={(isSub) => {
                  setChannel((prev) =>
                    prev
                      ? {
                          ...prev,
                          isSubscribed: isSub,
                          subscribersCount: Math.max(
                            0,
                            prev.subscribersCount + (isSub ? 1 : -1)
                          ),
                        }
                      : null
                  );
                }}
              />
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '24px',
          }}
        >
          {[
            { id: 'videos', label: 'Videos' },
            { id: 'tweets', label: 'Tweets' },
            { id: 'playlists', label: 'Playlists' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 4px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  borderBottom: `3px solid ${isActive ? 'var(--brand-primary)' : 'transparent'}`,
                  transition: 'color var(--transition-fast), border-color var(--transition-fast)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'videos' && (
          <VideoGrid
            videos={videos}
            loading={loadingVideos}
            emptyTitle="No videos uploaded yet"
            emptyDescription="When videos are published by this channel, they will appear here."
          />
        )}

        {activeTab === 'tweets' && (
          <div style={{ maxWidth: '720px' }}>
            {/* Show composer only if current user is channel owner */}
            {isOwner && (
              <TweetComposer
                onSubmit={handleCreateTweet}
                loading={tweetSubmitting}
              />
            )}

            {loadingTweets ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height="120px" borderRadius="var(--radius-lg)" />
                ))}
              </div>
            ) : tweets.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No tweets yet"
                description={
                  isOwner
                    ? 'Start the conversation by posting an update for your subscribers!'
                    : 'This channel has not posted any community updates yet.'
                }
              />
            ) : (
              tweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  onUpdate={handleUpdateTweet}
                  onDelete={handleDeleteTweet}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div>
            {loadingPlaylists ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height="220px" borderRadius="var(--radius-lg)" />
                ))}
              </div>
            ) : playlists.length === 0 ? (
              <EmptyState
                icon={ListVideo}
                title="No playlists created yet"
                description="Playlists created by this channel will be displayed here."
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist._id} playlist={playlist} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;
