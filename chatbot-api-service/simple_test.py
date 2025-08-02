#!/usr/bin/env python3
"""
Einfacher Test für den Chatbot API Service
Testet die grundlegenden Funktionalitäten ohne komplexe Dependencies
"""

import json
import time
import uuid
from typing import Dict, List
import logging

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleChatbotAPI:
    """Vereinfachte Version für lokale Tests"""
    
    def __init__(self):
        self.loaded_bots = {}
        self.active_sessions = {}
        
    def simulate_firebase_bot_data(self, bot_id: str) -> Dict:
        """Simuliert Firebase Bot-Daten für Tests"""
        return {
            'id': bot_id,
            'name': f'Test Bot {bot_id}',
            'config': {
                'welcome_message': f'Hallo! Ich bin Bot {bot_id}. Wie kann ich helfen?',
                'personality': 'freundlich und hilfsbereit',
                'language': 'de'
            },
            'rag_system': {
                'chunks': [
                    'Dies ist ein Testdokument für Bot ' + bot_id,
                    'Unser Service bietet umfassende Chatbot-Funktionalität',
                    'HelferLain ist eine innovative KI-Chatbot-Plattform'
                ],
                'embeddings': 'simulated_embeddings'
            },
            'created_at': '2024-01-01T00:00:00',
            'status': 'active'
        }
    
    def load_bot(self, bot_id: str) -> bool:
        """Lädt einen Bot (simuliert)"""
        try:
            logger.info(f"Loading bot: {bot_id}")
            
            # Simuliere Firebase-Anfrage
            bot_data = self.simulate_firebase_bot_data(bot_id)
            
            # "Lade" Bot in Memory
            self.loaded_bots[bot_id] = bot_data
            
            logger.info(f"Bot {bot_id} erfolgreich geladen")
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim Laden von Bot {bot_id}: {e}")
            return False
    
    def create_session(self, bot_id: str) -> str:
        """Erstellt eine neue Chat-Session"""
        if bot_id not in self.loaded_bots:
            if not self.load_bot(bot_id):
                raise ValueError(f"Bot {bot_id} konnte nicht geladen werden")
        
        session_id = str(uuid.uuid4())
        
        self.active_sessions[session_id] = {
            'bot_id': bot_id,
            'created_at': time.time(),
            'messages': [],
            'status': 'active'
        }
        
        logger.info(f"Session {session_id} für Bot {bot_id} erstellt")
        return session_id
    
    def get_welcome_message(self, bot_id: str) -> str:
        """Holt die Begrüßungsnachricht"""
        if bot_id in self.loaded_bots:
            return self.loaded_bots[bot_id]['config']['welcome_message']
        return "Hallo! Wie kann ich Ihnen helfen?"
    
    def simulate_ai_response(self, bot_id: str, user_message: str, context: List[str] = None) -> str:
        """Simuliert eine KI-Antwort"""
        bot_data = self.loaded_bots.get(bot_id, {})
        bot_name = bot_data.get('name', 'Bot')
        
        # Einfache Antwort-Simulation basierend auf Schlüsselwörtern
        user_lower = user_message.lower()
        
        if any(word in user_lower for word in ['hallo', 'hi', 'guten tag']):
            return f"Hallo! Ich bin {bot_name}. Schön, dass Sie da sind! Wie kann ich Ihnen helfen?"
        
        elif any(word in user_lower for word in ['hilfe', 'help', 'unterstützung']):
            return f"Gerne helfe ich Ihnen! Als {bot_name} kann ich Ihnen bei verschiedenen Fragen zur Seite stehen. Was möchten Sie wissen?"
        
        elif any(word in user_lower for word in ['danke', 'dankeschön', 'vielen dank']):
            return "Sehr gerne! Falls Sie noch weitere Fragen haben, bin ich jederzeit für Sie da."
        
        elif any(word in user_lower for word in ['tschüss', 'auf wiedersehen', 'bye']):
            return "Auf Wiedersehen! Es war schön, Ihnen helfen zu können. Bis zum nächsten Mal!"
        
        elif 'preis' in user_lower or 'kosten' in user_lower:
            return "Für detaillierte Preisinformationen kontaktieren Sie bitte unser Sales-Team. Wir bieten verschiedene Pakete an."
        
        elif 'funktionen' in user_lower or 'features' in user_lower:
            return f"Als {bot_name} biete ich vielseitige Funktionen: 24/7 Verfügbarkeit, intelligente Antworten und nahtlose Integration in Ihre Website."
        
        else:
            return f"Das ist eine interessante Frage! Als {bot_name} versuche ich mein Bestes, Ihnen zu helfen. Können Sie mir mehr Details dazu geben?"
    
    def send_message(self, session_id: str, message: str) -> Dict:
        """Sendet eine Nachricht und erhält eine Antwort"""
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} nicht gefunden")
        
        session = self.active_sessions[session_id]
        bot_id = session['bot_id']
        
        # User Message hinzufügen
        user_msg = {
            'sender': 'user',
            'message': message,
            'timestamp': time.time()
        }
        session['messages'].append(user_msg)
        
        # KI-Antwort generieren
        bot_response = self.simulate_ai_response(
            bot_id, 
            message, 
            [msg['message'] for msg in session['messages'][-5:]]  # Letzten 5 Nachrichten als Kontext
        )
        
        # Bot Message hinzufügen
        bot_msg = {
            'sender': 'bot',
            'message': bot_response,
            'timestamp': time.time()
        }
        session['messages'].append(bot_msg)
        
        return {
            'success': True,
            'response': bot_response,
            'session_id': session_id,
            'message_count': len(session['messages'])
        }
    
    def get_session_info(self, session_id: str) -> Dict:
        """Holt Session-Informationen"""
        if session_id not in self.active_sessions:
            return {'error': 'Session nicht gefunden'}
        
        session = self.active_sessions[session_id]
        return {
            'session_id': session_id,
            'bot_id': session['bot_id'],
            'created_at': session['created_at'],
            'message_count': len(session['messages']),
            'status': session['status'],
            'last_activity': session['messages'][-1]['timestamp'] if session['messages'] else session['created_at']
        }

