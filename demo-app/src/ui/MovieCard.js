import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActionArea } from '@mui/material';

const MovieCard = ({ movie, onSelect }) => {
  return (
    <Card 
      sx={{ 
        width: 250, 
        m: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        '&:hover': {
          transform: 'scale(1.05)',
          transition: 'transform 0.2s'
        }
      }}
    >
      <CardActionArea onClick={() => onSelect(movie)}>
        <CardMedia
          component="img"
          height="150"
          image={movie.poster}
          alt={movie.title}
        />
        
        {/* <CardContent>
          <Typography variant="h6" component="div" sx={{ color: 'white' }}>
            {movie.title}
          </Typography>
        </CardContent> */}
        
      </CardActionArea>
    </Card>
  );
};

export default MovieCard;