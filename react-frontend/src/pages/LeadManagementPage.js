import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Avatar,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { 
  Email, 
  Phone, 
  Person,
  SmartToy,
  Chat,
  Timeline,
  TrendingUp,
  Download,
  Visibility,
  Edit,
  CheckCircle,
  Schedule,
  Cancel,
  Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const LeadManagementPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState(0);
  const [leads, setLeads] = useState([]);
  const [chatbots, setChatbots] = useState([]);
  const [selectedChatbot, setSelectedChatbot] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationDetail, setConversationDetail] = useState(null);
  const [showConversationDetail, setShowConversationDetail] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    totalConversations: 0,
    avgConversationLength: 0
  });

  useEffect(() => {
    fetchData();
  }, [selectedChatbot, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch chatbots first
      const chatbotsResponse = await api.get('/chatbots');
      setChatbots(chatbotsResponse.data.chatbots || []);
      
      if (activeTab === 0) {
        // Lead Generation Tab
        const leadsEndpoint = selectedChatbot === 'all' ? '/leads' : `/chatbots/${selectedChatbot}/leads`;
        const leadsResponse = await api.get(leadsEndpoint);
        setLeads(leadsResponse.data.leads || []);
        
        // Calculate lead stats
        calculateLeadStats(leadsResponse.data.leads || []);
      } else if (activeTab === 1) {
        // Conversations Tab
        if (selectedChatbot !== 'all') {
          const conversationsResponse = await api.get(`/chatbots/${selectedChatbot}/conversations`);
          setConversations(conversationsResponse.data.conversations || []);
        } else {
          setConversations([]);
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const calculateLeadStats = (leadsData) => {
    const total = leadsData.length;
    const newLeads = leadsData.filter(lead => lead.status === 'new').length;
    const convertedLeads = leadsData.filter(lead => lead.status === 'converted').length;
    const conversionRate = total > 0 ? (convertedLeads / total * 100).toFixed(1) : 0;
    
    setStats(prev => ({
      ...prev,
      totalLeads: total,
      newLeads,
      convertedLeads,
      conversionRate: parseFloat(conversionRate)
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChatbotChange = (event) => {
    setSelectedChatbot(event.target.value);
  };

  const handleLeadStatusChange = async (leadId, newStatus) => {
    try {
      await api.put(`/leads/${leadId}/status?status=${newStatus}`);
      
      // Refresh leads data
      fetchData();
    } catch (error) {
      console.error('Failed to update lead status:', error);
      setError('Status konnte nicht aktualisiert werden');
    }
  };

  const handleViewConversation = async (conversationId) => {
    try {
      setLoading(true);
      const response = await api.get(`/chatbots/${selectedChatbot}/conversations/${conversationId}`);
      setConversationDetail(response.data);
      setSelectedConversation(conversationId);
      setShowConversationDetail(true);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Konversation konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#f59e0b';
      case 'contacted': return '#3b82f6';
      case 'qualified': return '#8b5cf6';
      case 'converted': return '#10b981';
      case 'lost': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'Neu';
      case 'contacted': return 'Kontaktiert';
      case 'qualified': return 'Qualifiziert';
      case 'converted': return 'Konvertiert';
      case 'lost': return 'Verloren';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, subtitle, icon, color = '#1e3a8a' }) => (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(30, 58, 138, 0.15)' }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
        border: '1px solid rgba(30, 58, 138, 0.1)'
      }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ 
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            mb: 2
          }}>
            {React.cloneElement(icon, { 
              sx: { fontSize: '2rem', color } 
            })}
          </Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1e3a8a', 
            mb: 1 
          }}>
            {value}
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const LeadsTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Kontakt</strong></TableCell>
            <TableCell><strong>Chatbot</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Erstellt</strong></TableCell>
            <TableCell><strong>Aktionen</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 2, bgcolor: '#1e3a8a' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {lead.name || 'Unbekannt'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <Email sx={{ fontSize: '1rem', mr: 0.5 }} />
                      {lead.email}
                    </Typography>
                    {lead.phone && (
                      <Typography variant="body2" color="text.secondary">
                        <Phone sx={{ fontSize: '1rem', mr: 0.5 }} />
                        {lead.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {lead.chatbot_name || 'Unbekannt'}
                </Typography>
              </TableCell>
              <TableCell>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={lead.status}
                    onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                    renderValue={(value) => (
                      <Chip
                        label={getStatusLabel(value)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(value),
                          color: 'white',
                          fontWeight: 600
                        }}
                      />
                    )}
                  >
                    <MenuItem value="new">Neu</MenuItem>
                    <MenuItem value="contacted">Kontaktiert</MenuItem>
                    <MenuItem value="qualified">Qualifiziert</MenuItem>
                    <MenuItem value="converted">Konvertiert</MenuItem>
                    <MenuItem value="lost">Verloren</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(lead.created_at)}
                </Typography>
              </TableCell>
              <TableCell>
                <Tooltip title="Konversation anzeigen">
                  <IconButton 
                    size="small"
                    onClick={() => handleViewConversation(lead.conversation_id)}
                    disabled={selectedChatbot === 'all'}
                  >
                    <Chat />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const ConversationsTable = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Konversation</strong></TableCell>
            <TableCell><strong>Nachrichten</strong></TableCell>
            <TableCell><strong>Dauer</strong></TableCell>
            <TableCell><strong>Lead</strong></TableCell>
            <TableCell><strong>Gestartet</strong></TableCell>
            <TableCell><strong>Aktionen</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {conversations.map((conv) => (
            <TableRow key={conv.conversation_id} hover>
              <TableCell>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {conv.first_user_message?.slice(0, 50) || 'Konversation'}...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {conv.conversation_id.slice(0, 8)}...
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {conv.message_count} Nachrichten
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {conv.duration_minutes} min
                </Typography>
              </TableCell>
              <TableCell>
                {conv.has_lead ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Lead generiert"
                    size="small"
                    color="success"
                  />
                ) : (
                  <Chip
                    label="Kein Lead"
                    size="small"
                    variant="outlined"
                  />
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(conv.started_at)}
                </Typography>
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleViewConversation(conv.conversation_id)}
                >
                  Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading && !conversationDetail) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={50} sx={{ color: '#1e3a8a' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: '#1e3a8a',
            mb: 1
          }}>
            📧 Lead-Management & Konversationen
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Verwalten Sie generierte Leads und analysieren Sie Kundenkonversationen
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Chatbot Filter */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Chatbot auswählen</InputLabel>
            <Select
              value={selectedChatbot}
              onChange={handleChatbotChange}
              label="Chatbot auswählen"
            >
              <MenuItem value="all">Alle Chatbots</MenuItem>
              {chatbots.map((bot) => (
                <MenuItem key={bot.config.id} value={bot.config.id}>
                  {bot.config.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Gesamt Leads"
              value={stats.totalLeads}
              icon={<Email />}
              color="#1e3a8a"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Neue Leads"
              value={stats.newLeads}
              icon={<Star />}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Konvertierte Leads"
              value={stats.convertedLeads}
              icon={<CheckCircle />}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Conversion Rate"
              value={`${stats.conversionRate}%`}
              icon={<TrendingUp />}
              color="#8b5cf6"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="📧 Lead-Generation" />
            <Tab label="💬 Konversationen" disabled={selectedChatbot === 'all'} />
          </Tabs>
        </Box>

        {/* Content */}
        <Card>
          <CardContent>
            {activeTab === 0 && <LeadsTable />}
            {activeTab === 1 && selectedChatbot !== 'all' && <ConversationsTable />}
            {activeTab === 1 && selectedChatbot === 'all' && (
              <Alert severity="info">
                Bitte wählen Sie einen spezifischen Chatbot aus, um Konversationen anzuzeigen.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Conversation Detail Dialog */}
        <Dialog
          open={showConversationDetail}
          onClose={() => setShowConversationDetail(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Konversation Details
            {conversationDetail?.summary?.has_lead && (
              <Chip
                icon={<Email />}
                label="Lead generiert"
                color="success"
                sx={{ ml: 2 }}
              />
            )}
          </DialogTitle>
          <DialogContent>
            {conversationDetail && (
              <Box>
                {/* Conversation Summary */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Nachrichten:</strong> {conversationDetail.summary.message_count}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Dauer:</strong> {conversationDetail.summary.duration_minutes} min
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Gestartet:</strong> {formatDate(conversationDetail.summary.started_at)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Letztes Update:</strong> {formatDate(conversationDetail.summary.last_message_at)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* Lead Info */}
                {conversationDetail.summary.has_lead && conversationDetail.summary.lead_info && (
                  <Box sx={{ mb: 3, p: 2, backgroundColor: '#dbeafe', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e40af' }}>
                      📧 Generierter Lead
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>E-Mail:</strong> {conversationDetail.summary.lead_info.email}
                        </Typography>
                      </Grid>
                      {conversationDetail.summary.lead_info.name && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Name:</strong> {conversationDetail.summary.lead_info.name}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Chip
                          label={getStatusLabel(conversationDetail.summary.lead_info.status)}
                          sx={{
                            bgcolor: getStatusColor(conversationDetail.summary.lead_info.status),
                            color: 'white'
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Messages */}
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {conversationDetail.messages?.map((message, index) => (
                    <Box
                      key={message.id}
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: message.role === 'user' ? '#1e3a8a' : '#f1f5f9',
                          color: message.role === 'user' ? 'white' : 'text.primary'
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>{message.role === 'user' ? '👤 Nutzer' : '🤖 Bot'}:</strong>
                        </Typography>
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          opacity: 0.7,
                          display: 'block',
                          mt: 1
                        }}>
                          {formatDate(message.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConversationDetail(false)}>
              Schließen
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
};

export default LeadManagementPage;