import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import {
  PlayArrow, Pause, VolumeUp, VolumeOff,
  Fullscreen, SkipNext, ClosedCaption
} from '@mui/icons-material';

const VideoPlayer = ({ videoUrl, onClose }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const controlsTimeoutRef = useRef(null);
  const state = {
    player: null,
    adsLoader: null,
    adsManager: null,
    adDisplayContainer: null,
    isAdPlaying: false,
    metadata: null,
    lastAdTime: 0,
    isImaSDKLoaded: false,
  };

  useEffect(() => {
    const shaka = require('shaka-player');
    shaka.polyfill.installAll();

    if (shaka.Player.isBrowserSupported()) {
      initPlayer();
    }

    async function initPlayer() {
      try {
        playerRef.current = new shaka.Player(videoRef.current);
        await playerRef.current.load(videoUrl);
        setDuration(videoRef.current.duration);

        // Configure player
        playerRef.current.configure({
          streaming: {
            bufferingGoal: 60,
            rebufferingGoal: 2,
            bufferBehind: 30
          }
        });

      } catch (error) {
        console.error('Error loading video:', error);
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const hideControlsTimer = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    hideControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  const handlePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleSeek = (_, value) => {
    videoRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (_, value) => {
    setVolume(value);
    videoRef.current.volume = value;
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        bgcolor: 'black',
      }}
      onMouseMove={() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onClick={handlePlay}
      />

      {/* Controls Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          p: 2,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {/* Progress Bar */}
        <Slider
          value={currentTime}
          max={duration}
          onChange={handleSeek}
          sx={{ color: 'primary.main' }}
        />

        {/* Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handlePlay} sx={{ color: 'white' }}>
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', width: 200 }}>
            <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              max={1}
              step={0.1}
              sx={{ color: 'white', ml: 2 }}
            />
          </Box>

          <Typography sx={{ color: 'white', flex: 1 }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <IconButton sx={{ color: 'white' }}>
            <ClosedCaption />
          </IconButton>

          <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
            <Fullscreen />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;