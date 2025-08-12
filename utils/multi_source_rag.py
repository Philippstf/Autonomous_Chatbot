# platform/utils/multi_source_rag.py

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

load_dotenv()

class MultiSourceRAG:
    """
    Erweiterte RAG-Pipeline für multiple Datenquellen
    Kombiniert Website-Scraping und Dokument-Upload
    """
    
    def __init__(self, chatbot_id: str):
        self.chatbot_id = chatbot_id
        self.embed_api_key = openai.api_key = os.getenv("OPENAI_EMBED_API_KEY")
        self.embed_model = "text-embedding-3-small"
        self.embed_client = OpenAI(api_key=self.embed_api_key)
        
        # Chatbot-spezifische Pfade
        self.chatbot_dir = Path(f"data/chatbots/{chatbot_id}")
        self.chunks_dir = self.chatbot_dir / "chunks"
        self.embeddings_dir = self.chatbot_dir / "embeddings"
        self.index_file = self.embeddings_dir / "index.faiss"
        self.metadata_file = self.embeddings_dir / "meta.pkl"
        
        # Erstelle Verzeichnisse
        self.chunks_dir.mkdir(parents=True, exist_ok=True)
        self.embeddings_dir.mkdir(parents=True, exist_ok=True)
    
    def process_multiple_sources(self, 
                                website_url: Optional[str] = None,
                                document_chunks: Optional[List[Dict]] = None,
                                manual_text: Optional[str] = None,
                                progress_callback=None) -> bool:
        """
        Verarbeitet multiple Datenquellen zu einem einheitlichen RAG-System
        
        Args:
            website_url: URL der zu scrapenden Website
            document_chunks: Liste von Dokument-Chunks
            progress_callback: Funktion für Progress Updates
            
        Returns:
            True wenn erfolgreich, False sonst
        """
        try:
            all_chunks = []
            
            # Progress Update
            if progress_callback:
                progress_callback("Starte Datenverarbeitung...", 0.1)
            
            # 1. Website-Daten verarbeiten (falls vorhanden)
            if website_url:
                if progress_callback:
                    progress_callback("Verarbeite Website-Daten...", 0.2)
                
                website_chunks = self._process_website(website_url)
                all_chunks.extend(website_chunks)
                
                if progress_callback:
                    progress_callback(f"Website verarbeitet: {len(website_chunks)} Chunks", 0.4)
            
            # 2. Dokument-Daten hinzufügen (falls vorhanden)
            if document_chunks:
                if progress_callback:
                    progress_callback("Füge Dokument-Daten hinzu...", 0.5)
                
                all_chunks.extend(document_chunks)
                
                if progress_callback:
                    progress_callback(f"Dokumente hinzugefügt: {len(document_chunks)} Chunks", 0.6)
            
            # 3. Manueller Text verarbeiten (falls vorhanden)
            if manual_text and manual_text.strip():
                if progress_callback:
                    progress_callback("Verarbeite manuellen Text...", 0.65)
                
                # Text in Chunks aufteilen
                manual_chunks = self._split_text_into_chunks(manual_text)
                all_chunks.extend(manual_chunks)
                
                if progress_callback:
                    progress_callback(f"Manueller Text hinzugefügt: {len(manual_chunks)} Chunks", 0.7)
            
            if not all_chunks:
                st.error("Keine Daten zum Verarbeiten gefunden!")
                return False
            
            # 3. Chunks speichern
            self._save_chunks(all_chunks)
            
            if progress_callback:
                progress_callback("Erstelle Embeddings...", 0.7)
            
            # 4. Embeddings erstellen
            success = self._create_embeddings(all_chunks, progress_callback)
            
            if success and progress_callback:
                progress_callback("✅ Chatbot erfolgreich erstellt!", 1.0)
            
            return success
            
        except Exception as e:
            st.error(f"Fehler bei der Datenverarbeitung: {str(e)}")
            return False
    
    def _split_text_into_chunks(self, text: str) -> List[Dict]:
        """Teilt Text in Chunks für das RAG-System auf"""
        chunks = []
        
        # Teile Text in Absätze
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        for i, paragraph in enumerate(paragraphs):
            # Wenn Absatz zu lang, weiter aufteilen
            if len(paragraph) > 1000:
                sentences = [s.strip() for s in paragraph.split('.') if s.strip()]
                current_chunk = ""
                
                for sentence in sentences:
                    if len(current_chunk + sentence) < 1000:
                        current_chunk += sentence + ". "
                    else:
                        if current_chunk:
                            chunks.append({
                                "text": current_chunk.strip(),
                                "source_type": "manual_text",
                                "source_name": "Manueller Text",
                                "chunk_index": f"manual-{len(chunks)}",
                                "metadata": {
                                    "source": "manual_input",
                                    "paragraph": i + 1
                                }
                            })
                        current_chunk = sentence + ". "
                
                if current_chunk:
                    chunks.append({
                        "text": current_chunk.strip(),
                        "source_type": "manual_text", 
                        "source_name": "Manueller Text",
                        "chunk_index": f"manual-{len(chunks)}",
                        "metadata": {
                            "source": "manual_input",
                            "paragraph": i + 1
                        }
                    })
            else:
                chunks.append({
                    "text": paragraph,
                    "source_type": "manual_text",
                    "source_name": "Manueller Text", 
                    "chunk_index": f"manual-{len(chunks)}",
                    "metadata": {
                        "source": "manual_input",
                        "paragraph": i + 1
                    }
                })
        
        return chunks
    
    def _process_website(self, url: str) -> List[Dict]:
        """Verarbeitet Website-URL mit einfachem, stabilerem Scraping"""
        try:
            print(f"DEBUG: Starting website processing for {url}")
            
            # URL-Validierung und Auto-Korrektur
            if not url:
                print("ERROR: Empty URL provided")
                return []
            
            # Auto-korrigiere häufige URL-Fehler
            url = url.strip()
            if url.startswith('httpa://'):
                url = url.replace('httpa://', 'https://')
                print(f"DEBUG: Auto-corrected URL from httpa:// to https://: {url}")
            elif not url.startswith(('http://', 'https://')):
                url = 'https://' + url
                print(f"DEBUG: Auto-added https:// prefix: {url}")
            
            print(f"DEBUG: Final processed URL: {url}")
            
            import requests
            from bs4 import BeautifulSoup
            
            # Request mit Timeout
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, timeout=15, headers=headers)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove unwanted elements
            for element in soup(['script', 'style', 'nav', 'footer', 'header', 'form', 'aside', 'noscript']):
                element.decompose()
            
            # Extract text
            text = soup.get_text(separator='\n', strip=True)
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            clean_text = '\n'.join(lines)
            
            print(f"DEBUG: Extracted {len(clean_text)} characters")
            
            # Split into chunks using existing method
            chunks = []
            if clean_text:
                text_chunks = self._split_text_into_chunks(clean_text)
                for chunk in text_chunks:
                    chunk['source_type'] = 'website'
                    chunk['source_name'] = url
                    chunk['metadata']['url'] = url
                chunks.extend(text_chunks)
            
            print(f"DEBUG: Created {len(chunks)} chunks from website")
            return chunks
            
        except Exception as e:
            print(f"ERROR: Website processing failed: {e}")
            return []
    
    def _save_chunks(self, chunks: List[Dict]):
        """Speichert alle Chunks in JSON-Datei"""
        chunks_file = self.chunks_dir / "all_chunks.json"
        
        with open(chunks_file, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
    
    def _create_embeddings(self, chunks: List[Dict], progress_callback=None) -> bool:
        """Erstellt FAISS-Index aus allen Chunks"""
        try:
            texts = [chunk["text"] for chunk in chunks]
            
            if progress_callback:
                progress_callback(f"Erstelle Embeddings für {len(texts)} Chunks...", 0.75)
            
            # Embeddings erstellen
            embeddings = []
            batch_size = 50
            
            for i in range(0, len(texts), batch_size):
                batch = texts[i:i+batch_size]
                
                for text in batch:
                    embedding = self._get_embedding(text)
                    embeddings.append(embedding)
                
                if progress_callback:
                    progress = 0.75 + (i / len(texts)) * 0.2
                    progress_callback(f"Embedding-Progress: {i+len(batch)}/{len(texts)}", progress)
            
            # FAISS-Index erstellen
            dim = len(embeddings[0])
            index = faiss.IndexFlatL2(dim)
            index.add(np.array(embeddings, dtype="float32"))
            
            # Index und Metadaten speichern
            faiss.write_index(index, str(self.index_file))
            
            with open(self.metadata_file, 'wb') as f:
                pickle.dump(chunks, f)
            
            if progress_callback:
                progress_callback("Embeddings erfolgreich erstellt!", 0.95)
            
            return True
            
        except Exception as e:
            st.error(f"Fehler beim Erstellen der Embeddings: {str(e)}")
            return False
    
    def _get_embedding(self, text: str) -> List[float]:
        """Erstellt Embedding für Text"""
        import time
        max_retries = 3
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                response = self.embed_client.embeddings.create(
                    model=self.embed_model,
                    input=text,
                    timeout=30  # 30 Sekunden Timeout
                )
                return response.data[0].embedding
            except Exception as e:
                print(f"Embedding-Fehler (Versuch {attempt + 1}/{max_retries}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    raise Exception(f"Embedding fehlgeschlagen nach {max_retries} Versuchen: {e}")
    
    def load_rag_system(self) -> tuple[faiss.Index, List[Dict]]:
        """Lädt FAISS-Index und Metadaten für Chatbot"""
        if not self.index_file.exists() or not self.metadata_file.exists():
            raise FileNotFoundError(f"RAG-System für Chatbot {self.chatbot_id} nicht gefunden")
        
        index = faiss.read_index(str(self.index_file))
        
        with open(self.metadata_file, 'rb') as f:
            chunks = pickle.load(f)
        
        return index, chunks
    
    def retrieve_chunks(self, question: str, top_k: int = 5) -> List[Dict]:
        """Ruft ähnlichste Chunks für Frage ab"""
        try:
            index, chunks = self.load_rag_system()
            
            # Question Embedding
            question_embedding = self._get_embedding(question)
            query_vector = np.array([question_embedding], dtype="float32")
            
            # Suche im Index
            _, indices = index.search(query_vector, top_k)
            
            # Relevante Chunks zurückgeben
            relevant_chunks = [chunks[i] for i in indices[0]]
            
            return relevant_chunks
            
        except Exception as e:
            st.error(f"Fehler beim Abrufen der Chunks: {str(e)}")
            return []
    
    def get_chatbot_info(self) -> Dict:
        """Gibt Informationen über den Chatbot zurück"""
        try:
            if not self.metadata_file.exists():
                return {}
            
            with open(self.metadata_file, 'rb') as f:
                chunks = pickle.load(f)
            
            # Analysiere Quellen
            sources = {}
            for chunk in chunks:
                source_type = chunk.get("source_type", "unknown")
                source_name = chunk.get("source_name", "unknown")
                
                if source_type not in sources:
                    sources[source_type] = {}
                
                if source_name not in sources[source_type]:
                    sources[source_type][source_name] = 0
                
                sources[source_type][source_name] += 1
            
            return {
                "total_chunks": len(chunks),
                "sources": sources,
                "created_at": self.chatbot_dir.stat().st_mtime if self.chatbot_dir.exists() else None
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def get_response(self, query: str, conversation_id: Optional[str] = None) -> Dict:
        """Generiert Antwort auf Benutzeranfrage mit RAG"""
        try:
            # Hole relevante Chunks
            relevant_chunks = self.retrieve_chunks(query, top_k=5)
            
            if not relevant_chunks:
                return {
                    "response": "Entschuldigung, ich konnte keine relevanten Informationen zu Ihrer Frage finden.",
                    "sources": [],
                    "conversation_id": conversation_id or str(uuid.uuid4())
                }
            
            # Erstelle Kontext aus Chunks
            context = "\n\n".join([
                f"Quelle: {chunk.get('source_name', 'Unbekannt')}\n{chunk['text']}"
                for chunk in relevant_chunks
            ])
            
            # LLM-Aufruf mit OpenRouter
            router_api_key = os.getenv("OPENROUTER_API_KEY")
            if not router_api_key:
                return {
                    "response": "Fehler: OpenRouter API-Key nicht konfiguriert.",
                    "sources": [],
                    "conversation_id": conversation_id or str(uuid.uuid4())
                }
            
            router_client = OpenAI(
                api_key=router_api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            
            messages = [
                {
                    "role": "system",
                    "content": f"""Du bist ein freundlicher und kompetenter Kundenberater. Hilf dem Kunden gerne weiter und antworte natürlich und menschlich.

Hier sind die relevanten Informationen:
{context}

Wichtige Hinweise:
- Antworte natürlich und conversational, als würdest du persönlich mit dem Kunden sprechen
- Verwende die verfügbaren Informationen, um eine hilfreiche Antwort zu geben
- Falls du keine passenden Informationen findest, erkläre das freundlich und biete alternative Hilfe an
- Sei persönlich und empathisch in deiner Kommunikation
- Antworte auf Deutsch in einem warmen, einladenden Ton"""
                },
                {
                    "role": "user", 
                    "content": query
                }
            ]
            
            response = router_client.chat.completions.create(
                model="tngtech/deepseek-r1t2-chimera:free",
                messages=messages,
                temperature=0.2,
                max_tokens=512
            )
            
            answer = response.choices[0].message.content.strip()
            
            # Bereite Quellen für Frontend auf
            sources = [
                {
                    "title": chunk.get("source_name", "Unbekannte Quelle"),
                    "type": chunk.get("source_type", "unknown"),
                    "url": chunk.get("source_url", ""),
                    "snippet": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"]
                }
                for chunk in relevant_chunks
            ]
            
            return {
                "response": answer,
                "sources": sources,
                "conversation_id": conversation_id or str(uuid.uuid4())
            }
            
        except Exception as e:
            return {
                "response": f"Entschuldigung, es ist ein Fehler aufgetreten: {str(e)}",
                "sources": [],
                "conversation_id": conversation_id or str(uuid.uuid4())
            }

def create_chatbot_id() -> str:
    """Erstellt eine eindeutige Chatbot-ID"""
    return str(uuid.uuid4())[:8]