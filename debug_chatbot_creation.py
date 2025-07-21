#!/usr/bin/env python3
"""
Debug script für Chatbot-Erstellung
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import traceback

# Load environment
load_dotenv()

# Add project to path
sys.path.append(str(Path(__file__).parent))

from utils.chatbot_factory import ChatbotFactory
from utils.multi_source_rag import MultiSourceRAG

def debug_chatbot_creation():
    """Debug der Chatbot-Erstellung Schritt für Schritt"""
    
    print("🔍 Debug: Chatbot-Erstellung")
    print("=" * 50)
    
    try:
        # 1. Factory erstellen
        print("1. ChatbotFactory erstellen...")
        factory = ChatbotFactory()
        print("✅ ChatbotFactory erstellt")
        
        # 2. Einfacher Test-Chatbot
        print("\n2. Test-Chatbot erstellen...")
        
        def progress_callback(message, progress):
            print(f"   Progress: {progress*100:.1f}% - {message}")
        
        chatbot_id = factory.create_chatbot(
            name="Debug Test Bot",
            description="Ein einfacher Test-Chatbot",
            website_url=None,  # Keine Website
            uploaded_documents=None,  # Keine Dokumente
            branding={},
            extended_config={
                "manual_text": "Das ist ein Test-Text für den Debug-Chatbot. Er soll nur testen, ob die Grundfunktionen funktionieren."
            },
            progress_callback=progress_callback
        )
        
        if chatbot_id:
            print(f"✅ Chatbot erfolgreich erstellt: {chatbot_id}")
            
            # 3. Test RAG-System laden
            print(f"\n3. RAG-System laden...")
            rag = MultiSourceRAG(chatbot_id)
            
            if rag.index_file.exists():
                print("✅ Index-Datei existiert")
            else:
                print("❌ Index-Datei fehlt")
                
            if rag.metadata_file.exists():
                print("✅ Metadata-Datei existiert")
            else:
                print("❌ Metadata-Datei fehlt")
                
            # 4. Test-Query
            print(f"\n4. Test-Query...")
            try:
                response = rag.get_response("Was ist das für ein Chatbot?")
                print(f"✅ Response: {response[:100]}...")
            except Exception as e:
                print(f"❌ Query-Fehler: {e}")
                
        else:
            print("❌ Chatbot-Erstellung fehlgeschlagen")
            
    except Exception as e:
        print(f"❌ Fehler: {e}")
        print(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    debug_chatbot_creation()