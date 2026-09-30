import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import videosApi from '../../api/videos.api.js';
import commentsApi from '../../api/comments.api.js';
import usersApi from '../../api/users.api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import ChannelAvatar from '../../components/common/ChannelAvatar.jsx';
import SubscribeButton from '../../components/common/SubscribeButton.jsx';
import LikeButton from '../../components/common/LikeButton.jsx';
import PlaylistSaveButton from '../../components/playlist/PlaylistSaveButton.jsx';
import DescriptionBox from '../../components/video/DescriptionBox.jsx';
import HorizontalVideoCard from '../../components/video/HorizontalVideoCard.jsx';
import CommentInput from '../../components/comments/CommentInput.jsx';
import CommentCard from '../../components/comments/CommentCard.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import formatViews from '../../utils/formatViews.js';

export const Watch = () => {
  const { videoId } = useParams();
  const { user } = useAuth();

  // Video state
  const [video, setVideo] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState(null);

  // Channel profile state (for subscriber count & isSubscribed)
  const [channelProfile, setChannelProfile] = useState(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Comments state
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Load video details
  const fetchVideo = useCallback(async () => {
    if (!videoId) return;
    setLoadingVideo(true);
    setVideoError(null);

    try {
      const data = await videosApi.getVideoById(videoId);
      setVideo(data);

      // Fetch channel profile for true subscriber counts & subscription status
      if (data?.owner?.username) {
        try {
          const profile = await usersApi.getUserChannelProfile(data.owner.username);
          setChannelProfile(profile);
        } catch (profileErr) {
          console.warn('Could not fetch channel profile:', profileErr);
        }
      }
    } catch (err) {
      console.error('Failed to load video:', err);
      setVideoError(err.response?.data?.message || err.message || 'Failed to load video');
    } finally {
      setLoadingVideo(false);
    }
  }, [videoId]);

  // Load recommendations
  const fetchRecommendations = useCallback(async () => {
    setLoadingRecs(true);
    try {
      const res = await videosApi.getAllVideos({ limit: 16 });
      const docs = res?.docs || (Array.isArray(res) ? res : []);
      // Filter out currently playing video
      const filtered = docs.filter((v) => v._id !== videoId);
      setRecommendations(filtered);
    } catch (err) {
      console.warn('Failed to load recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  }, [videoId]);

  // Load comments
  const fetchComments = useCallback(async () => {
    if (!videoId) return;
    setLoadingComments(true);
    try {
      const data = await commentsApi.getVideoComments(videoId, { limit: 50 });
      const commentList = data?.docs || (Array.isArray(data) ? data : []);
      setComments(commentList);
      setTotalComments(data?.totalDocs || commentList.length);
    } catch (err) {
      console.warn('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [videoId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVideo();
    fetchRecommendations();
    fetchComments();
  }, [videoId, fetchVideo, fetchRecommendations, fetchComments]);

  // Comment Handlers
  const handleAddComment = async (content) => {
    setCommentSubmitting(true);
    try {
      const newComment = await commentsApi.addComment(videoId, content);
      if (newComment) {
        // Format to match aggregatePaginate projection
        const formatted = {
          _id: newComment._id,
          content: newComment.content,
          createdAt: newComment.createdAt || new Date().toISOString(),
          likesCount: 0,
          isLiked: false,
          ownerDetails: {
            username: user?.username || 'You',
            avatar: user?.avatar,
          },
          owner: user?._id,
        };
        setComments((prev) => [formatted, ...prev]);
        setTotalComments((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await commentsApi.updateComment(commentId, newContent);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: newContent } : c))
      );
    } catch (err) {
      console.error('Failed to update comment:', err);
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setTotalComments((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete comment:', err);
      throw err;
    }
  };

  if (videoError) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <ErrorState message={videoError} onRetry={fetchVideo} />
      </div>
    );
  }

  return (
    <div className="watch-container">
      {/* 70% MAIN COLUMN */}
      <div className="watch-main">
        {/* Video Player */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 Aspect Ratio
            backgroundColor: '#000000',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {loadingVideo ? (
            <div style={{ position: 'absolute', inset: 0 }}>
              <Skeleton width="100%" height="100%" borderRadius="var(--radius-lg)" />
            </div>
          ) : video?.videoFile ? (
            <video
              src={video.videoFile}
              poster={video.thumbnail}
              controls
              autoPlay
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              Video file not available
            </div>
          )}
        </div>

        {/* Video Title */}
        {loadingVideo ? (
          <div style={{ marginTop: '16px' }}>
            <Skeleton variant="text" width="70%" height="24px" />
          </div>
        ) : (
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.35,
              marginTop: '16px',
              marginBottom: '12px',
              wordBreak: 'break-word',
            }}
          >
            {video?.title}
          </h1>
        )}

        {/* Channel Row & Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Channel info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ChannelAvatar
              avatar={channelProfile?.avatar || video?.owner?.avatar}
              username={channelProfile?.username || video?.owner?.username}
              fullName={channelProfile?.fullName || video?.owner?.fullName}
              size={42}
              linkToChannel={true}
            />

            <div>
              <Link
                to={`/c/${channelProfile?.username || video?.owner?.username}`}
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                {channelProfile?.fullName || video?.owner?.fullName || video?.owner?.username}
              </Link>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {channelProfile?.subscribersCount !== undefined
                  ? `${formatViews(channelProfile.subscribersCount)} subscribers`
                  : 'Creator'}
              </div>
            </div>

            {/* Subscribe Button */}
            {(video?.owner?._id || channelProfile?._id) && (
              <div style={{ marginLeft: '12px' }}>
                <SubscribeButton
                  channelId={video?.owner?._id || channelProfile?._id}
                  initialSubscribed={channelProfile?.isSubscribed || false}
                  onToggle={(subState) => {
                    setChannelProfile((prev) =>
                      prev
                        ? {
                            ...prev,
                            isSubscribed: subState,
                            subscribersCount: Math.max(
                              0,
                              prev.subscribersCount + (subState ? 1 : -1)
                            ),
                          }
                        : null
                    );
                  }}
                />
              </div>
            )}
          </div>

          {/* Action buttons (Like pill + Save to playlist) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LikeButton
              videoId={videoId}
              initialLiked={false}
              initialCount={0}
            />

            <PlaylistSaveButton videoId={videoId} />
          </div>
        </div>

        {/* Description Box */}
        {video && (
          <DescriptionBox
            views={video.views}
            createdAt={video.createdAt}
            description={video.description}
          />
        )}

        {/* Comments Section */}
        <div style={{ marginTop: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
            {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
          </h3>

          <CommentInput
            onSubmit={handleAddComment}
            loading={commentSubmitting}
          />

          {loadingComments ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                  <Skeleton variant="circular" width="36px" height="36px" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Skeleton variant="text" width="30%" height="14px" />
                    <Skeleton variant="text" width="80%" height="14px" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              No comments yet. Be the first to join the conversation!
            </div>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment._id}
                comment={comment}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>
      </div>

      {/* 30% RECOMMENDATIONS COLUMN */}
      <aside className="watch-recommendations">
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          Recommended
        </h3>

        {loadingRecs ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <Skeleton width="168px" height="94px" borderRadius="var(--radius-md)" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton variant="text" width="95%" height="14px" />
                  <Skeleton variant="text" width="60%" height="12px" />
                  <Skeleton variant="text" width="40%" height="12px" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '16px 0' }}>
            No recommendations available.
          </div>
        ) : (
          recommendations.map((rec) => (
            <HorizontalVideoCard key={rec._id} video={rec} />
          ))
        )}
      </aside>
    </div>
  );
};

export default Watch;
