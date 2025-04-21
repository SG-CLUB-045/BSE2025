import React from 'react';
import { Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';

// Mock data - in a real app, this would come from a backend
const leaderboardData = [
  { id: 1, name: 'John Doe', technicalQuiz: 85, ticTacToe: 90, towerOfHanoi: 95, average: 90 },
  { id: 2, name: 'Jane Smith', technicalQuiz: 92, ticTacToe: 88, towerOfHanoi: 85, average: 88.3 },
  { id: 3, name: 'Mike Johnson', technicalQuiz: 78, ticTacToe: 95, towerOfHanoi: 88, average: 87 },
  { id: 4, name: 'Sarah Wilson', technicalQuiz: 95, ticTacToe: 82, towerOfHanoi: 90, average: 89 },
  { id: 5, name: 'David Brown', technicalQuiz: 88, ticTacToe: 85, towerOfHanoi: 92, average: 88.3 },
];

const Leaderboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Leaderboard
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Technical Quiz</TableCell>
                <TableCell align="right">Tic Tac Toe</TableCell>
                <TableCell align="right">Tower of Hanoi</TableCell>
                <TableCell align="right">Average Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboardData.map((player, index) => (
                <TableRow key={player.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell align="right">{player.technicalQuiz}</TableCell>
                  <TableCell align="right">{player.ticTacToe}</TableCell>
                  <TableCell align="right">{player.towerOfHanoi}</TableCell>
                  <TableCell align="right">{player.average.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Leaderboard; 