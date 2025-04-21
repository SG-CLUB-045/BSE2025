import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Box, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

type Rod = number[];
type GameState = {
  rods: Rod[];
  selectedRod: number | null;
  moves: number;
  minMoves: number;
};

const TowerOfHanoi = () => {
  const navigate = useNavigate();
  const { user, updateUserScore } = useUser();
  const [gameState, setGameState] = useState<GameState>({
    rods: [[], [], []],
    selectedRod: null,
    moves: 0,
    minMoves: 0
  });
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);

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
    setGameCompleted(false);
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

        const newMoves = gameState.moves + 1;
        
        setGameState(prev => ({
          ...prev,
          rods: newRods,
          selectedRod: null,
          moves: newMoves
        }));
        
        // Check if game is completed
        if (newRods[2].length === 3) {
          setGameCompleted(true);
          handleGameComplete(newMoves);
        }
      } else {
        // Invalid move
        setGameState(prev => ({ ...prev, selectedRod: null }));
      }
    }
  };

  const handleGameComplete = async (moves: number) => {
    try {
      // Calculate score based on moves (lower moves = higher score)
      // Max score is 100, min score is 0
      const maxMoves = gameState.minMoves * 2; // Allow double the minimum moves
      const score = Math.max(0, Math.min(100, Math.round(100 - ((moves - gameState.minMoves) / (maxMoves - gameState.minMoves)) * 100)));
      
      // Save score to Firebase
      if (user) {
        await updateUserScore('towerOfHanoi', score);
        setMessage(`Congratulations! Your score of ${score}% has been saved to the leaderboard!`);
      } else {
        setMessage('You must be registered to save your score.');
      }
      
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error saving score:', error);
      setMessage('Failed to save your score. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
            {gameCompleted ? (
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
      
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TowerOfHanoi; 