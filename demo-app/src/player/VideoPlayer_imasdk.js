// VideoPlayer.js
import React, { Component } from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import {
  PlayArrow, Pause, VolumeUp, VolumeOff,
  Fullscreen, SkipNext, ClosedCaption
} from '@mui/icons-material';

import shaka from 'shaka-player';

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
    this.adContainerRef = React.createRef();
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.isMuted = false;
    this.showControls = true;
    this.isFullscreen = true;
    this.controlsTimeoutRef = null;
    this.state = {
      player: null,
      adsLoader: null,
      adsManager: null,
      adDisplayContainer: null,
      isAdPlaying: false,
      metadata: null,
      lastAdTime: 0,
      isImaSDKLoaded: false,
    };

    // Binding methods
    this.onErrorEvent = this.onErrorEvent.bind(this);
    this.onError = this.onError.bind(this);
    this.initPlayer = this.initPlayer.bind(this);
    this.loadContent = this.loadContent.bind(this);
    this.initIMASDK = this.initIMASDK.bind(this);
    this.onAdsManagerLoaded = this.onAdsManagerLoaded.bind(this);
    this.onAdError = this.onAdError.bind(this);
    this.onAdEvent = this.onAdEvent.bind(this);
    // Add back button handler
    this.handleBackButton = this.handleBackButton.bind(this);
  }

  componentDidMount() {
    // Load IMA SDK
    if (!window.google || !window.google.ima) {
      const script = document.createElement('script');
      script.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
      script.async = true;
      script.onload = () => {
        this.setState({ isImaSDKLoaded: true }, () => {
          this.initPlayer();
          this.initIMASDK();
        });
      };
      script.onerror = (error) => {
        console.error('Error loading IMA SDK:', error);
        // Initialize player even if IMA SDK fails to load
        this.initPlayer();
      };
      document.body.appendChild(script);
    } else {
      this.setState({ isImaSDKLoaded: true }, () => {
        this.initPlayer();
        this.initIMASDK();
      });
    }

    document.addEventListener('keydown', this.handleBackButton);
  }

  componentWillUnmount() {
    // Clean up
    if (this.state.player) {
      this.state.player.destroy();
    }
    if (this.state.adsManager) {
      this.state.adsManager.destroy();
    }
    // Remove back button event listener
    document.removeEventListener('keydown', this.handleBackButton);
  }

  handleBackButton(event) {
    if (event.key === 'Escape' || event.key === 'Backspace') {
      // Cleanup before closing
      if (this.state.player) {
        this.state.player.pause();
      }
      if (this.state.adsManager) {
        this.state.adsManager.stop();
      }
      
      this.props.onClose();
    }
  }

  initPlayer() {
    // Check browser support
    if (!shaka.Player.isBrowserSupported()) {
      console.error('Browser not supported!');
      return;
    }

    // Create player instance
    const player = new shaka.Player(this.videoRef.current);

    // Add error event listeners
    player.addEventListener('error', this.onErrorEvent);
    
    // Add playback event listeners
    player.addEventListener('loading', () => this.logEvent('loading'));
    player.addEventListener('loaded', () => this.logEvent('loaded'));
    player.addEventListener('buffering', () => this.logEvent('buffering'));
    player.addEventListener('playing', () => this.logEvent('playing'));
    player.addEventListener('paused', () => this.logEvent('paused'));
    player.addEventListener('ended', () => this.logEvent('ended'));

    // Add metadata event listener
    player.addEventListener('metadata', (event) => {
      this.setState({ metadata: event.detail }, () => {
        this.checkForAds();
      });
      this.logEvent('metadata', event.detail);
    });

    this.setState({ player }, () => {
      this.loadContent();
    });
  }
  
  initIMASDK() {
    if (!this.state.isImaSDKLoaded || !window.google || !window.google.ima) {
      console.warn('IMA SDK not loaded');
      return;
    }

    try {
      const adDisplayContainer = new window.google.ima.AdDisplayContainer(
        this.adContainerRef.current,
        this.videoRef.current
      );

      // Create ads loader
      const adsLoader = new window.google.ima.AdsLoader(adDisplayContainer);

      // Add event listeners
      adsLoader.addEventListener(
        window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this.onAdsManagerLoaded.bind(this),
        false
      );
      adsLoader.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdError.bind(this),
        false
      );

      this.setState({ adsLoader, adDisplayContainer });
    } catch (error) {
      console.error('Error initializing IMA SDK:', error);
    }
  }
  
  loadContent() {
    const { player } = this.state;
    const manifestUri = this.props.manifestUri || 'YOUR_MANIFEST_URI';

    player.load(manifestUri).catch(this.onError);
  }

  requestAds() {
    const { adsLoader, adDisplayContainer, isImaSDKLoaded } = this.state;
    
    if (!isImaSDKLoaded || !adsLoader || !adDisplayContainer) {
      console.warn('IMA SDK components not initialized');
      return;
    }

    try {
      // Initialize the container first
      adDisplayContainer.initialize();

      // Request video ads
      const adsRequest = new window.google.ima.AdsRequest();
      // Replace this with your actual ad tag URL
      adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
        'iu=/21775744923/external/single_ad_samples&sz=640x480&' +
        'cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&' +
        'gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&' +
        'impl=s&correlator=';

      // Specify the linear and nonlinear slot sizes
      adsRequest.linearAdSlotWidth = this.videoRef.current.offsetWidth;
      adsRequest.linearAdSlotHeight = this.videoRef.current.offsetHeight;
      adsRequest.nonLinearAdSlotWidth = this.videoRef.current.offsetWidth;
      adsRequest.nonLinearAdSlotHeight = 150;

      // Make the request
      adsLoader.requestAds(adsRequest);
    } catch (error) {
      console.error('Error requesting ads:', error);
    }
  }

  onAdsManagerLoaded(adsManagerLoadedEvent) {
    try {
      // Get the ads manager
      const adsRenderingSettings = new window.google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;

      // Get the ads manager
      const adsManager = adsManagerLoadedEvent.getAdsManager(
        this.videoRef.current,
        adsRenderingSettings
      );

      // Add event listeners
      adsManager.addEventListener(
        window.google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdError.bind(this)
      );
      adsManager.addEventListener(
        window.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        () => {
          this.videoRef.current.pause();
        }
      );
      adsManager.addEventListener(
        window.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        () => {
          this.videoRef.current.play();
        }
      );
      adsManager.addEventListener(
        window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        () => {
          this.setState({ isAdPlaying: false });
        }
      );

      try {
        adsManager.init(
          this.videoRef.current.offsetWidth,
          this.videoRef.current.offsetHeight,
          window.google.ima.ViewMode.NORMAL
        );
        adsManager.start();
      } catch (adError) {
        // An error may be thrown if there was a problem with the VAST response
        this.onAdError(adError);
      }

      this.setState({ adsManager });
    } catch (error) {
      console.error('Error in onAdsManagerLoaded:', error);
    }
  }
  
  checkForAds() {
    const currentTime = Date.now();
    const timeSinceLastAd = currentTime - this.state.lastAdTime;
    
    // Check if enough time has passed since last ad (e.g., 5 minutes)
    if (timeSinceLastAd >= 5 * 60 * 1000) {
      this.requestAds();
      this.setState({ lastAdTime: currentTime });
    }
  }

  onAdEvent(adEvent) {
    const { type } = adEvent;
    this.logEvent('ad_event', { type });

    if (type === window.google.ima.AdEvent.Type.STARTED) {
      this.setState({ isAdPlaying: true });
    }
  }
  
  onAdError(adError) {
    console.error('Ad Error:', adError.getError());
    if (this.state.adsManager) {
      this.state.adsManager.destroy();
    }
    this.setState({ isAdPlaying: false });
    // Resume content video playback
    if (this.videoRef.current) {
      this.videoRef.current.play();
    }
  }
  onErrorEvent(event) {
    this.onError(event.detail);
  }

  onError(error) {
    console.error('Error code:', error.code, 'message:', error.message);
    this.logEvent('error', { code: error.code, message: error.message });
  }

  logEvent(eventName, details = {}) {
    console.log(`Player Event: ${eventName}`, details);
    // You can send these events to your analytics service here
  }

  handlePlay () {
    if (this.videoRef.current.paused) {
      this.videoRef.current.play();
      this.setIsPlaying(true);
    } else {
      this.videoRef.current.pause();
      this.setIsPlaying(false);
    }
  };

  handleTimeUpdate () {
    this.setCurrentTime(this.videoRef.current.currentTime);
  };

  handleSeek (_, value) {
    this.videoRef.current.currentTime = value;
    this.setCurrentTime(value);
  };

  handleVolumeChange (_, value) {
    this.setVolume(value);
    this.videoRef.current.volume = value;
    this.setIsMuted(value === 0);
  };

  toggleMute () {
    if (this.isMuted) {
      this.videoRef.current.volume = this.volume;
      this.setIsMuted(false);
    } else {
      this.videoRef.current.volume = 0;
      this.setIsMuted(true);
    }
  };

  toggleFullscreen () {
    if (!document.fullscreenElement) {
      this.videoRef.current.requestFullscreen();
      this.setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      this.setIsFullscreen(false);
    }
  };

  setCurrentTime (value) {
    this.currentTime = value;
  }

  setIsPlaying (value) {
    this.isPlaying = value;
  }

  setDuration (value) {}
  setVolume (value) {}
  setIsMuted (value) {}
  setShowControls (value) {}
  setIsFullscreen (value) {}

  formatTime (seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  render() {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          bgcolor: 'black',
        }}
        onMouseMove={() => {
          this.setShowControls(true);
          if (this.controlsTimeoutRef.current) {
            clearTimeout(this.controlsTimeoutRef.current);
          }
        }}
      >
        <video
          ref={this.videoRef}
          className="w-full h-full"
          onTimeUpdate={this.handleTimeUpdate}
          onClick={this.handlePlay}
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
            opacity: this.showControls ? 1 : 0,
            transition: 'opacity 0.3s',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {/* Progress Bar */}
          <Slider
            value={this.currentTime}
            max={this.duration}
            onChange={this.handleSeek}
            sx={{ color: 'primary.main' }}
          />
  
          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={this.handlePlay} sx={{ color: 'white' }}>
              {this.isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
  
            <Box sx={{ display: 'flex', alignItems: 'center', width: 200 }}>
              <IconButton onClick={this.toggleMute} sx={{ color: 'white' }}>
                {this.isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <Slider
                value={this.isMuted ? 0 : this.volume}
                onChange={this.handleVolumeChange}
                max={1}
                step={0.1}
                sx={{ color: 'white', ml: 2 }}
              />
            </Box>
  
            <Typography sx={{ color: 'white', flex: 1 }}>
              {this.formatTime(this.currentTime)} / {this.formatTime(this.duration)}
            </Typography>
  
            <IconButton sx={{ color: 'white' }}>
              <ClosedCaption />
            </IconButton>
  
            <IconButton onClick={this.toggleFullscreen} sx={{ color: 'white' }}>
              <Fullscreen />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }
}

export default VideoPlayer;