import React from 'react';
import { Container, Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const games = [
  {
    id: 'technical-quiz',
    title: 'Technical Quiz',
    description: 'Test your knowledge in various technical subjects',
    image: 'https://source.unsplash.com/random/400x200/?quiz',
    path: '/games/technical-quiz'
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'Classic game with a strategic twist',
    image: 'https://source.unsplash.com/random/400x200/?game',
    path: '/games/tic-tac-toe'
  },
  {
    id: 'tower-of-hanoi',
    title: 'Tower of Hanoi',
    description: 'Test your problem-solving skills',
    image: 'https://source.unsplash.com/random/400x200/?puzzle',
    path: '/games/tower-of-hanoi'
  }
];

const Games = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          IQ Games
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 4 
        }}>
          {games.map((game) => (
            <Card key={game.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={game.image}
                alt={game.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {game.title}
                </Typography>
                <Typography>
                  {game.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate(game.path)}
                >
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default Games; 