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
  Snackbar,
  LinearProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

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
  const { user, updateUserScore } = useUser();
  const [gameState, setGameState] = useState({
    words: [] as string[],
    scrambledWords: [] as string[],
    currentWordIndex: 0,
    userInput: '',
    score: 0,
    isLoading: false,
    message: '',
    showMessage: false,
    messageType: 'info' as 'success' | 'error' | 'info' | 'warning',
    gameCompleted: false
  });

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = async () => {
    setGameState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Generate 5 random words
      const words: string[] = [];
      const scrambledWords: string[] = [];
      
      for (let i = 0; i < 5; i++) {
        const word = await generateWordWithGemini();
        words.push(word);
        scrambledWords.push(scrambleWord(word));
      }
      
      setGameState(prev => ({
        ...prev,
        words,
        scrambledWords,
        currentWordIndex: 0,
        userInput: '',
        score: 0,
        isLoading: false,
        gameCompleted: false
      }));
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        message: 'Failed to generate words. Please try again.',
        showMessage: true,
        messageType: 'error'
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameState(prev => ({ ...prev, userInput: e.target.value.toUpperCase() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { userInput, words, currentWordIndex, score } = gameState;
    const currentWord = words[currentWordIndex];
    
    if (userInput === currentWord) {
      // Correct answer - add 20 points
      const newScore = score + 20;
      
      setGameState(prev => ({
        ...prev,
        score: newScore,
        message: 'Correct! +20 points!',
        showMessage: true,
        messageType: 'success'
      }));
      
      // Move to next word or complete game
      if (currentWordIndex < words.length - 1) {
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentWordIndex: prev.currentWordIndex + 1,
            userInput: ''
          }));
        }, 1500);
      } else {
        // Game completed
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            gameCompleted: true
          }));
          
          // Save score to Firebase if user is registered
          if (user) {
            try {
              updateUserScore('wordScramble', newScore);
            } catch (error) {
              console.error('Error saving score:', error);
            }
          }
        }, 1500);
      }
    } else {
      // Incorrect answer
      setGameState(prev => ({
        ...prev,
        message: `Incorrect! The word was: ${currentWord}`,
        showMessage: true,
        messageType: 'error'
      }));
      
      // Move to next word or complete game
      if (currentWordIndex < words.length - 1) {
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            currentWordIndex: prev.currentWordIndex + 1,
            userInput: ''
          }));
        }, 2000);
      } else {
        // Game completed
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            gameCompleted: true
          }));
          
          // Save score to Firebase if user is registered
          if (user) {
            try {
              updateUserScore('wordScramble', score);
            } catch (error) {
              console.error('Error saving score:', error);
            }
          }
        }, 2000);
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

  const { 
    words, 
    scrambledWords, 
    currentWordIndex, 
    userInput, 
    score, 
    isLoading, 
    gameCompleted 
  } = gameState;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Word Scramble
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" align="center">
              Score: {score} | Word: {currentWordIndex + 1}/5
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentWordIndex / 5) * 100} 
              sx={{ mt: 1, height: 10, borderRadius: 5 }}
            />
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ ml: 2 }}>
                Generating words...
              </Typography>
            </Box>
          ) : gameCompleted ? (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="h5" gutterBottom>
                Game Completed!
              </Typography>
              <Typography variant="h4" gutterBottom color="primary">
                Final Score: {score}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user 
                  ? `Your score has been saved to the leaderboard!` 
                  : `You must be registered to save your score.`}
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleReset}
                >
                  Play Again
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
                  {scrambledWords[currentWordIndex]}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Your answer"
                  variant="outlined"
                  value={userInput}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!userInput}
                >
                  Submit
                </Button>
              </Box>
            </>
          )}
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