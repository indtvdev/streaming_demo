import '@procot/webostv';
import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Home,
  Movie,
  Favorite,
  Search,
  Settings
} from '@mui/icons-material';
import MovieRow from './ui/MovieRow';
import VideoPlayer from './player/VideoPlayer';

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

// Sample data - replace with your actual data
const movieSections = [
  {
    title: "",
    movies: [
      { id: 1, title: "Live", year: 2025, poster: "/live-stream-icon.jpg", videoUrl: "https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg01550-indiatv-indiatvlive-xiaomi/playlist.m3u8?app_bundle=REPLACEME&app_name=REPLACEME&did=REPLACEME&us_privacy=REPLACEME&gdpr=REPLACEME&consent=REPLACEME&is_lat=REPLACEME&app_store_url=REPLACEME&coppa=REPLACEME"},
      { id: 2, title: "Aaj Ki Baat", year: 2024, poster: "/aaj-ki-baat.jpg", videoUrl: "https://vod-indiatv.akamaized.net/63bd2161756d5f000872bc0b/2024/12/6vlgyt7r/master.m3u8" },
      // Add more movies...
    ]
  },
  {
    title: "Sample Videos",
    movies: [
      { id: 3, title: "DASH", year: 2024, poster: "https://commondatastorage.googleapis.com/android-tv/Sample%20videos/Zeitgeist/Zeitgeist%202010_%20Year%20in%20Review/card.jpg",
       videoUrl: "https://dash.akamaized.net/dash264/TestCases/2c/qualcomm/1/MultiResMPEG2.mpd" },
      { id: 4, title: "HLS", year: 2024, poster: "https://commondatastorage.googleapis.com/android-tv/Sample%20videos/Demo%20Slam/Google%20Demo%20Slam_%2020ft%20Search/card.jpg",
       videoUrl: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls-apple/master.m3u8" },
      { id: 4, title: "S", year: 2024, poster: "https://commondatastorage.googleapis.com/android-tv/Sample%20videos/April%20Fool's%202013/Introducing%20Gmail%20Blue/card.jpg",
       videoUrl: "https://commondatastorage.googleapis.com/android-tv/Sample%20videos/April%20Fool's%202013/Introducing%20Gmail%20Blue.mp4" },
      { id: 4, title: "T", year: 2024, poster: "https://commondatastorage.googleapis.com/android-tv/Sample%20videos/April%20Fool's%202013/Introducing%20Google%20Fiber%20to%20the%20Pole/card.jpg",
       videoUrl: "https://commondatastorage.googleapis.com/android-tv/Sample%20videos/April%20Fool's%202013/Introducing%20Google%20Fiber%20to%20the%20Pole.mp4" },
      { id: 4, title: "U", year: 2024, poster: "https://commondatastorage.googleapis.com/android-tv/Sample%20videos/April%20Fool's%202013/Introducing%20Google%20Nose/card.jpg",
       videoUrl: "https://commondatastorage.googleapis.com/android-tv/Sample%20videos/April%20Fool's%202013/Introducing%20Google%20Nose.mp4" },

      // Add more movies...
    ]
  },
  // Add more sections...
];

const drawerWidth = 80;


const App = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Navigation Rail */}
        {/* <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
        >
          <List>
            {[
              { icon: <Home />, text: 'Live' },
              { icon: <Search />, text: 'Search' },
              { icon: <Movie />, text: 'Vod' },
              { icon: <Favorite />, text: 'Favorites' },
              { icon: <Settings />, text: 'Settings' },
            ].map((item, index) => (
              <ListItem button key={index} sx={{ flexDirection: 'column', py: 2 }}>
                <ListItemIcon sx={{ minWidth: 'auto', color: 'white' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontSize: '0.7rem',
                      color: 'white'
                    }
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Drawer> */}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
            position: 'relative',
            backgroundImage:`
            linear-gradient(30deg,
              rgba(0, 0, 0, 1),
              rgba(0, 0, 0, 0.6),
              rgba(0, 0, 0, 0)
            ),
            url("/background.jpg")`
            ,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {selectedMovie ? (
            <VideoPlayer
              videoUrl={selectedMovie.videoUrl}
              onClose={() => setSelectedMovie(null)}
            />
          ) : (
            <Box
              sx={{
                height: '100%',
                overflow: 'auto',
                pt: '50vh',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              {movieSections.map((section, index) => (
                <MovieRow
                  key={index}
                  title={section.title}
                  movies={section.movies}
                  onMovieSelect={handleMovieSelect}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;