import React, { useState } from 'react';
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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  SelectChangeEvent
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

// Function to generate words using Gemini API
const generateWordsWithGemini = async (difficulty: string): Promise<string[]> => {
  try {
    const GEMINI_API_KEY = 'AIzaSyCpI0Dr4ZwiCfgv3LB_598oDO6eAsXkVEE';

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const prompt = `Generate 5 ${difficulty} difficulty level words for a word scramble game. 
    The words should be appropriate for the difficulty level with these exact lengths:
    - Easy: 4-5 letters, common words (e.g., "book", "tree", "fish")
    - Medium: 5-6 letters, slightly challenging words (e.g., "apple", "house", "water")
    - Hard: 7-8 letters, complex or technical words (e.g., "program", "network", "science")
    
    Make sure all words are:
    1. Valid English words
    2. Within the specified length range for the difficulty level
    3. Not too obscure or difficult to spell
    4. Appropriate for a word scramble game
    
    Return the words in this exact JSON format:
    {
      "words": ["word1", "word2", "word3", "word4", "word5"]
    }`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Gemini API');
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract the JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini API');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    return parsedResponse.words.map((word: string) => word.toUpperCase());

  } catch (error) {
    console.error('Error generating words:', error);
    throw new Error('Failed to generate words. Please try again.');
  }
};

const WordScramble = () => {
  const navigate = useNavigate();
  const { user, updateUserScore } = useUser();
  const [activeStep, setActiveStep] = useState(0);
  const [gameConfig, setGameConfig] = useState({
    difficulty: 'medium'
  });
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
    gameCompleted: false,
    error: false
  });

  const handleConfigChange = (e: SelectChangeEvent<string>) => {
    setGameConfig(prev => ({
      ...prev,
      difficulty: e.target.value
    }));
  };

  const startNewGame = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, error: false }));
    
    try {
      // Generate 5 random words based on difficulty
      const words = await generateWordsWithGemini(gameConfig.difficulty);
      const scrambledWords = words.map(word => scrambleWord(word));
      
      setGameState(prev => ({
        ...prev,
        words,
        scrambledWords,
        currentWordIndex: 0,
        userInput: '',
        score: 0,
        isLoading: false,
        gameCompleted: false,
        error: false
      }));
      setActiveStep(1);
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        message: 'Failed to generate words. Please try again.',
        showMessage: true,
        messageType: 'error',
        error: true
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
    setActiveStep(0);
    setGameConfig({
      difficulty: 'medium'
    });
    setGameState(prev => ({
      ...prev,
      words: [],
      scrambledWords: [],
      currentWordIndex: 0,
      userInput: '',
      score: 0,
      gameCompleted: false,
      error: false
    }));
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
    gameCompleted,
    error
  } = gameState;

  const steps = ['Configure Game', 'Play Game'];

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Word Scramble
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Configure Your Game
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-label"
                  name="difficulty"
                  value={gameConfig.difficulty}
                  onChange={handleConfigChange}
                  label="Difficulty"
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
                <FormHelperText>Select the difficulty level of the words</FormHelperText>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                onClick={startNewGame}
                disabled={isLoading}
                fullWidth
                size="large"
              >
                {isLoading ? 'Generating Words...' : 'Start Game'}
              </Button>
              
              {isLoading && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  <Typography>Generating words using AI...</Typography>
                </Box>
              )}
            </Box>
          )}

          {activeStep === 1 && !gameCompleted && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" align="center">
                  Score: {score} | Word: {currentWordIndex + 1}/5
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={((currentWordIndex + 1) / 5) * 100} 
                  sx={{ mt: 1, height: 10, borderRadius: 5 }}
                />
              </Box>

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

          {activeStep === 1 && gameCompleted && (
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