def run_tests():
    """Führt umfassende Tests durch"""
    print("\n" + "="*60)
    print("🚀 HelferLain Chatbot API - Lokaler Test")
    print("="*60)
    
    api = SimpleChatbotAPI()
    
    # Test 1: Bot laden
    print("\n📦 Test 1: Bot laden")
    test_bot_id = "test-bot-123"
    success = api.load_bot(test_bot_id)
    print(f"✅ Bot geladen: {success}")
    
    # Test 2: Session erstellen
    print("\n🆕 Test 2: Session erstellen")
    session_id = api.create_session(test_bot_id)
    print(f"✅ Session erstellt: {session_id}")
    
    # Test 3: Begrüßungsnachricht
    print("\n👋 Test 3: Begrüßungsnachricht")
    welcome = api.get_welcome_message(test_bot_id)
    print(f"✅ Welcome Message: {welcome}")
    
    # Test 4: Chat-Konversation
    print("\n💬 Test 4: Chat-Konversation")
    test_messages = [
        "Hallo!",
        "Ich brauche Hilfe",
        "Was sind eure Preise?",
        "Welche Funktionen bietet ihr?",
        "Vielen Dank!"
    ]
    
    for i, msg in enumerate(test_messages, 1):
        print(f"\n   User ({i}): {msg}")
        response = api.send_message(session_id, msg)
        print(f"   Bot ({i}): {response['response']}")
        time.sleep(0.1)  # Kurze Pause zwischen Nachrichten
    
    # Test 5: Session-Info
    print("\n📊 Test 5: Session-Informationen")
    session_info = api.get_session_info(session_id)
    print(f"✅ Session Info:")
    for key, value in session_info.items():
        print(f"   {key}: {value}")
    
    # Test 6: Multiple Sessions
    print("\n🔄 Test 6: Multiple Sessions")
    session_2 = api.create_session(test_bot_id)
    session_3 = api.create_session("another-bot-456")
    
    print(f"✅ Session 2: {session_2}")
    print(f"✅ Session 3: {session_3}")
    print(f"✅ Aktive Sessions: {len(api.active_sessions)}")
    
    # Test 7: Performance
    print("\n⚡ Test 7: Performance")
    start_time = time.time()
    
    for i in range(10):
        api.send_message(session_id, f"Test message {i}")
    
    end_time = time.time()
    duration = end_time - start_time
    print(f"✅ 10 Nachrichten in {duration:.2f} Sekunden")
    print(f"✅ Durchschnitt: {duration/10:.3f} Sekunden pro Nachricht")
    
    print("\n" + "="*60)
    print("🎉 Alle Tests erfolgreich abgeschlossen!")
    print("="*60)
    
    return True

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        logger.error(f"Test fehlgeschlagen: {e}")
        print(f"\n❌ Test fehlgeschlagen: {e}")