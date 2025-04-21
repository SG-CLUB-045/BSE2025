import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type Rod = number[];
type GameState = {
  rods: Rod[];
  selectedRod: number | null;
  moves: number;
  minMoves: number;
};

const TowerOfHanoi = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>({
    rods: [[], [], []],
    selectedRod: null,
    moves: 0,
    minMoves: 0
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const numDisks = 3;
    const initialRod = Array.from({ length: numDisks }, (_, i) => numDisks - i);
    setGameState({
      rods: [initialRod, [], []],
      selectedRod: null,
      moves: 0,
      minMoves: Math.pow(2, numDisks) - 1
    });
  };

  const handleRodClick = (rodIndex: number) => {
    const { rods, selectedRod } = gameState;

    if (selectedRod === null) {
      // First click - select a rod
      if (rods[rodIndex].length > 0) {
        setGameState(prev => ({ ...prev, selectedRod: rodIndex }));
      }
    } else {
      // Second click - try to move disk
      const sourceRod = rods[selectedRod];
      const targetRod = rods[rodIndex];
      const diskToMove = sourceRod[sourceRod.length - 1];

      if (targetRod.length === 0 || diskToMove < targetRod[targetRod.length - 1]) {
        // Valid move
        const newRods = [...rods];
        newRods[selectedRod] = sourceRod.slice(0, -1);
        newRods[rodIndex] = [...targetRod, diskToMove];

        setGameState(prev => ({
          ...prev,
          rods: newRods,
          selectedRod: null,
          moves: prev.moves + 1
        }));
      } else {
        // Invalid move
        setGameState(prev => ({ ...prev, selectedRod: null }));
      }
    }
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  const isGameComplete = () => {
    return gameState.rods[2].length === 3;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Tower of Hanoi
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" align="center">
              Moves: {gameState.moves} (Minimum: {gameState.minMoves})
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 2, 
            mb: 2 
          }}>
            {gameState.rods.map((rod, rodIndex) => (
              <Box
                key={rodIndex}
                sx={{
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  cursor: 'pointer',
                  border: gameState.selectedRod === rodIndex ? '2px solid blue' : '2px solid gray',
                  borderRadius: '4px',
                  p: 1
                }}
                onClick={() => handleRodClick(rodIndex)}
              >
                {[...rod].reverse().map((disk, diskIndex) => (
                  <Box
                    key={diskIndex}
                    sx={{
                      width: `${disk * 40}px`,
                      height: '30px',
                      backgroundColor: 'primary.main',
                      margin: '2px',
                      borderRadius: '4px'
                    }}
                  />
                ))}
              </Box>
            ))}
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            {isGameComplete() ? (
              <Typography variant="h5" gutterBottom>
                Congratulations! You solved the puzzle!
              </Typography>
            ) : (
              <Typography variant="h5" gutterBottom>
                {gameState.selectedRod !== null
                  ? 'Select destination rod'
                  : 'Select source rod'}
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleReset}
                sx={{ mr: 1 }}
              >
                Reset Game
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleFinish}
              >
                Return to Games
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TowerOfHanoi; 