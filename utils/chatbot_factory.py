# platform/utils/chatbot_factory.py

import os
import json
import uuid
from typing import Dict, List, Optional, Union
from pathlib import Path
from datetime import datetime
import streamlit as st
from dataclasses import dataclass, asdict
import shutil

from .multi_source_rag import MultiSourceRAG, create_chatbot_id

@dataclass
class ChatbotConfig:
    """Konfiguration für einen Chatbot"""
    id: str
    name: str
    description: str
    website_url: Optional[str] = None
    documents: Optional[List[str]] = None
    created_at: str = None
    branding: Optional[Dict] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.documents is None:
            self.documents = []
        if self.branding is None:
            self.branding = {
                "primary_color": "#1f3a93",
                "secondary_color": "#34495e",
                "logo_url": None,
                "welcome_message": f"Hallo! Ich bin {self.name}, dein persönlicher Assistent."
            }

class ChatbotFactory:
    """Factory für die Erstellung und Verwaltung von Chatbots"""
    
    def __init__(self):
        self.base_dir = Path("data")
        self.chatbots_dir = self.base_dir / "chatbots"
        self.registry_file = self.base_dir / "chatbot_registry.json"
        
        # Erstelle Verzeichnisse
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.chatbots_dir.mkdir(parents=True, exist_ok=True)
        
        # Lade Registry
        self.registry = self._load_registry()
    
    def _load_registry(self) -> Dict:
        """Lädt die Chatbot-Registry"""
        if self.registry_file.exists():
            try:
                with open(self.registry_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                st.error(f"Fehler beim Laden der Registry: {e}")
        
        return {"chatbots": {}, "created_at": datetime.now().isoformat()}
    
    def _save_registry(self):
        """Speichert die Chatbot-Registry"""
        try:
            with open(self.registry_file, 'w', encoding='utf-8') as f:
                json.dump(self.registry, f, ensure_ascii=False, indent=2)
        except Exception as e:
            st.error(f"Fehler beim Speichern der Registry: {e}")
    
    def create_chatbot(self, 
                      name: str, 
                      description: str,
                      website_url: Optional[str] = None,
                      uploaded_documents: Optional[List] = None,
                      branding: Optional[Dict] = None,
                      progress_callback=None) -> Optional[str]:
        """
        Erstellt einen neuen Chatbot
        
        Args:
            name: Name des Chatbots
            description: Beschreibung des Chatbots
            website_url: Optional URL für Website-Scraping
            uploaded_documents: Liste von hochgeladenen Dateien
            branding: Branding-Konfiguration
            progress_callback: Callback für Progress Updates
            
        Returns:
            Chatbot-ID wenn erfolgreich, None sonst
        """
        try:
            # Erstelle eindeutige ID
            chatbot_id = create_chatbot_id()
            
            if progress_callback:
                progress_callback("Initialisiere Chatbot...", 0.05)
            
            # Erstelle Konfiguration
            config = ChatbotConfig(
                id=chatbot_id,
                name=name,
                description=description,
                website_url=website_url,
                branding=branding
            )
            
            # Verarbeite Dokumente falls vorhanden
            document_chunks = []
            if uploaded_documents:
                if progress_callback:
                    progress_callback("Verarbeite hochgeladene Dokumente...", 0.1)
                
                from .pdf_processor import document_processor
                
                for uploaded_file in uploaded_documents:
                    chunks = document_processor.process_uploaded_file(uploaded_file)
                    document_chunks.extend(chunks)
                    config.documents.append(uploaded_file.name)
            
            # Erstelle RAG-System
            rag_system = MultiSourceRAG(chatbot_id)
            
            if progress_callback:
                progress_callback("Erstelle Wissensbasis...", 0.2)
            
            # Verarbeite alle Datenquellen
            success = rag_system.process_multiple_sources(
                website_url=website_url,
                document_chunks=document_chunks,
                progress_callback=progress_callback
            )
            
            if not success:
                # Cleanup bei Fehler
                self._cleanup_chatbot(chatbot_id)
                return None
            
            # Speichere Konfiguration
            self._save_chatbot_config(config)
            
            # Registriere Chatbot
            self.registry["chatbots"][chatbot_id] = {
                "name": name,
                "description": description,
                "created_at": config.created_at,
                "website_url": website_url,
                "document_count": len(config.documents),
                "status": "active"
            }
            self._save_registry()
            
            if progress_callback:
                progress_callback("✅ Chatbot erfolgreich erstellt!", 1.0)
            
            return chatbot_id
            
        except Exception as e:
            st.error(f"Fehler beim Erstellen des Chatbots: {str(e)}")
            if 'chatbot_id' in locals():
                self._cleanup_chatbot(chatbot_id)
            return None
    
    def _save_chatbot_config(self, config: ChatbotConfig):
        """Speichert Chatbot-Konfiguration"""
        config_dir = self.chatbots_dir / config.id
        config_dir.mkdir(parents=True, exist_ok=True)
        
        config_file = config_dir / "config.json"
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(config), f, ensure_ascii=False, indent=2)
    
    def load_chatbot_config(self, chatbot_id: str) -> Optional[ChatbotConfig]:
        """Lädt Chatbot-Konfiguration"""
        try:
            config_file = self.chatbots_dir / chatbot_id / "config.json"
            
            if not config_file.exists():
                return None
            
            with open(config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            return ChatbotConfig(**data)
            
        except Exception as e:
            st.error(f"Fehler beim Laden der Chatbot-Konfiguration: {e}")
            return None
    
    def get_all_chatbots(self) -> List[Dict]:
        """Gibt alle registrierten Chatbots zurück"""
        chatbots = []
        
        for chatbot_id, info in self.registry["chatbots"].items():
            config = self.load_chatbot_config(chatbot_id)
            if config:
                # Zusätzliche Informationen abrufen
                rag_system = MultiSourceRAG(chatbot_id)
                rag_info = rag_system.get_chatbot_info()
                
                chatbot_info = {
                    "id": chatbot_id,
                    "config": config,
                    "registry_info": info,
                    "rag_info": rag_info
                }
                chatbots.append(chatbot_info)
        
        return chatbots
    
    def delete_chatbot(self, chatbot_id: str) -> bool:
        """Löscht einen Chatbot"""
        try:
            # Entferne aus Registry
            if chatbot_id in self.registry["chatbots"]:
                del self.registry["chatbots"][chatbot_id]
                self._save_registry()
            
            # Lösche Dateien
            self._cleanup_chatbot(chatbot_id)
            
            return True
            
        except Exception as e:
            st.error(f"Fehler beim Löschen des Chatbots: {e}")
            return False
    
    def _cleanup_chatbot(self, chatbot_id: str):
        """Löscht alle Dateien eines Chatbots"""
        chatbot_dir = self.chatbots_dir / chatbot_id
        if chatbot_dir.exists():
            shutil.rmtree(chatbot_dir)
    
    def chatbot_exists(self, chatbot_id: str) -> bool:
        """Prüft ob Chatbot existiert"""
        return chatbot_id in self.registry["chatbots"]
    
    def get_chatbot_url(self, chatbot_id: str) -> str:
        """Gibt die URL für einen Chatbot zurück"""
        # In Production würde hier die echte Domain stehen
        base_url = "http://localhost:8501"  # Streamlit default
        return f"{base_url}/chatbot?id={chatbot_id}"

# Globale Factory-Instanz
chatbot_factory = ChatbotFactory()