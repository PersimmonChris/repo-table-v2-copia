import pdfplumber
import docx2txt
import io
import re
from typing import Union, Dict, Any

class CVParser:
    def __init__(self):
        self.supported_formats = ['.pdf', '.docx']
        self.patterns = {
            'email': r'[\w\.-]+@[\w\.-]+\.\w+',
            'telefono': r'(?:\+39|0039)?[\s.-]?(?:[\d]{2,3}[\s.-]?){3,4}',
        }
    
    def validate_file_type(self, filename: str) -> str:
        """Valida se il file ha un formato supportato."""
        file_ext = f".{filename.split('.')[-1].lower()}"
        if file_ext not in self.supported_formats:
            raise ValueError(f"Formato file non supportato. Formati supportati: {self.supported_formats}")
        return file_ext

    def extract_text_from_pdf_bytes(self, file_content: bytes) -> str:
        """Estrae il testo da file PDF in formato bytes."""
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            text = ""
            for page in pdf.pages:
                extracted_text = page.extract_text() or ""
                text += extracted_text + "\n"
        return text

    def extract_text_from_docx_bytes(self, file_content: bytes) -> str:
        """Estrae il testo da file DOCX in formato bytes."""
        try:
            text = docx2txt.process(io.BytesIO(file_content))
            if not text or text.isspace():
                raise ValueError("Nessun testo estratto dal documento")
            return text
        except Exception as e:
            raise ValueError(f"Errore nell'estrazione del testo DOCX: {str(e)}")

    def clean_text(self, text: str) -> str:
        """Pulisce il testo mantenendo i caratteri italiani."""
        text = ' '.join(text.split())
        text = ''.join(char for char in text if char.isprintable() or char in 'àèéìòùÀÈÉÌÒÙ')
        return text

    def extract_basic_info(self, text: str) -> Dict[str, Any]:
        """Estrae informazioni di base dal testo."""
        info = {
            'email': None,
            'telefono': None,
        }
        
        email_match = re.search(self.patterns['email'], text)
        if email_match:
            info['email'] = email_match.group()
            
        phone_match = re.search(self.patterns['telefono'], text)
        if phone_match:
            info['telefono'] = phone_match.group()
            
        return info

    async def parse_file(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Metodo principale per parsare il CV."""
        try:
            file_ext = self.validate_file_type(filename)
            
            text = ""
            if file_ext == '.pdf':
                text = self.extract_text_from_pdf_bytes(file_content)
            else:  # .docx
                text = self.extract_text_from_docx_bytes(file_content)
            
            if not text or text.isspace():
                raise ValueError(f"Nessun testo estratto dal file {filename}")
            
            text = self.clean_text(text)
            basic_info = self.extract_basic_info(text)
            
            return {
                'status': 'success',
                'text': text,
                'basic_info': basic_info,
                'filename': filename,
                'format': file_ext
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
                'filename': filename,
                'error_type': type(e).__name__
            }

# Create a singleton instance
cv_parser = CVParser()

# Export the parse_file function directly
async def parse_cv(file_content: bytes, filename: str) -> Dict[str, Any]:
    return await cv_parser.parse_file(file_content, filename)