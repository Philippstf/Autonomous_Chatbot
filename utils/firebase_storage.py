# Firebase Storage Integration für RAG-Dateien
import os
import json
import pickle
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any
import logging
from firebase_admin import storage

logger = logging.getLogger(__name__)

class FirebaseStorageManager:
    """
    Verwaltet RAG-Dateien in Firebase Storage
    Ersetzt lokale Dateispeicherung für persistente Cloud-Storage
    """
    
    def __init__(self, bucket_name: Optional[str] = None):
        """
        Initialisiert Firebase Storage Manager
        
        Args:
            bucket_name: Name des Firebase Storage Buckets (optional)
        """
        try:
            # Firebase Storage Bucket initialisieren - immer expliziter Name
            bucket_name = bucket_name or "helferlain-a4178.firebasestorage.app"
            
            # Versuche verschiedene Ansätze für Storage Bucket
            try:
                # Ansatz 1: Mit explizitem bucket Namen
                self.bucket = storage.bucket(bucket_name)
                logger.info(f"✅ Firebase Storage initialized with explicit bucket: {self.bucket.name}")
            except Exception as e1:
                logger.warning(f"Explicit bucket failed: {e1}, trying app default...")
                try:
                    # Ansatz 2: Lade über default app
                    from firebase_admin import get_app
                    app = get_app()
                    self.bucket = storage.bucket(bucket_name, app)
                    logger.info(f"✅ Firebase Storage initialized via app reference: {self.bucket.name}")
                except Exception as e2:
                    logger.error(f"App-based bucket failed: {e2}")
                    raise e2
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Firebase Storage: {e}")
            raise
    
    def upload_file(self, local_path: Path, cloud_path: str) -> bool:
        """
        Lädt eine lokale Datei zu Firebase Storage hoch
        
        Args:
            local_path: Lokaler Dateipfad
            cloud_path: Zielpfad in Firebase Storage
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            if not local_path.exists():
                logger.error(f"Local file does not exist: {local_path}")
                return False
            
            # Blob erstellen und Datei hochladen
            blob = self.bucket.blob(cloud_path)
            
            # Content-Type basierend auf Dateierweiterung setzen
            content_type = self._get_content_type(local_path)
            
            with open(local_path, 'rb') as file_data:
                blob.upload_from_file(file_data, content_type=content_type)
            
            logger.info(f"✅ Uploaded {local_path} to {cloud_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to upload {local_path}: {e}")
            return False
    
    def download_file(self, cloud_path: str, local_path: Path) -> bool:
        """
        Lädt eine Datei von Firebase Storage herunter
        
        Args:
            cloud_path: Quellpfad in Firebase Storage
            local_path: Lokaler Zielpfad
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            # Lokales Verzeichnis erstellen falls nötig
            local_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Blob holen und Datei herunterladen
            blob = self.bucket.blob(cloud_path)
            
            if not blob.exists():
                logger.warning(f"File does not exist in storage: {cloud_path}")
                return False
            
            with open(local_path, 'wb') as file_data:
                blob.download_to_file(file_data)
            
            logger.info(f"✅ Downloaded {cloud_path} to {local_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to download {cloud_path}: {e}")
            return False
    
    def file_exists(self, cloud_path: str) -> bool:
        """
        Prüft ob eine Datei in Firebase Storage existiert
        
        Args:
            cloud_path: Pfad in Firebase Storage
            
        Returns:
            True wenn Datei existiert, False sonst
        """
        try:
            blob = self.bucket.blob(cloud_path)
            return blob.exists()
        except Exception as e:
            logger.error(f"❌ Error checking file existence {cloud_path}: {e}")
            return False
    
    def delete_file(self, cloud_path: str) -> bool:
        """
        Löscht eine Datei aus Firebase Storage
        
        Args:
            cloud_path: Pfad in Firebase Storage
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            blob = self.bucket.blob(cloud_path)
            if blob.exists():
                blob.delete()
                logger.info(f"✅ Deleted {cloud_path}")
                return True
            else:
                logger.warning(f"File does not exist: {cloud_path}")
                return False
        except Exception as e:
            logger.error(f"❌ Failed to delete {cloud_path}: {e}")
            return False
    
    def list_files(self, prefix: str) -> list:
        """
        Listet alle Dateien mit einem bestimmten Prefix auf
        
        Args:
            prefix: Prefix für die Suche
            
        Returns:
            Liste der gefundenen Dateipfade
        """
        try:
            blobs = self.bucket.list_blobs(prefix=prefix)
            return [blob.name for blob in blobs]
        except Exception as e:
            logger.error(f"❌ Failed to list files with prefix {prefix}: {e}")
            return []
    
    def upload_chatbot_files(self, chatbot_id: str, local_chatbot_dir: Path) -> bool:
        """
        Lädt alle RAG-Dateien eines Chatbots zu Firebase Storage hoch
        
        Args:
            chatbot_id: ID des Chatbots
            local_chatbot_dir: Lokales Verzeichnis des Chatbots
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            success = True
            
            # Alle relevanten Dateien hochladen
            files_to_upload = [
                (local_chatbot_dir / "config.json", f"chatbots/{chatbot_id}/config.json"),
                (local_chatbot_dir / "embeddings/index.faiss", f"chatbots/{chatbot_id}/embeddings/index.faiss"),
                (local_chatbot_dir / "embeddings/meta.pkl", f"chatbots/{chatbot_id}/embeddings/meta.pkl"),
                (local_chatbot_dir / "chunks/all_chunks.json", f"chatbots/{chatbot_id}/chunks/all_chunks.json")
            ]
            
            for local_file, cloud_path in files_to_upload:
                if local_file.exists():
                    if not self.upload_file(local_file, cloud_path):
                        success = False
                else:
                    logger.warning(f"Local file missing: {local_file}")
            
            logger.info(f"✅ Chatbot {chatbot_id} files upload {'successful' if success else 'completed with errors'}")
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to upload chatbot files for {chatbot_id}: {e}")
            return False
    
    def download_chatbot_files(self, chatbot_id: str, local_chatbot_dir: Path) -> bool:
        """
        Lädt alle RAG-Dateien eines Chatbots von Firebase Storage herunter
        
        Args:
            chatbot_id: ID des Chatbots
            local_chatbot_dir: Lokales Zielverzeichnis
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            success = True
            
            # Lokale Verzeichnisse erstellen
            (local_chatbot_dir / "embeddings").mkdir(parents=True, exist_ok=True)
            (local_chatbot_dir / "chunks").mkdir(parents=True, exist_ok=True)
            
            # Alle relevanten Dateien herunterladen
            files_to_download = [
                (f"chatbots/{chatbot_id}/config.json", local_chatbot_dir / "config.json"),
                (f"chatbots/{chatbot_id}/embeddings/index.faiss", local_chatbot_dir / "embeddings/index.faiss"),
                (f"chatbots/{chatbot_id}/embeddings/meta.pkl", local_chatbot_dir / "embeddings/meta.pkl"),
                (f"chatbots/{chatbot_id}/chunks/all_chunks.json", local_chatbot_dir / "chunks/all_chunks.json")
            ]
            
            for cloud_path, local_file in files_to_download:
                if not self.download_file(cloud_path, local_file):
                    success = False
            
            logger.info(f"✅ Chatbot {chatbot_id} files download {'successful' if success else 'completed with errors'}")
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to download chatbot files for {chatbot_id}: {e}")
            return False
    
    def chatbot_exists_in_storage(self, chatbot_id: str) -> bool:
        """
        Prüft ob ein Chatbot in Firebase Storage existiert
        
        Args:
            chatbot_id: ID des Chatbots
            
        Returns:
            True wenn Chatbot existiert, False sonst
        """
        try:
            # Prüfe ob Config-Datei existiert
            return self.file_exists(f"chatbots/{chatbot_id}/config.json")
        except Exception as e:
            logger.error(f"❌ Error checking chatbot existence {chatbot_id}: {e}")
            return False
    
    def delete_chatbot_files(self, chatbot_id: str) -> bool:
        """
        Löscht alle Dateien eines Chatbots aus Firebase Storage
        
        Args:
            chatbot_id: ID des Chatbots
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            # Alle Dateien des Chatbots auflisten und löschen
            files = self.list_files(f"chatbots/{chatbot_id}/")
            
            success = True
            for file_path in files:
                if not self.delete_file(file_path):
                    success = False
            
            logger.info(f"✅ Chatbot {chatbot_id} files deletion {'successful' if success else 'completed with errors'}")
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to delete chatbot files for {chatbot_id}: {e}")
            return False
    
    def _get_content_type(self, file_path: Path) -> str:
        """
        Bestimmt Content-Type basierend auf Dateierweiterung
        
        Args:
            file_path: Pfad zur Datei
            
        Returns:
            Content-Type String
        """
        suffix = file_path.suffix.lower()
        
        content_types = {
            '.json': 'application/json',
            '.pkl': 'application/octet-stream',
            '.faiss': 'application/octet-stream',
            '.txt': 'text/plain',
            '.pdf': 'application/pdf'
        }
        
        return content_types.get(suffix, 'application/octet-stream')

# Global Storage Manager Instance
firebase_storage = None

def get_firebase_storage() -> FirebaseStorageManager:
    """
    Singleton Pattern für Firebase Storage Manager
    
    Returns:
        FirebaseStorageManager Instance
    """
    global firebase_storage
    if firebase_storage is None:
        firebase_storage = FirebaseStorageManager()
    return firebase_storage