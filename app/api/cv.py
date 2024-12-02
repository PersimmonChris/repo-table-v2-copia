from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime
import logging
from app.models.cv import CV
from app.services.cv_parser import parse_cv
from app.services.cv_analyzer import cv_analyzer
from app.core.supabase import supabase

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cv", tags=["cv"])

@router.get("")
async def get_cvs(
    # Paginazione
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    
    # Ordinamento
    sort_by: str = Query(None),
    sort_desc: bool = Query(False),
    
    # Filtri testo
    search: Optional[str] = None,  # Ricerca globale
    nome: Optional[str] = None,
    cognome: Optional[str] = None,
    citta: Optional[str] = None,
    
    # Filtri numerici
    anni_esperienza_min: Optional[int] = None,
    anni_esperienza_max: Optional[int] = None,
    stipendio_attuale_min: Optional[int] = None,
    stipendio_attuale_max: Optional[int] = None,
    
    # Filtri array
    tools: Optional[List[str]] = Query(None),
    database: Optional[List[str]] = Query(None),
    piattaforme: Optional[List[str]] = Query(None),
    sistemi_operativi: Optional[List[str]] = Query(None),
    linguaggi: Optional[List[str]] = Query(None),
    
    # Filtri date
    data_dal: Optional[datetime] = None,
    data_al: Optional[datetime] = None,
):
    try:
        query = supabase.from_('cv_profiles').select('*', count='exact')
        
        # Applicazione filtri
        if search:
            search_safe = search.replace('%', r'\%').replace('_', r'\_')
            query = query.or_(
                f"nome.ilike.%{search_safe}%,"
                f"cognome.ilike.%{search_safe}%,"
                f"competenze.ilike.%{search_safe}%"
            )
        
        if nome:
            nome_safe = nome.replace('%', r'\%').replace('_', r'\_')
            query = query.ilike('nome', f"%{nome_safe}%")
        if cognome:
            cognome_safe = cognome.replace('%', r'\%').replace('_', r'\_')
            query = query.ilike('cognome', f"%{cognome_safe}%")
        if citta:
            citta_safe = citta.replace('%', r'\%').replace('_', r'\_')
            query = query.ilike('citta', f"%{citta_safe}%")
            
        # Filtri numerici
        if anni_esperienza_min is not None:
            query = query.gte('anni_esperienza', anni_esperienza_min)
        if anni_esperienza_max is not None:
            query = query.lte('anni_esperienza', anni_esperienza_max)
            
        # Filtri array
        if tools:
            query = query.contains('tools', tools)
        if database:
            query = query.contains('database', database)
        if piattaforme:
            query = query.contains('piattaforme', piattaforme)
        if sistemi_operativi:
            query = query.contains('sistemi_operativi', sistemi_operativi)
        if linguaggi:
            query = query.contains('linguaggi_programmazione', linguaggi)
            
        # Date
        if data_dal:
            query = query.gte('created_at', data_dal)
        if data_al:
            query = query.lte('created_at', data_al)
            
        # Ordinamento
        valid_sort_fields = ['nome', 'cognome', 'created_at', 'anni_esperienza']  # aggiungi tutti i campi validi
        if sort_by and sort_by in valid_sort_fields:
            query = query.order(sort_by, desc=sort_desc)
        else:
            query = query.order('created_at', desc=True)
            
        # Paginazione
        start = (page - 1) * page_size
        end = start + page_size - 1
        query = query.range(start, end)
        
        result = query.execute()
        
        return {
            "items": result.data,
            "total": result.count if result.count is not None else 0,
            "page": page,
            "page_size": page_size
        }
        
    except Exception as e:
        logging.error(f"Error in get_cvs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def convert_date_format(date_str: str) -> str:
    """Converte una data dal formato DD/MM/YYYY a YYYY-MM-DD"""
    if not date_str:
        return None
    try:
        day, month, year = date_str.split('/')
        return f"{year}-{month}-{day}"
    except:
        return None

@router.post("/upload")
async def upload_cv(files: List[UploadFile] = File(...)):
    responses = []
    try:
        # Limit to 10 files
        if len(files) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 files allowed per upload"
            )

        for file in files:
            try:
                logger.info(f"Processing file: {file.filename}")
                
                # Validate file type
                if not file.filename.lower().endswith(('.pdf', '.doc', '.docx')):
                    responses.append({
                        "filename": file.filename,
                        "status": "error",
                        "message": "Invalid file type"
                    })
                    continue

                # Read and process file
                contents = await file.read()
                parse_result = await parse_cv(contents, file.filename)
                
                if parse_result['status'] == 'error':
                    responses.append({
                        "filename": file.filename,
                        "status": "error",
                        "message": parse_result['message']
                    })
                    continue

                analysis_result = cv_analyzer.analyze_cv(parse_result['text'])
                
                if analysis_result['status'] == 'error':
                    responses.append({
                        "filename": file.filename,
                        "status": "error",
                        "message": analysis_result['message']
                    })
                    continue

                # Store in Supabase
                try:
                    analyzed_data = analysis_result['analysis']
                    
                    # Prepare profile data
                    profile_data = {
                        "file_name": file.filename,
                        "process_status": "processing",
                        "nome": analyzed_data.get("nome"),
                        "cognome": analyzed_data.get("cognome"),
                        "citta": analyzed_data.get("citta"),
                        "data_nascita": convert_date_format(analyzed_data.get("data_nascita")),
                        "cellulare": analyzed_data.get("cellulare"),
                        "anni_esperienza": analyzed_data.get("anni_esperienza"),
                        "competenze": analyzed_data.get("competenze"),
                        "tools": analyzed_data.get("tools", []),
                        "database": analyzed_data.get("database", []),
                        "piattaforme": analyzed_data.get("piattaforme", []),
                        "sistemi_operativi": analyzed_data.get("sistemi_operativi", []),
                        "linguaggi_programmazione": analyzed_data.get("linguaggi_programmazione", [])
                    }
                    
                    # Remove None values to prevent SQL issues
                    profile_data = {k: v for k, v in profile_data.items() if v is not None}
                    
                    # Insert profile
                    result = supabase.table("cv_profiles").insert(profile_data).execute()
                    profile_id = result.data[0]["id"]
                    
                    # Update status to completed
                    supabase.table("cv_profiles").update(
                        {"process_status": "completed"}
                    ).eq("id", profile_id).execute()

                    responses.append({
                        "filename": file.filename,
                        "status": "success",
                        "message": "CV processed successfully",
                        "cv_id": profile_id
                    })

                except Exception as e:
                    logger.error(f"Error storing CV {file.filename}: {str(e)}")
                    responses.append({
                        "filename": file.filename,
                        "status": "error",
                        "message": f"Error storing CV: {str(e)}"
                    })

            except Exception as e:
                logger.error(f"Error processing {file.filename}: {str(e)}")
                responses.append({
                    "filename": file.filename,
                    "status": "error",
                    "message": str(e)
                })

        return JSONResponse(
            status_code=200,
            content={
                "message": "Batch processing completed",
                "results": responses
            }
        )

    except Exception as e:
        logger.error(f"Batch upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{cv_id}")
async def update_cv(cv_id: str, cv: CV):
    try:
        result = supabase.table('cv_profiles').update(
            cv.model_dump(exclude_unset=True)  # Converte il modello Pydantic in dict
        ).eq('id', cv_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="CV not found")
            
        return result.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{cv_id}")
async def delete_cv(cv_id: str):
    try:
        result = supabase.table("cv_profiles").delete().eq("id", cv_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="CV not found")
            
        return {"message": "CV deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))