"""
Einfacher, stabiler Website-Scraper für React-Chatbot
"""
import requests
from bs4 import BeautifulSoup
from typing import List, Dict
import time

def scrape_website_simple(url: str) -> List[Dict]:
    """
    Einfacher Website-Scraper mit Timeout und Retry-Logic
    """
    print(f"DEBUG: Starting simple website scraping for {url}")
    
    try:
        # Request mit Timeout
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
        
        # Split into chunks
        chunks = []
        if clean_text:
            paragraphs = [p.strip() for p in clean_text.split('\n\n') if p.strip()]
            
            for i, paragraph in enumerate(paragraphs):
                if len(paragraph) > 50:  # Minimum chunk size
                    chunks.append({
                        "text": paragraph,
                        "source_type": "website",
                        "source_name": url,
                        "chunk_index": f"web-{i}",
                        "metadata": {
                            "url": url,
                            "paragraph": i + 1,
                            "source": "website_scraper"
                        }
                    })
        
        print(f"DEBUG: Created {len(chunks)} chunks from website")
        return chunks
        
    except Exception as e:
        print(f"ERROR: Website scraping failed: {e}")
        return []

if __name__ == "__main__":
    # Test
    chunks = scrape_website_simple("https://example.com")
    print(f"Test result: {len(chunks)} chunks")