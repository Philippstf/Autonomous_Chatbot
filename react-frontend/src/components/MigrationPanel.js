import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  Error,
  PlayArrow,
  CloudSync
} from '@mui/icons-material';
import { MigrationHelper } from '../utils/migrationHelper';

const MigrationPanel = () => {
  const [migrationStatus, setMigrationStatus] = useState('idle'); // 'idle', 'running', 'completed', 'error'
  const [progress, setProgress] = useState({ step: 0, total: 0, name: '', status: '' });
  const [results, setResults] = useState([]);
  const [verification, setVerification] = useState(null);

  const handleStartMigration = async () => {
    setMigrationStatus('running');
    setResults([]);
    setVerification(null);

    try {
      const migrationResults = await MigrationHelper.runFullMigration((progressInfo) => {
        setProgress(progressInfo);
      });

      setResults(migrationResults);
      setMigrationStatus('completed');

      // Run verification
      const verificationResult = await MigrationHelper.verifyMigration();
      setVerification(verificationResult);

    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus('error');
    }
  };

  const handleVerifyMigration = async () => {
    const verificationResult = await MigrationHelper.verifyMigration();
    setVerification(verificationResult);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'primary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'failed': return <Error color="error" />;
      case 'running': return <CloudSync color="primary" />;
      default: return <PlayArrow />;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Supabase zu Firebase Migration
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Diese Migration überträgt alle Daten von Supabase zu Firebase. 
        Stellen Sie sicher, dass Firebase korrekt konfiguriert ist.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleStartMigration}
              disabled={migrationStatus === 'running'}
              startIcon={<PlayArrow />}
            >
              Migration starten
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleVerifyMigration}
              startIcon={<CloudSync />}
            >
              Migration verifizieren
            </Button>
          </Box>

          {migrationStatus === 'running' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                {progress.name} ({progress.step}/{progress.total})
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(progress.step / progress.total) * 100} 
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Migrationsergebnisse
            </Typography>
            <List>
              {results.map((result, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {getStatusIcon(result.success ? 'completed' : 'failed')}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.name}
                    secondary={
                      result.success 
                        ? `${result.count} Einträge migriert`
                        : `Fehler: ${result.error?.message || 'Unbekannter Fehler'}`
                    }
                  />
                  <Chip
                    label={result.success ? 'Erfolgreich' : 'Fehler'}
                    color={getStatusColor(result.success ? 'completed' : 'failed')}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {verification && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Verifizierung
            </Typography>
            {verification.error ? (
              <Alert severity="error">
                Fehler bei der Verifizierung: {verification.error.message}
              </Alert>
            ) : (
              <List>
                {Object.entries(verification).map(([key, counts]) => (
                  <ListItem key={key}>
                    <ListItemText
                      primary={key.charAt(0).toUpperCase() + key.slice(1)}
                      secondary={`Supabase: ${counts.supabase} | Firebase: ${counts.firebase}`}
                    />
                    <Chip
                      label={counts.supabase === counts.firebase ? 'OK' : 'Unterschied'}
                      color={counts.supabase === counts.firebase ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MigrationPanel;