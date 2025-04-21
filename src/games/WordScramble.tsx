import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  TextField, 
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Function to scramble a word
const scrambleWord = (word: string): string => {
  return word
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

// Function to generate a word using Gemini API
const generateWordWithGemini = async (): Promise<string> => {
  try {
    // This is a placeholder for the actual Gemini API call
    // In a real implementation, you would use the Gemini API client
    // For now, we'll simulate the API call with a timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // List of sample words for demonstration
        const words = [
          'JAVASCRIPT', 'REACT', 'TYPESCRIPT', 'PROGRAMMING', 'ALGORITHM',
          'DATABASE', 'FUNCTION', 'VARIABLE', 'COMPONENT', 'DEVELOPER',
          'FRONTEND', 'BACKEND', 'FULLSTACK', 'API', 'FRAMEWORK'
        ];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        resolve(randomWord);
      }, 1000);
    });
  } catch (error) {
    console.error('Error generating word:', error);
    return 'ERROR';
  }
};

const WordScramble = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    originalWord: '',
    scrambledWord: '',
    userInput: '',
    score: 0,
    attempts: 0,
    maxAttempts: 3,
    isLoading: false,
    message: '',
    showMessage: false,
    messageType: 'info' as 'success' | 'error' | 'info' | 'warning'
  });

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async () => {
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const word = await generateWordWithGemini();
      const scrambled = scrambleWord(word);
      
      setGameState(prev => ({
        ...prev,
        originalWord: word,
        scrambledWord: scrambled,
        userInput: '',
        isLoading: false,
        attempts: 0
      }));
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        message: 'Failed to generate word. Please try again.',
        showMessage: true,
        messageType: 'error'
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameState(prev => ({ ...prev, userInput: e.target.value.toUpperCase() }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { userInput, originalWord, attempts, maxAttempts, score } = gameState;
    
    if (userInput === originalWord) {
      // Correct answer
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        message: 'Correct! Well done!',
        showMessage: true,
        messageType: 'success'
      }));
      
      // Start a new game after a short delay
      setTimeout(startNewGame, 1500);
    } else {
      // Incorrect answer
      const newAttempts = attempts + 1;
      
      if (newAttempts >= maxAttempts) {
        // Game over
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          message: `Game over! The word was: ${originalWord}`,
          showMessage: true,
          messageType: 'error'
        }));
      } else {
        // Try again
        setGameState(prev => ({
          ...prev,
          attempts: newAttempts,
          message: `Incorrect! Try again. ${maxAttempts - newAttempts} attempts left.`,
          showMessage: true,
          messageType: 'warning'
        }));
      }
    }
  };

  const handleReset = () => {
    startNewGame();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  const handleCloseMessage = () => {
    setGameState(prev => ({ ...prev, showMessage: false }));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Word Scramble
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" align="center">
              Score: {gameState.score} | Attempts: {gameState.attempts}/{gameState.maxAttempts}
            </Typography>
          </Box>

          {gameState.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ ml: 2 }}>
                Generating word...
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4
              }}>
                <Typography variant="h5" gutterBottom>
                  Unscramble this word:
                </Typography>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    letterSpacing: '0.5rem',
                    fontWeight: 'bold',
                    color: 'primary.main',
                    my: 2
                  }}
                >
                  {gameState.scrambledWord}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Your answer"
                  variant="outlined"
                  value={gameState.userInput}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!gameState.userInput}
                >
                  Submit
                </Button>
              </Box>
            </>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReset}
              disabled={gameState.isLoading}
            >
              New Word
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFinish}
            >
              Return to Games
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={gameState.showMessage}
        autoHideDuration={3000}
        onClose={handleCloseMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseMessage} 
          severity={gameState.messageType}
          sx={{ width: '100%' }}
        >
          {gameState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WordScramble; 