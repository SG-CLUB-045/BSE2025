import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Button, Box, TextField, CircularProgress } from '@mui/material';
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
    // For now, we'll simulate the API call with a timeout and a list of words
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // List of words to choose from (in a real app, these would come from Gemini API)
    const words = [
      'algorithm', 'database', 'function', 'variable', 'interface',
      'component', 'framework', 'library', 'parameter', 'iterator',
      'recursion', 'encryption', 'authentication', 'validation', 'initialization'
    ];
    
    // Return a random word from the list
    return words[Math.floor(Math.random() * words.length)];
  } catch (error) {
    console.error('Error generating word:', error);
    return 'error';
  }
};

const WordScramble = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    words: [] as { original: string; scrambled: string }[],
    currentWordIndex: 0,
    userGuess: '',
    score: 0,
    isLoading: false,
    message: '',
    gameOver: false,
    showResults: false
  });

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, message: '' }));
    
    try {
      // Generate 5 words
      const words = [];
      for (let i = 0; i < 5; i++) {
        const word = await generateWordWithGemini();
        words.push({
          original: word,
          scrambled: scrambleWord(word)
        });
      }
      
      setGameState({
        words,
        currentWordIndex: 0,
        userGuess: '',
        score: 0,
        isLoading: false,
        message: '',
        gameOver: false,
        showResults: false
      });
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        message: 'Failed to generate words. Please try again.',
        isLoading: false
      }));
    }
  };

  const handleGuessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGameState(prev => ({ ...prev, userGuess: event.target.value }));
  };

  const handleSubmitGuess = () => {
    const { userGuess, words, currentWordIndex, score } = gameState;
    const currentWord = words[currentWordIndex].original;
    
    if (userGuess.toLowerCase() === currentWord.toLowerCase()) {
      // Correct guess
      const newScore = score + 1;
      const isLastWord = currentWordIndex === words.length - 1;
      
      setGameState(prev => ({
        ...prev,
        score: newScore,
        message: 'Correct! Well done!',
        userGuess: '',
        currentWordIndex: isLastWord ? prev.currentWordIndex : prev.currentWordIndex + 1,
        gameOver: isLastWord,
        showResults: isLastWord
      }));
    } else {
      // Incorrect guess
      const isLastWord = currentWordIndex === words.length - 1;
      
      setGameState(prev => ({
        ...prev,
        message: `Incorrect! The word was "${currentWord}".`,
        userGuess: '',
        currentWordIndex: isLastWord ? prev.currentWordIndex : prev.currentWordIndex + 1,
        gameOver: isLastWord,
        showResults: isLastWord
      }));
    }
  };

  const handleReset = () => {
    initializeGame();
  };

  const handleFinish = () => {
    navigate('/games');
  };

  const renderGameContent = () => {
    if (gameState.isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Generating words...
          </Typography>
        </Box>
      );
    }

    if (gameState.showResults) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Game Complete!
          </Typography>
          <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
            Your Score: {gameState.score} out of 5
          </Typography>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {gameState.score >= 4 ? 'Excellent job!' : 
             gameState.score >= 3 ? 'Good work!' : 
             gameState.score >= 2 ? 'Not bad!' : 'Keep practicing!'}
          </Typography>
          
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Words and Answers:
            </Typography>
            {gameState.words.map((word, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography>
                  Word {index + 1}: <strong>{word.scrambled}</strong> → <strong>{word.original}</strong>
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReset}
              sx={{ mr: 1 }}
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
      );
    }

    return (
      <>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Word {gameState.currentWordIndex + 1} of 5
          </Typography>
          <Typography variant="h5" gutterBottom>
            Unscramble this word:
          </Typography>
          <Typography variant="h3" sx={{ 
            letterSpacing: '0.5rem',
            fontWeight: 'bold',
            color: 'primary.main',
            my: 2
          }}>
            {gameState.words[gameState.currentWordIndex].scrambled}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <TextField
            label="Your guess"
            variant="outlined"
            value={gameState.userGuess}
            onChange={handleGuessChange}
            sx={{ width: '100%', maxWidth: '400px', mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitGuess}
            disabled={!gameState.userGuess}
            sx={{ width: '100%', maxWidth: '400px' }}
          >
            Submit Guess
          </Button>
        </Box>

        {gameState.message && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" color={gameState.message.includes('Correct') ? 'success.main' : 'error.main'}>
              {gameState.message}
            </Typography>
          </Box>
        )}
      </>
    );
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
              Score: {gameState.score} out of 5
            </Typography>
          </Box>

          {renderGameContent()}
        </Paper>
      </Box>
    </Container>
  );
};

export default WordScramble; 