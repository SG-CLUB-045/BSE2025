import React, { useState } from 'react';
import { Container, Paper, Typography, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl, Alert, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

// Mock questions - in a real app, these would come from a backend
const questions = [
  {
    id: 1,
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1
  },
  {
    id: 2,
    question: 'Which of these is not a JavaScript data type?',
    options: ['String', 'Boolean', 'Integer', 'Object'],
    correctAnswer: 2
  },
  {
    id: 3,
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Hyper Transfer Markup Language',
      'Home Tool Markup Language'
    ],
    correctAnswer: 0
  }
];

const TechnicalQuiz = () => {
  const navigate = useNavigate();
  const { user, updateUserScore } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showScore, setShowScore] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleAnswerSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAnswer(Number(event.target.value));
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowScore(true);
    }
  };

  const handleFinish = async () => {
    try {
      // Calculate percentage score
      const percentageScore = Math.round((score / questions.length) * 100);
      
      // Save score to Firebase
      if (user) {
        await updateUserScore('technicalQuiz', percentageScore);
        setMessage(`Your score of ${percentageScore}% has been saved to the leaderboard!`);
      } else {
        setMessage('You must be registered to save your score.');
      }
      
      setOpenSnackbar(true);
      
      // Navigate to games page after a delay
      setTimeout(() => {
        navigate('/games');
      }, 2000);
    } catch (error) {
      console.error('Error saving score:', error);
      setMessage('Failed to save your score. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {showScore ? (
            <Box textAlign="center">
              <Typography variant="h4" gutterBottom>
                Quiz Complete!
              </Typography>
              <Typography variant="h5" gutterBottom>
                Your score: {score} out of {questions.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Percentage: {Math.round((score / questions.length) * 100)}%
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinish}
                sx={{ mt: 2 }}
              >
                Save Score & Return to Games
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                {questions[currentQuestion].question}
              </Typography>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <RadioGroup value={selectedAnswer} onChange={handleAnswerSelect}>
                  {questions[currentQuestion].options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                sx={{ mt: 2 }}
              >
                {currentQuestion + 1 === questions.length ? 'Finish' : 'Next Question'}
              </Button>
            </>
          )}
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

export default TechnicalQuiz; 