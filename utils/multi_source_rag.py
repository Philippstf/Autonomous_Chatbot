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
    
    def _process_website(self, url: str) -> List[Dict]:
        """Verarbeitet Website-URL automatisch mit Sitemap-Erkennung"""
        try:
            # Import functions directly instead of from scrape_to_chunks
            from bs4 import BeautifulSoup
            import re
            from playwright.sync_api import sync_playwright
            import requests
            import xml.etree.ElementTree as ET
            from urllib.parse import urljoin, urlparse
            
            # Define text extraction and chunking functions locally
            def extract_text(html):
                soup = BeautifulSoup(html, "html.parser")
                main = soup.find("main") or soup.body or soup
                
                for tag in main(["script", "style", "nav", "footer", "header", "form", "aside"]):
                    tag.decompose()
                
                text = main.get_text(separator="\n", strip=True)
                lines = text.splitlines()
                lines = [line.strip() for line in lines if line.strip()]
                lines = [line for line in lines if not re.match(r"\[.*?\]|\bClose\b|^×$", line)]
                return "\n".join(lines)
            
            def chunk_text(text: str, max_len=500, min_len=50):  # Reduzierte min_len
                # Fallback: Wenn keine Sätze gefunden werden, nach Absätzen teilen
                if not re.search(r"[.!?]", text):
                    paragraphs = text.split('\n\n')
                    chunks = [p.strip() for p in paragraphs if len(p.strip()) >= min_len]
                    return chunks
                
                sentences = re.split(r"(?<=[.!?])\s+", text)
                chunks = []
                current = ""
                
                for sentence in sentences:
                    if len(current) + len(sentence) <= max_len:
                        current += " " + sentence
                    else:
                        if len(current.strip()) >= min_len:
                            chunks.append(current.strip())
                        current = sentence
                
                if len(current.strip()) >= min_len:
                    chunks.append(current.strip())
                
                # Fallback: Falls keine Chunks, ganzen Text als einen Chunk nehmen
                if not chunks and len(text.strip()) >= min_len:
                    chunks.append(text.strip())
                
                return chunks
            
            chunks = []
            processed_urls = set()
            
            # 1. URLs aus der Website sammeln
            urls_to_process = self._discover_website_urls(url)
            
            if not urls_to_process:
                # Fallback: Nur die Hauptseite verarbeiten
                urls_to_process = [url]
            
            st.info(f"🔍 Gefunden: {len(urls_to_process)} URLs zum Verarbeiten")
            
            # 2. URLs verarbeiten
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                
                for i, page_url in enumerate(urls_to_process[:20]):  # Max 20 Seiten
                    if page_url in processed_urls:
                        continue
                        
                    try:
                        page.goto(page_url, timeout=15000)
                        html = page.content()
                        text = extract_text(html)
                        
                        if len(text.strip()) < 50:  # Reduzierte Mindestlänge
                            st.warning(f"⚠️ Seite {page_url} zu kurz: {len(text.strip())} Zeichen")
                            continue
                        
                        st.info(f"📄 Text extrahiert von {page_url}: {len(text.strip())} Zeichen")
                        text_chunks = chunk_text(text)
                        st.info(f"📝 Chunks erstellt: {len(text_chunks)} aus {page_url}")
                        processed_urls.add(page_url)
                        
                        # Erstelle strukturierte Chunks
                        for j, chunk in enumerate(text_chunks):
                            from urllib.parse import urlparse
                            chunks.append({
                                "source_type": "website",
                                "source_name": urlparse(url).netloc,
                                "page_title": page_url.split('/')[-1] or "homepage",
                                "chunk_index": f"{i}-{j}",
                                "text": chunk,
                                "metadata": {
                                    "url": page_url,
                                    "page_number": i + 1,
                                    "total_pages": min(len(urls_to_process), 20),
                                    "chunk_count": len(text_chunks)
                                }
                            })
                        
                        # Progress Update
                        if i % 5 == 0:
                            st.info(f"📄 Verarbeitet: {i+1}/{min(len(urls_to_process), 20)} Seiten")
                            
                    except Exception as page_error:
                        st.warning(f"⚠️ Fehler bei {page_url}: {str(page_error)}")
                        continue
                
                browser.close()
            
            st.success(f"✅ Website-Scraping abgeschlossen: {len(chunks)} Chunks aus {len(processed_urls)} Seiten")
            return chunks
            
        except Exception as e:
            st.error(f"Fehler beim Website-Scraping: {str(e)}")
            return []
    
    def _discover_website_urls(self, base_url: str) -> List[str]:
        """Entdeckt URLs einer Website über Sitemap und Crawling"""
        from urllib.parse import urlparse
        urls = set()
        domain = urlparse(base_url).netloc
        
        try:
            # 1. Versuche Sitemap zu finden
            sitemap_urls = self._find_sitemap_urls(base_url)
            urls.update(sitemap_urls)
            
            # 2. Falls keine Sitemap: Crawle die Hauptseite
            if not sitemap_urls:
                crawled_urls = self._crawl_main_page(base_url)
                urls.update(crawled_urls)
            
            # 3. Filtere und sortiere URLs
            filtered_urls = []
            for url in urls:
                from urllib.parse import urlparse
                parsed = urlparse(url)
                if (parsed.netloc == domain and 
                    not any(ext in url.lower() for ext in ['.pdf', '.jpg', '.png', '.gif', '.css', '.js']) and
                    not any(word in url.lower() for word in ['admin', 'login', 'api', 'cdn'])):
                    filtered_urls.append(url)
            
            return list(set(filtered_urls))[:50]  # Max 50 URLs
            
        except Exception as e:
            st.warning(f"⚠️ URL-Discovery-Fehler: {str(e)}")
            return [base_url]  # Fallback zur Hauptseite
    
    def _find_sitemap_urls(self, base_url: str) -> List[str]:
        """Findet URLs über Sitemap.xml"""
        from urllib.parse import urlparse
        urls = []
        domain = urlparse(base_url).scheme + "://" + urlparse(base_url).netloc
        
        # Mögliche Sitemap-Pfade
        sitemap_paths = [
            '/sitemap.xml',
            '/sitemap_index.xml', 
            '/sitemap/sitemap.xml',
            '/sitemaps.xml',
            '/robots.txt'  # Für Sitemap-Referenzen
        ]
        
        for path in sitemap_paths:
            try:
                sitemap_url = domain + path
                response = requests.get(sitemap_url, timeout=10)
                
                if response.status_code == 200:
                    if path == '/robots.txt':
                        # Parse robots.txt für Sitemap-Referenzen
                        for line in response.text.split('\n'):
                            if line.lower().startswith('sitemap:'):
                                sitemap_ref = line.split(':', 1)[1].strip()
                                urls.extend(self._parse_sitemap(sitemap_ref))
                    else:
                        # Parse XML Sitemap
                        urls.extend(self._parse_sitemap(sitemap_url, response.text))
                        
                    if urls:  # Erste erfolgreiche Sitemap verwenden
                        break
                        
            except Exception:
                continue
        
        return urls
    
    def _parse_sitemap(self, sitemap_url: str, content: str = None) -> List[str]:
        """Parst XML-Sitemap und extrahiert URLs"""
        urls = []
        
        try:
            if content is None:
                response = requests.get(sitemap_url, timeout=10)
                content = response.text
            
            # Parse XML
            root = ET.fromstring(content)
            
            # Handle different sitemap formats
            namespaces = {
                'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9',
                'news': 'http://www.google.com/schemas/sitemap-news/0.9',
                'image': 'http://www.google.com/schemas/sitemap-image/1.1'
            }
            
            # Standard sitemap URLs
            for url_elem in root.findall('.//sitemap:url', namespaces):
                loc = url_elem.find('sitemap:loc', namespaces)
                if loc is not None and loc.text:
                    urls.append(loc.text)
            
            # Sitemap index (references to other sitemaps)  
            for sitemap_elem in root.findall('.//sitemap:sitemap', namespaces):
                loc = sitemap_elem.find('sitemap:loc', namespaces)
                if loc is not None and loc.text:
                    # Recursively parse sub-sitemaps
                    sub_urls = self._parse_sitemap(loc.text)
                    urls.extend(sub_urls)
            
            # Fallback: Try without namespace
            if not urls:
                for url_elem in root.findall('.//url'):
                    loc = url_elem.find('loc')
                    if loc is not None and loc.text:
                        urls.append(loc.text)
                        
        except Exception as e:
            st.warning(f"⚠️ Sitemap-Parse-Fehler: {str(e)}")
        
        return urls[:100]  # Limit to 100 URLs per sitemap
    
    def _crawl_main_page(self, base_url: str) -> List[str]:
        """Crawlt die Hauptseite nach Links"""
        from urllib.parse import urlparse
        urls = []
        domain = urlparse(base_url).netloc
        
        try:
            from playwright.sync_api import sync_playwright
            
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                page = browser.new_page()
                page.goto(base_url, timeout=15000)
                
                # Alle Links sammeln
                links = page.query_selector_all('a[href]')
                
                for link in links:
                    href = link.get_attribute('href')
                    if href:
                        # Absolute URL erstellen
                        if href.startswith('/'):
                            from urllib.parse import urlparse
                            full_url = f"{urlparse(base_url).scheme}://{domain}{href}"
                        elif href.startswith('http'):
                            full_url = href
                        else:
                            continue
                            
                        # Nur Links der gleichen Domain
                        from urllib.parse import urlparse
                        if urlparse(full_url).netloc == domain:
                            urls.append(full_url)
                
                browser.close()
                
        except Exception as e:
            st.warning(f"⚠️ Crawling-Fehler: {str(e)}")
        
        return list(set(urls))[:30]  # Max 30 URLs
    
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
        response = self.embed_client.embeddings.create(
            model=self.embed_model,
            input=text
        )
        return response.data[0].embedding
    
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

def create_chatbot_id() -> str:
    """Erstellt eine eindeutige Chatbot-ID"""
    return str(uuid.uuid4())[:8]