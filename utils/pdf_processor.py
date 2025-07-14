# platform/utils/pdf_processor.py

import PyPDF2
import pdfplumber
import docx
import re
from typing import List, Dict, Union
from pathlib import Path
import tempfile
import streamlit as st

class DocumentProcessor:
    """Processor für PDF, DOCX und TXT Dateien mit Chunking-Funktionalität"""
    
    def __init__(self, max_chunk_length: int = 500, min_chunk_length: int = 200):
        self.max_chunk_length = max_chunk_length
        self.min_chunk_length = min_chunk_length
    
    def process_uploaded_file(self, uploaded_file, source_name: str = None) -> List[Dict]:
        """
        Verarbeitet hochgeladene Datei und gibt strukturierte Chunks zurück
        
        Args:
            uploaded_file: Streamlit UploadedFile object
            source_name: Optional name für die Quelle
            
        Returns:
            List von Chunk-Dictionaries mit Metadaten
        """
        if not uploaded_file:
            return []
        
        file_extension = uploaded_file.name.split('.')[-1].lower()
        source_name = source_name or uploaded_file.name
        
        try:
            # Erstelle temporäre Datei
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file_extension}") as tmp_file:
                tmp_file.write(uploaded_file.read())
                tmp_path = tmp_file.name
            
            # Verarbeite basierend auf Dateityp
            if file_extension == 'pdf':
                text = self._extract_pdf_text(tmp_path)
            elif file_extension == 'docx':
                text = self._extract_docx_text(tmp_path)
            elif file_extension in ['txt', 'md']:
                text = self._extract_txt_text(tmp_path)
            else:
                st.error(f"Nicht unterstützter Dateityp: {file_extension}")
                return []
            
            # Cleanup temporary file
            Path(tmp_path).unlink()
            
            # Text in Chunks aufteilen
            chunks = self._chunk_text(text)
            
            # Strukturierte Chunk-Daten erstellen
            structured_chunks = []
            for i, chunk in enumerate(chunks):
                structured_chunks.append({
                    "source_type": "document",
                    "source_name": source_name,
                    "file_type": file_extension,
                    "chunk_index": i,
                    "text": chunk,
                    "metadata": {
                        "original_filename": uploaded_file.name,
                        "file_size": uploaded_file.size,
                        "chunk_count": len(chunks)
                    }
                })
            
            return structured_chunks
            
        except Exception as e:
            st.error(f"Fehler beim Verarbeiten der Datei {uploaded_file.name}: {str(e)}")
            return []
    
    def _extract_pdf_text(self, file_path: str) -> str:
        """Extrahiert Text aus PDF-Datei"""
        text_parts = []
        
        try:
            # Versuche pdfplumber (bessere Textextraktion)
            with pdfplumber.open(file_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    page_text = page.extract_text()
                    if page_text:
                        # Füge Seitennummer als Kontext hinzu
                        text_parts.append(f"[Seite {page_num}]\n{page_text}")
        except Exception:
            # Fallback zu PyPDF2
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page_num, page in enumerate(pdf_reader.pages, 1):
                        page_text = page.extract_text()
                        if page_text:
                            text_parts.append(f"[Seite {page_num}]\n{page_text}")
            except Exception as e:
                raise Exception(f"Konnte PDF nicht lesen: {str(e)}")
        
        return "\n\n".join(text_parts)
    
    def _extract_docx_text(self, file_path: str) -> str:
        """Extrahiert Text aus DOCX-Datei"""
        try:
            doc = docx.Document(file_path)
            paragraphs = []
            
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    paragraphs.append(paragraph.text.strip())
            
            return "\n\n".join(paragraphs)
        except Exception as e:
            raise Exception(f"Konnte DOCX nicht lesen: {str(e)}")
    
    def _extract_txt_text(self, file_path: str) -> str:
        """Extrahiert Text aus TXT/MD-Datei"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            # Fallback zu anderen Encodings
            try:
                with open(file_path, 'r', encoding='latin-1') as file:
                    return file.read()
            except Exception as e:
                raise Exception(f"Konnte Text-Datei nicht lesen: {str(e)}")
    
    def _chunk_text(self, text: str) -> List[str]:
        """
        Teilt Text in semantische Chunks auf
        Basiert auf der bestehenden Chunking-Logik aus scrape_to_chunks.py
        """
        # Text bereinigen
        text = self._clean_text(text)
        
        # In Sätze aufteilen
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current = ""
        
        for sentence in sentences:
            # Prüfe ob aktueller Chunk + neuer Satz die Maximallänge überschreitet
            if len(current) + len(sentence) <= self.max_chunk_length:
                current += " " + sentence if current else sentence
            else:
                # Speichere aktuellen Chunk wenn er die Mindestlänge erreicht
                if len(current.strip()) >= self.min_chunk_length:
                    chunks.append(current.strip())
                current = sentence
        
        # Letzten Chunk hinzufügen
        if len(current.strip()) >= self.min_chunk_length:
            chunks.append(current.strip())
        
        return chunks
    
    def _clean_text(self, text: str) -> str:
        """Bereinigt Text von unnötigen Zeichen und Formatierungen"""
        lines = text.splitlines()
        
        # Entferne leere Zeilen und bereinige
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line and not re.match(r'^\[.*?\]$', line):  # Überspringe reine Metadaten-Zeilen
                cleaned_lines.append(line)
        
        # Füge Zeilen wieder zusammen und normalisiere Whitespace
        cleaned_text = ' '.join(cleaned_lines)
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
        
        return cleaned_text.strip()

# Globale Instanz für einfache Verwendung
document_processor = DocumentProcessor()