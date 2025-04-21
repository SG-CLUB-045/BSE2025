import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { collection, getDocs, query, orderBy, limit, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { useUser } from '../context/UserContext';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`leaderboard-tabpanel-${index}`}
      aria-labelledby={`leaderboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Leaderboard = () => {
  const { user } = useUser();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<{
    technicalQuiz: LeaderboardEntry[];
    towerOfHanoi: LeaderboardEntry[];
    wordScramble: LeaderboardEntry[];
  }>({
    technicalQuiz: [],
    towerOfHanoi: [],
    wordScramble: []
  });

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch data for each game
      const technicalQuizData = await fetchGameLeaderboard('technicalQuiz');
      const towerOfHanoiData = await fetchGameLeaderboard('towerOfHanoi');
      const wordScrambleData = await fetchGameLeaderboard('wordScramble');
      
      setLeaderboardData({
        technicalQuiz: technicalQuizData,
        towerOfHanoi: towerOfHanoiData,
        wordScramble: wordScrambleData
      });
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGameLeaderboard = async (game: string): Promise<LeaderboardEntry[]> => {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy(`scores.${game}`, 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];
    
    let rank = 1;
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      if (data.scores && data.scores[game]) {
        entries.push({
          id: doc.id,
          name: data.name,
          score: data.scores[game],
          rank: rank++
        });
      }
    });
    
    return entries;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getGameTitle = (index: number): string => {
    switch (index) {
      case 0:
        return 'Technical Quiz';
      case 1:
        return 'Tower of Hanoi';
      case 2:
        return 'Word Scramble';
      default:
        return '';
    }
  };

  const getGameKey = (index: number): keyof typeof leaderboardData => {
    switch (index) {
      case 0:
        return 'technicalQuiz';
      case 1:
        return 'towerOfHanoi';
      case 2:
        return 'wordScramble';
      default:
        return 'technicalQuiz';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Leaderboard
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={3}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Technical Quiz" />
            <Tab label="Tower of Hanoi" />
            <Tab label="Word Scramble" />
          </Tabs>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel value={tabValue} index={0}>
                <LeaderboardTable 
                  data={leaderboardData.technicalQuiz} 
                  gameTitle="Technical Quiz"
                  currentUserId={user?.id}
                />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <LeaderboardTable 
                  data={leaderboardData.towerOfHanoi} 
                  gameTitle="Tower of Hanoi"
                  currentUserId={user?.id}
                />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <LeaderboardTable 
                  data={leaderboardData.wordScramble} 
                  gameTitle="Word Scramble"
                  currentUserId={user?.id}
                />
              </TabPanel>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  gameTitle: string;
  currentUserId?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data, gameTitle, currentUserId }) => {
  if (data.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1">
          No scores recorded yet for {gameTitle}. Be the first to play!
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Name</TableCell>
            <TableCell align="right">Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((entry) => (
            <TableRow 
              key={entry.id}
              sx={{ 
                backgroundColor: entry.id === currentUserId ? 'rgba(25, 118, 210, 0.1)' : 'inherit',
                fontWeight: entry.id === currentUserId ? 'bold' : 'normal'
              }}
            >
              <TableCell>{entry.rank}</TableCell>
              <TableCell>{entry.name}</TableCell>
              <TableCell align="right">{entry.score}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Leaderboard; 