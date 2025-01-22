import React from 'react';
import { Box, Typography } from '@mui/material';
import MovieCard from './MovieCard';

const MovieRow = ({ title, movies, onMovieSelect }) => {
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="h5" sx={{ ml: 2, mb: 2, color: 'white' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', overflow: 'auto', pb: 2 }}>
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onSelect={onMovieSelect}
            />
          ))}
        </Box>
      </Box>
    );
  };
  
  export default MovieRow;