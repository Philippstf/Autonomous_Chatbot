# Cloud-enabled Multi-Source RAG mit Firebase Storage Integration
import os
import json
import pickle
import numpy as np
import faiss
from typing import List, Dict, Union, Optional
from pathlib import Path
from openai import OpenAI
import openai
from dotenv import load_dotenv
import streamlit as st
import uuid
import shutil
import logging
import tempfile

from .firebase_storage import get_firebase_storage
from .multi_source_rag import MultiSourceRAG

load_dotenv()
logger = logging.getLogger(__name__)

class CloudMultiSourceRAG(MultiSourceRAG):
    """
    Erweiterte RAG-Pipeline mit Firebase Storage Integration
    Kombiniert lokale Verarbeitung mit persistenter Cloud-Speicherung
    """
    
    def __init__(self, chatbot_id: str, use_cloud_storage: bool = True):
        """
        Initialisiert Cloud-enabled RAG System
        
        Args:
            chatbot_id: ID des Chatbots
            use_cloud_storage: Ob Firebase Storage verwendet werden soll
        """
        # Parent Klasse initialisieren
        super().__init__(chatbot_id)
        
        self.use_cloud_storage = use_cloud_storage
        self.firebase_storage = get_firebase_storage() if use_cloud_storage else None
        
        logger.info(f"🔧 CloudMultiSourceRAG initialized for {chatbot_id} (cloud: {use_cloud_storage})")
    
    def process_multiple_sources(self, 
                                website_url: Optional[str] = None,
                                document_chunks: Optional[List[Dict]] = None,
                                manual_text: Optional[str] = None,
                                progress_callback=None) -> bool:
        """
        Verarbeitet multiple Datenquellen und speichert in Firebase Storage
        """
        try:
            # Lokale Verarbeitung mit Parent-Klasse
            success = super().process_multiple_sources(
                website_url=website_url,
                document_chunks=document_chunks,
                manual_text=manual_text,
                progress_callback=progress_callback
            )
            
            if not success:
                return False
            
            # Nach erfolgreicher lokaler Verarbeitung: Upload zu Firebase Storage
            if self.use_cloud_storage and self.firebase_storage:
                if progress_callback:
                    progress_callback("Speichere zu Firebase Storage...", 0.95)
                
                upload_success = self.firebase_storage.upload_chatbot_files(
                    self.chatbot_id, 
                    self.chatbot_dir
                )
                
                if upload_success:
                    logger.info(f"✅ Chatbot {self.chatbot_id} files uploaded to Firebase Storage")
                    if progress_callback:
                        progress_callback("Erfolgreich in Cloud gespeichert!", 1.0)
                else:
                    logger.warning(f"⚠️ Failed to upload chatbot {self.chatbot_id} to Firebase Storage")
                    # Trotzdem erfolgreich, da lokale Dateien existieren
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to process sources for {self.chatbot_id}: {e}")
            if progress_callback:
                progress_callback(f"Fehler: {str(e)}", 0.0)
            return False
    
    def load_rag_system(self):
        """
        Lädt RAG-System - erst lokal, dann von Firebase Storage falls nötig
        """
        try:
            # Zuerst versuchen lokal zu laden
            if self.index_file.exists() and self.metadata_file.exists():
                logger.info(f"📁 Loading RAG system locally for {self.chatbot_id}")
                return super().load_rag_system()
            
            # Falls lokal nicht verfügbar und Cloud Storage aktiviert: Download versuchen
            if self.use_cloud_storage and self.firebase_storage:
                logger.info(f"☁️ Attempting to download RAG system from Firebase Storage for {self.chatbot_id}")
                
                if self.firebase_storage.chatbot_exists_in_storage(self.chatbot_id):
                    # Download von Firebase Storage
                    download_success = self.firebase_storage.download_chatbot_files(
                        self.chatbot_id,
                        self.chatbot_dir
                    )
                    
                    if download_success and self.index_file.exists() and self.metadata_file.exists():
                        logger.info(f"✅ Successfully downloaded and loaded RAG system for {self.chatbot_id}")
                        return super().load_rag_system()
                    else:
                        logger.error(f"❌ Download failed or files incomplete for {self.chatbot_id}")
                else:
                    logger.warning(f"⚠️ Chatbot {self.chatbot_id} not found in Firebase Storage")
            
            # Wenn weder lokal noch in Cloud verfügbar
            raise FileNotFoundError(f"RAG system files not found for chatbot {self.chatbot_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load RAG system for {self.chatbot_id}: {e}")
            raise e
    
    def initialize_from_cloud(self) -> bool:
        """
        Initialisiert RAG-System von Firebase Storage
        
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            if not self.use_cloud_storage or not self.firebase_storage:
                logger.warning("Cloud storage not enabled")
                return False
            
            if not self.firebase_storage.chatbot_exists_in_storage(self.chatbot_id):
                logger.warning(f"Chatbot {self.chatbot_id} not found in Firebase Storage")
                return False
            
            # Download von Firebase Storage
            success = self.firebase_storage.download_chatbot_files(
                self.chatbot_id,
                self.chatbot_dir
            )
            
            if success:
                logger.info(f"✅ Successfully initialized {self.chatbot_id} from Firebase Storage")
                return True
            else:
                logger.error(f"❌ Failed to download {self.chatbot_id} from Firebase Storage")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error initializing {self.chatbot_id} from cloud: {e}")
            return False
    
    def sync_to_cloud(self) -> bool:
        """
        Synchronisiert lokale RAG-Dateien mit Firebase Storage
        
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            if not self.use_cloud_storage or not self.firebase_storage:
                logger.warning("Cloud storage not enabled")
                return False
            
            if not (self.index_file.exists() and self.metadata_file.exists()):
                logger.error(f"Local RAG files missing for {self.chatbot_id}")
                return False
            
            success = self.firebase_storage.upload_chatbot_files(
                self.chatbot_id,
                self.chatbot_dir
            )
            
            if success:
                logger.info(f"✅ Successfully synced {self.chatbot_id} to Firebase Storage")
                return True
            else:
                logger.error(f"❌ Failed to sync {self.chatbot_id} to Firebase Storage")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error syncing {self.chatbot_id} to cloud: {e}")
            return False
    
    def delete_from_cloud(self) -> bool:
        """
        Löscht Chatbot-Dateien aus Firebase Storage
        
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            if not self.use_cloud_storage or not self.firebase_storage:
                logger.warning("Cloud storage not enabled")
                return False
            
            success = self.firebase_storage.delete_chatbot_files(self.chatbot_id)
            
            if success:
                logger.info(f"✅ Successfully deleted {self.chatbot_id} from Firebase Storage")
                return True
            else:
                logger.error(f"❌ Failed to delete {self.chatbot_id} from Firebase Storage")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error deleting {self.chatbot_id} from cloud: {e}")
            return False
    
    def get_debug_info(self) -> Dict:
        """
        Gibt Debug-Informationen über lokale und Cloud-Dateien zurück
        
        Returns:
            Dictionary mit Debug-Informationen
        """
        try:
            debug_info = {
                "chatbot_id": self.chatbot_id,
                "use_cloud_storage": self.use_cloud_storage,
                "local_files": {
                    "index_file": str(self.index_file),
                    "metadata_file": str(self.metadata_file),
                    "chatbot_dir": str(self.chatbot_dir),
                    "index_exists": self.index_file.exists(),
                    "metadata_exists": self.metadata_file.exists(),
                    "chatbot_dir_exists": self.chatbot_dir.exists()
                }
            }
            
            # Cloud Storage Info hinzufügen
            if self.use_cloud_storage and self.firebase_storage:
                debug_info["cloud_storage"] = {
                    "enabled": True,
                    "chatbot_exists_in_cloud": self.firebase_storage.chatbot_exists_in_storage(self.chatbot_id),
                    "bucket_name": self.firebase_storage.bucket.name
                }
            else:
                debug_info["cloud_storage"] = {
                    "enabled": False
                }
            
            return debug_info
            
        except Exception as e:
            return {
                "error": str(e),
                "chatbot_id": self.chatbot_id
            }

def create_chatbot_id() -> str:
    """Erstellt eine eindeutige Chatbot-ID"""
    return str(uuid.uuid4())[:8]