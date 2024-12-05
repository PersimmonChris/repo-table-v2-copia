from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import date, datetime
import json

class DateEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)

class CV(BaseModel):
    id: Optional[str] = None
    created_at: Optional[datetime] = None
    
    # Dati Anagrafici
    cognome: Optional[str] = None
    nome: Optional[str] = None
    citta: Optional[str] = None
    data_nascita: Optional[date] = None
    
    # Contatti
    cellulare: Optional[str] = None
    anni_esperienza: Optional[int] = None
    
    # Competenze
    competenze: Optional[str] = None
    tools: Optional[List[str]] = []
    database: Optional[List[str]] = []
    piattaforme: Optional[List[str]] = []
    sistemi_operativi: Optional[List[str]] = []
    linguaggi_programmazione: Optional[List[str]] = []
    
    # Posizione Contrattuale
    contratto_attuale: Optional[str] = None
    stipendio_attuale: Optional[int] = None
    scadenza_contratto: Optional[date] = None
    preavviso: Optional[str] = None
    tipo_contratto_desiderato: Optional[str] = None
    stipendio_desiderato: Optional[int] = None
    
    # Note
    note: Optional[str] = None
    
    # File info
    file_name: Optional[str] = None
    process_status: Optional[str] = "processing"
    
    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None,
            datetime: lambda v: v.isoformat() if v else None
        }
        
    def json(self, **kwargs):
        return json.dumps(self.dict(), cls=DateEncoder)

    @field_validator('data_nascita', 'scadenza_contratto')
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                # Prima prova il formato italiano
                day, month, year = v.split('/')
                return date(int(year), int(month), int(day))
            except ValueError:
                # Se fallisce, prova altri formati comuni
                for fmt in ['%d/%m/%Y', '%d-%m-%Y', '%Y-%m-%d']:
                    try:
                        return datetime.strptime(v, fmt).date()
                    except ValueError:
                        continue
                raise ValueError('Formato data non valido. Usa DD/MM/YYYY')
        return v