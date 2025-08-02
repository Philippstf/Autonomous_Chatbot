import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from typing import Dict, List, Any

# Page Config
st.set_page_config(
    page_title="HelferLain Analytics",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
        padding: 2rem;
        border-radius: 10px;
        color: white;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: #f8fafc;
        padding: 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #4f46e5;
        margin-bottom: 1rem;
    }
    .kpi-container {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 1rem;
        margin: 2rem 0;
    }
    .kpi-card {
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        min-width: 200px;
        border-top: 4px solid #4f46e5;
    }
    .kpi-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: #4f46e5;
        margin: 0.5rem 0;
    }
    .kpi-label {
        color: #6b7280;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .trend-up {
        color: #10b981;
    }
    .trend-down {
        color: #ef4444;
    }
</style>
""", unsafe_allow_html=True)

class AnalyticsDashboard:
    def __init__(self):
        self.init_firebase()
        self.db = firestore.client()
    
    def init_firebase(self):
        """Initialize Firebase connection"""
        if not firebase_admin._apps:
            try:
                # Try to load from credentials file
                cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-credentials.json')
                if os.path.exists(cred_path):
                    cred = credentials.Certificate(cred_path)
                else:
                    # Fallback to environment variables
                    cred_dict = {
                        "type": "service_account",
                        "project_id": os.getenv('FIREBASE_PROJECT_ID'),
                        "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
                        "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
                        "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
                        "client_id": os.getenv('FIREBASE_CLIENT_ID'),
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
                    }
                    cred = credentials.Certificate(cred_dict)
                
                firebase_admin.initialize_app(cred)
            except Exception as e:
                st.error(f"Firebase Verbindung fehlgeschlagen: {e}")
                return False
        return True
    
    def get_chatbot_analytics(self, bot_id: str = None, days: int = 30) -> Dict:
        """Hole Chatbot Analytics aus Firebase"""
        try:
            # Chat Sessions
            sessions_ref = self.db.collection('chat_sessions')
            
            if bot_id:
                sessions_ref = sessions_ref.where('bot_id', '==', bot_id)
            
            # Zeitraum Filter
            start_date = datetime.now() - timedelta(days=days)
            sessions_ref = sessions_ref.where('created_at', '>=', start_date)
            
            sessions = list(sessions_ref.stream())
            
            analytics_data = {
                'total_sessions': len(sessions),
                'total_messages': 0,
                'avg_session_length': 0,
                'user_satisfaction': 0,
                'popular_topics': {},
                'daily_sessions': {},
                'hourly_distribution': {},
                'response_times': [],
                'resolution_rate': 0,
                'sessions_data': []
            }
            
            session_lengths = []
            satisfaction_scores = []
            
            for session_doc in sessions:
                session_data = session_doc.to_dict()
                session_id = session_doc.id
                
                # Session Details
                created_at = session_data.get('created_at')
                if created_at:
                    day_key = created_at.strftime('%Y-%m-%d')
                    hour_key = created_at.strftime('%H')
                    
                    analytics_data['daily_sessions'][day_key] = analytics_data['daily_sessions'].get(day_key, 0) + 1
                    analytics_data['hourly_distribution'][hour_key] = analytics_data['hourly_distribution'].get(hour_key, 0) + 1
                
                # Messages Count
                messages_ref = self.db.collection('chat_sessions').document(session_id).collection('messages')
                messages = list(messages_ref.stream())
                message_count = len(messages)
                analytics_data['total_messages'] += message_count
                
                # Session Length (in minutes)
                if len(messages) > 1:
                    first_msg = messages[0].to_dict().get('timestamp')
                    last_msg = messages[-1].to_dict().get('timestamp')
                    if first_msg and last_msg:
                        duration = (last_msg - first_msg).total_seconds() / 60
                        session_lengths.append(duration)
                
                # Satisfaction Score
                satisfaction = session_data.get('satisfaction_score')
                if satisfaction:
                    satisfaction_scores.append(satisfaction)
                
                # Response Times
                for i in range(len(messages) - 1):
                    current_msg = messages[i].to_dict()
                    next_msg = messages[i + 1].to_dict()
                    
                    if current_msg.get('sender') == 'user' and next_msg.get('sender') == 'bot':
                        response_time = (next_msg['timestamp'] - current_msg['timestamp']).total_seconds()
                        analytics_data['response_times'].append(response_time)
                
                # Session Summary
                analytics_data['sessions_data'].append({
                    'session_id': session_id,
                    'created_at': created_at,
                    'message_count': message_count,
                    'bot_id': session_data.get('bot_id'),
                    'satisfaction': satisfaction,
                    'resolved': session_data.get('resolved', False)
                })
            
            # Calculate Averages
            if session_lengths:
                analytics_data['avg_session_length'] = sum(session_lengths) / len(session_lengths)
            
            if satisfaction_scores:
                analytics_data['user_satisfaction'] = sum(satisfaction_scores) / len(satisfaction_scores)
            
            # Resolution Rate
            resolved_sessions = sum(1 for session in analytics_data['sessions_data'] if session.get('resolved'))
            if analytics_data['total_sessions'] > 0:
                analytics_data['resolution_rate'] = (resolved_sessions / analytics_data['total_sessions']) * 100
            
            return analytics_data
            
        except Exception as e:
            st.error(f"Fehler beim Laden der Analytics: {e}")
            return {}
    
    def get_available_bots(self) -> List[Dict]:
        """Hole alle verfügbaren Chatbots"""
        try:
            bots_ref = self.db.collection('chatbots')
            bots = list(bots_ref.stream())
            
            bot_list = []
            for bot_doc in bots:
                bot_data = bot_doc.to_dict()
                bot_list.append({
                    'id': bot_doc.id,
                    'name': bot_data.get('name', 'Unbenannt'),
                    'created_at': bot_data.get('created_at'),
                    'status': bot_data.get('status', 'active')
                })
            
            return bot_list
        except Exception as e:
            st.error(f"Fehler beim Laden der Chatbots: {e}")
            return []
    
    def render_kpi_cards(self, analytics: Dict):
        """Render KPI Cards"""
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-label">Total Sessions</div>
                    <div class="kpi-value">{analytics.get('total_sessions', 0):,}</div>
                </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-label">Total Messages</div>
                    <div class="kpi-value">{analytics.get('total_messages', 0):,}</div>
                </div>
            """, unsafe_allow_html=True)
        
        with col3:
            satisfaction = analytics.get('user_satisfaction', 0)
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-label">User Satisfaction</div>
                    <div class="kpi-value">{satisfaction:.1f}/5.0</div>
                </div>
            """, unsafe_allow_html=True)
        
        with col4:
            resolution = analytics.get('resolution_rate', 0)
            st.markdown(f"""
                <div class="kpi-card">
                    <div class="kpi-label">Resolution Rate</div>
                    <div class="kpi-value">{resolution:.1f}%</div>
                </div>
            """, unsafe_allow_html=True)
    
    def render_charts(self, analytics: Dict):
        """Render Analytics Charts"""
        
        # Daily Sessions Chart
        if analytics.get('daily_sessions'):
            st.subheader("📈 Sessions pro Tag")
            daily_data = analytics['daily_sessions']
            df_daily = pd.DataFrame(list(daily_data.items()), columns=['Date', 'Sessions'])
            df_daily['Date'] = pd.to_datetime(df_daily['Date'])
            df_daily = df_daily.sort_values('Date')
            
            fig_daily = px.line(df_daily, x='Date', y='Sessions', 
                              title='Sessions über Zeit',
                              line_shape='spline')
            fig_daily.update_traces(line_color='#4f46e5', line_width=3)
            fig_daily.update_layout(showlegend=False)
            st.plotly_chart(fig_daily, use_container_width=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Hourly Distribution
            if analytics.get('hourly_distribution'):
                st.subheader("🕐 Sessions nach Stunden")
                hourly_data = analytics['hourly_distribution']
                df_hourly = pd.DataFrame(list(hourly_data.items()), columns=['Hour', 'Sessions'])
                df_hourly['Hour'] = df_hourly['Hour'].astype(int)
                df_hourly = df_hourly.sort_values('Hour')
                
                fig_hourly = px.bar(df_hourly, x='Hour', y='Sessions',
                                  title='Aktivität nach Tageszeit')
                fig_hourly.update_traces(marker_color='#4f46e5')
                st.plotly_chart(fig_hourly, use_container_width=True)
        
        with col2:
            # Response Times
            if analytics.get('response_times'):
                st.subheader("⚡ Response Times")
                response_times = analytics['response_times']
                avg_response = sum(response_times) / len(response_times)
                
                fig_response = go.Figure()
                fig_response.add_trace(go.Histogram(
                    x=response_times,
                    nbinsx=20,
                    marker_color='#4f46e5',
                    opacity=0.7
                ))
                fig_response.update_layout(
                    title=f'Response Time Distribution (Avg: {avg_response:.1f}s)',
                    xaxis_title='Response Time (seconds)',
                    yaxis_title='Frequency'
                )
                st.plotly_chart(fig_response, use_container_width=True)
    
    def render_session_table(self, analytics: Dict):
        """Render Session Details Table"""
        if analytics.get('sessions_data'):
            st.subheader("📋 Recent Sessions")
            
            df_sessions = pd.DataFrame(analytics['sessions_data'])
            df_sessions['created_at'] = pd.to_datetime(df_sessions['created_at'])
            df_sessions = df_sessions.sort_values('created_at', ascending=False)
            
            # Format columns
            df_display = df_sessions.copy()
            df_display['Created'] = df_display['created_at'].dt.strftime('%Y-%m-%d %H:%M')
            df_display['Messages'] = df_display['message_count']
            df_display['Satisfied'] = df_display['satisfaction'].fillna('N/A')
            df_display['Resolved'] = df_display['resolved'].map({True: '✅', False: '❌', None: '⏳'})
            
            # Show table
            st.dataframe(
                df_display[['session_id', 'Created', 'Messages', 'Satisfied', 'Resolved']],
                use_container_width=True,
                hide_index=True
            )
    
    def run(self):
        """Main Dashboard"""
        
        # Header
        st.markdown("""
            <div class="main-header">
                <h1>📊 HelferLain Analytics Dashboard</h1>
                <p>Comprehensive analytics for your chatbot performance</p>
            </div>
        """, unsafe_allow_html=True)
        
        # Sidebar
        st.sidebar.title("🎛️ Dashboard Controls")
        
        # Bot Selection
        bots = self.get_available_bots()
        bot_options = ['Alle Chatbots'] + [f"{bot['name']} ({bot['id']})" for bot in bots]
        selected_bot = st.sidebar.selectbox("Chatbot auswählen:", bot_options)
        
        bot_id = None
        if selected_bot != 'Alle Chatbots':
            bot_id = selected_bot.split('(')[-1].rstrip(')')
        
        # Time Range
        time_range = st.sidebar.selectbox(
            "Zeitraum:",
            ["Letzten 7 Tage", "Letzten 30 Tage", "Letzten 90 Tage", "Letztes Jahr"]
        )
        
        days_map = {
            "Letzten 7 Tage": 7,
            "Letzten 30 Tage": 30,
            "Letzten 90 Tage": 90,
            "Letztes Jahr": 365
        }
        days = days_map[time_range]
        
        # Refresh Button
        if st.sidebar.button("🔄 Daten aktualisieren", type="primary"):
            st.cache_data.clear()
            st.rerun()
        
        # Get Analytics Data
        with st.spinner("Loading analytics..."):
            analytics = self.get_chatbot_analytics(bot_id, days)
        
        if not analytics:
            st.error("Keine Analytics-Daten verfügbar")
            return
        
        # Render Dashboard
        self.render_kpi_cards(analytics)
        
        st.markdown("---")
        
        self.render_charts(analytics)
        
        st.markdown("---")
        
        self.render_session_table(analytics)
        
        # Export Options
        st.sidebar.markdown("---")
        st.sidebar.subheader("📊 Export")
        
        if st.sidebar.button("📥 Export CSV"):
            if analytics.get('sessions_data'):
                df = pd.DataFrame(analytics['sessions_data'])
                csv = df.to_csv(index=False)
                st.sidebar.download_button(
                    label="Download CSV",
                    data=csv,
                    file_name=f"helferlain_analytics_{datetime.now().strftime('%Y%m%d')}.csv",
                    mime="text/csv"
                )

# Main App
if __name__ == "__main__":
    dashboard = AnalyticsDashboard()
    dashboard.run()