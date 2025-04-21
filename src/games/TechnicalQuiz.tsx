import React, { useState } from 'react';
import { Container, Paper, Typography, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showScore, setShowScore] = useState(false);

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

  const handleFinish = () => {
    // Here you would typically save the score to a backend
    navigate('/games');
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleFinish}
                sx={{ mt: 2 }}
              >
                Return to Games
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
    </Container>
  );
};

export default TechnicalQuiz; 