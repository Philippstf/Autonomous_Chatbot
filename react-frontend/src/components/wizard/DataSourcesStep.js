import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';

function DataSourcesStep({ formData, updateFormData }) {
  const handleWebsiteUrlChange = (url) => {
    updateFormData({ website_url: url });
  };

  const handleManualTextChange = (text) => {
    updateFormData({ manual_text: text });
  };

  const handleFilesChange = (files) => {
    updateFormData({ uploaded_files: files });
  };

  const onDrop = React.useCallback((acceptedFiles) => {
    const currentFiles = formData.uploaded_files || [];
    const newFiles = [...currentFiles, ...acceptedFiles];
    handleFilesChange(newFiles);
  }, [formData.uploaded_files]);

  const removeFile = (index) => {
    const updatedFiles = formData.uploaded_files?.filter((_, i) => i !== index) || [];
    handleFilesChange(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validation
  const hasWebsite = Boolean(formData.website_url?.trim());
  const hasFiles = Boolean(formData.uploaded_files?.length);
  const hasManualText = Boolean(formData.manual_text?.trim());
  const hasAnyDataSource = hasWebsite || hasFiles || hasManualText;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        📊 Datenquellen
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Fügen Sie Datenquellen hinzu, damit Ihr Chatbot Fragen beantworten kann
      </Typography>

      {!hasAnyDataSource && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Bitte fügen Sie mindestens eine Datenquelle hinzu (Website, Dokumente oder manueller Text).
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Website Integration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌐 Website-Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Die komplette Website wird automatisch gecrawlt und als Wissensbasis verwendet
              </Typography>

              <TextField
                fullWidth
                label="Website URL"
                value={formData.website_url || ''}
                onChange={(e) => handleWebsiteUrlChange(e.target.value)}
                placeholder="https://ihre-website.de"
                helperText="Alle öffentlichen Seiten werden automatisch verarbeitet"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Document Upload */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📄 Dokument-Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                PDF, DOCX, TXT oder Markdown-Dateien als zusätzliche Wissensbasis
              </Typography>

              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  {isDragActive ? 'Dateien hier ablegen...' : 'Dateien hierher ziehen oder klicken'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  PDF, DOCX, TXT, MD • Max. 50MB pro Datei
                </Typography>
              </Box>

              {/* File List */}
              {formData.uploaded_files?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Hochgeladene Dateien ({formData.uploaded_files.length})
                  </Typography>
                  <List dense>
                    {formData.uploaded_files.map((file, index) => (
                      <ListItem key={index} divider>
                        <DescriptionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <ListItemText
                          primary={file.name}
                          secondary={formatFileSize(file.size)}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => removeFile(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Manual Text */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ✍️ Manueller Text
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Geben Sie direkt Informationen ein, die der Chatbot kennen soll
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={8}
                label="Zusätzlicher Text / FAQ"
                value={formData.manual_text || ''}
                onChange={(e) => handleManualTextChange(e.target.value)}
                placeholder={`Geben Sie hier Text ein, den der Chatbot kennen soll...

Beispiel:
- Häufige Fragen und Antworten
- Unternehmensinformationen
- Produktdetails
- Kontaktinformationen`}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Data Source Summary */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📋 Zusammenfassung der Datenquellen
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: hasWebsite ? 'success.main' : 'grey.300',
                      }}
                    />
                    <Typography variant="body2">
                      Website: {hasWebsite ? 'Konfiguriert' : 'Nicht konfiguriert'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: hasFiles ? 'success.main' : 'grey.300',
                      }}
                    />
                    <Typography variant="body2">
                      Dokumente: {hasFiles ? `${formData.uploaded_files.length} Datei(en)` : 'Keine Dateien'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: hasManualText ? 'success.main' : 'grey.300',
                      }}
                    />
                    <Typography variant="body2">
                      Manueller Text: {hasManualText ? 'Vorhanden' : 'Nicht vorhanden'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DataSourcesStep;