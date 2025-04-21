import React, { useState } from 'react';
import { Container, Paper, Typography, Button, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type Player = 'X' | 'O' | null;
type Board = Player[];

const TicTacToe = () => {
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0 });

  const calculateWinner = (squares: Board): Player => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winner = calculateWinner(newBoard);
    if (winner) {
      setScore(prev => ({
        ...prev,
        [winner]: prev[winner] + 1
      }));
    }
  };

  const handleReset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const handleFinish = () => {
    navigate('/games');
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Tic Tac Toe
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" align="center">
              Score - X: {score.X} | O: {score.O}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
            {board.map((square, index) => (
              <Button
                key={index}
                variant="outlined"
                sx={{
                  height: '80px',
                  fontSize: '2rem',
                  border: '2px solid',
                  width: '100%'
                }}
                onClick={() => handleClick(index)}
              >
                {square}
              </Button>
            ))}
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            {winner ? (
              <Typography variant="h5" gutterBottom>
                Player {winner} wins!
              </Typography>
            ) : isDraw ? (
              <Typography variant="h5" gutterBottom>
                It's a draw!
              </Typography>
            ) : (
              <Typography variant="h5" gutterBottom>
                Next player: {isXNext ? 'X' : 'O'}
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

export default TicTacToe; 