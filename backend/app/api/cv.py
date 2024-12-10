from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime, timedelta
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
    page_size: int = Query(10, ge=1, le=5000),
    
    # Ordinamento
    sort_by: str = Query(None),
    sort_desc: bool = Query(False),
    
    # Filtri testo
    search: Optional[str] = None,  # Ricerca globale
    nome: Optional[str] = None,
    cognome: Optional[str] = None,
    citta: Optional[List[str]] = Query(None),
    
    # Filtri numerici
    anni_esperienza_min: Optional[int] = None,
    anni_esperienza_max: Optional[int] = None,
    stipendio_attuale_min: Optional[int] = None,
    stipendio_attuale_max: Optional[int] = None,
    stipendio_desiderato_min: Optional[int] = None,
    stipendio_desiderato_max: Optional[int] = None,
    
    # Filtri array
    tools: Optional[List[str]] = Query(None),
    database: Optional[List[str]] = Query(None),
    piattaforme: Optional[List[str]] = Query(None),
    sistemi_operativi: Optional[List[str]] = Query(None),
    linguaggi: Optional[List[str]] = Query(None),
    
    # Filtri date
    data_dal: Optional[datetime] = None,
    data_al: Optional[datetime] = None,
    created_at_dal: Optional[datetime] = None,
    created_at_al: Optional[datetime] = None,
):
    try:
        print("Backend received date:", created_at_dal)
        # Query base per il conteggio totale senza filtri
        total_query = supabase.from_('cv_profiles').select('*', count='exact')
        total_count = total_query.execute().count

        # Query per i dati filtrati
        query = supabase.from_('cv_profiles').select('*', count='exact')
        
        # Applica tutti i filtri
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
            query = query.in_('citta', citta)
            
        # Filtri numerici
        if anni_esperienza_min is not None:
            query = query.gte('anni_esperienza', anni_esperienza_min)
        if anni_esperienza_max is not None:
            query = query.lte('anni_esperienza', anni_esperienza_max)
            
        # Aggiungiamo i filtri per RAL attuale
        if stipendio_attuale_min is not None:
            query = query.gte('stipendio_attuale', stipendio_attuale_min)
        if stipendio_attuale_max is not None:
            query = query.lte('stipendio_attuale', stipendio_attuale_max)
            
        # Aggiungiamo i filtri per RAL desiderata
        if stipendio_desiderato_min is not None:
            query = query.gte('stipendio_desiderato', stipendio_desiderato_min)
        if stipendio_desiderato_max is not None:
            query = query.lte('stipendio_desiderato', stipendio_desiderato_max)
            
        # Filtri array
        if tools:
            print("\n=== TOOLS FILTER DEBUG ===")
            print(f"Received tools: {tools}")
            # Se tools è una stringa, convertiamola in lista
            if isinstance(tools, str):
                tools = [tools]
            query = query.contains('tools', tools)
            
        if database:
            query = query.contains('database', database)
        if piattaforme:
            query = query.contains('piattaforme', piattaforme)
        if sistemi_operativi:
            query = query.contains('sistemi_operativi', sistemi_operativi)
        if linguaggi:
            query = query.contains('linguaggi_programmazione', linguaggi)
            
        # Date - ultimo contatto
        if data_dal:
            query = query.gte('ultimo_contatto', f"{data_dal.date()}T00:00:00")
        if data_al:
            query = query.lte('ultimo_contatto', f"{data_al.date()}T23:59:59")
            
        # Date - created_at
        if created_at_dal:
            print("\n=== DATE FILTER DEBUG ===")
            print(f"Received date: {created_at_dal}")
            query = query.filter('created_at', 'gte', created_at_dal)
            print("Query:", query._compiler().get_sql())
        if created_at_al:
            query = query.filter('created_at', 'lte', created_at_al)
            
        # Ordinamento
        valid_sort_fields = ['nome', 'cognome', 'created_at', 'anni_esperienza']
        if sort_by and sort_by in valid_sort_fields:
            query = query.order(sort_by, desc=sort_desc)
        else:
            query = query.order('created_at', desc=True)
            
        # Ottieni il conteggio dei risultati filtrati PRIMA della paginazione
        filtered_result = query.execute()
        filtered_count = filtered_result.count

        # Verifica che la pagina richiesta sia valida
        total_pages = (filtered_count + page_size - 1) // page_size
        if page > total_pages and total_pages > 0:
            page = total_pages

        # Calcola start e end per la paginazione
        start = (page - 1) * page_size
        end = min(start + page_size - 1, filtered_count - 1)
        
        # Se non ci sono risultati, restituisci una lista vuota senza fare la query
        if filtered_count == 0:
            return {
                "items": [],
                "total": total_count,
                "filtered_total": 0,
                "page": 1,
                "page_size": page_size
            }

        # Applica la paginazione solo se ci sono risultati
        if end >= start:
            paged_result = query.range(start, end).execute()
        else:
            paged_result = {"data": []}
        
        return {
            "items": paged_result.data,
            "total": total_count,
            "filtered_total": filtered_count,
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
                        "message": "CV processato con successo",
                        "cv_id": profile_id
                    })

                except Exception as e:
                    logger.error(f"Error storing CV {file.filename}: {str(e)}")
                    responses.append({
                        "filename": file.filename,
                        "status": "error",
                        "message": f"Errore durante il salvataggio del CV: {str(e)}"
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
                "message": "Elaborazione batch completata",
                "results": responses
            }
        )

    except Exception as e:
        logger.error(f"Batch upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{cv_id}")
async def get_cv(cv_id: str):
    try:
        result = supabase.from_('cv_profiles').select('*').eq('id', cv_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="CV not found")
            
        return result.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.put("/{cv_id}")
async def update_cv(cv_id: str, cv: CV):
    try:
        # Converti il modello in dict per Supabase
        cv_dict = cv.model_dump(exclude_unset=True)
        
        # Assicurati che tutte le date siano in formato stringa
        if cv_dict.get('data_nascita'):
            cv_dict['data_nascita'] = cv_dict['data_nascita'].isoformat()
        if cv_dict.get('scadenza_contratto'):
            cv_dict['scadenza_contratto'] = cv_dict['scadenza_contratto'].isoformat()
        if cv_dict.get('ultimo_contatto'):
            cv_dict['ultimo_contatto'] = cv_dict['ultimo_contatto'].isoformat()
            
        result = supabase.table('cv_profiles').update(cv_dict).eq('id', cv_id).execute()
        
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

@router.get("/filters/tools")
async def get_tools_filters():
    try:
        # Ottieni tutti i CV
        result = supabase.from_('cv_profiles').select('tools').execute()
        
        if not result.data:
            return {"tools": []}
            
        # Estrai tutti i tools unici
        all_tools = set()
        for cv in result.data:
            if cv.get('tools'):
                all_tools.update(cv['tools'])
        
        # Ordina alfabeticamente
        sorted_tools = sorted(list(all_tools))
        
        return {"tools": sorted_tools}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filters/database")
async def get_database_filters():
    try:
        result = supabase.from_('cv_profiles').select('database').execute()
        
        if not result.data:
            return {"database": []}
            
        all_databases = set()
        for cv in result.data:
            if cv.get('database'):
                all_databases.update(cv['database'])
        
        sorted_databases = sorted(list(all_databases))
        return {"database": sorted_databases}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filters/linguaggi")
async def get_linguaggi_filters():
    try:
        result = supabase.from_('cv_profiles').select('linguaggi_programmazione').execute()
        
        if not result.data:
            return {"linguaggi": []}
            
        all_linguaggi = set()
        for cv in result.data:
            if cv.get('linguaggi_programmazione'):
                all_linguaggi.update(cv['linguaggi_programmazione'])
        
        sorted_linguaggi = sorted(list(all_linguaggi))
        return {"linguaggi": sorted_linguaggi}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filters/piattaforme")
async def get_piattaforme_filters():
    try:
        result = supabase.from_('cv_profiles').select('piattaforme').execute()
        
        if not result.data:
            return {"piattaforme": []}
            
        all_piattaforme = set()
        for cv in result.data:
            if cv.get('piattaforme'):
                all_piattaforme.update(cv['piattaforme'])
        
        sorted_piattaforme = sorted(list(all_piattaforme))
        return {"piattaforme": sorted_piattaforme}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filters/sistemi-operativi")
async def get_sistemi_operativi_filters():
    try:
        result = supabase.from_('cv_profiles').select('sistemi_operativi').execute()
        
        if not result.data:
            return {"sistemi_operativi": []}
            
        all_so = set()
        for cv in result.data:
            if cv.get('sistemi_operativi'):
                all_so.update(cv['sistemi_operativi'])
        
        sorted_so = sorted(list(all_so))
        return {"sistemi_operativi": sorted_so}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filters/citta")
async def get_citta_filters():
    try:
        result = supabase.from_('cv_profiles').select('citta').execute()
        
        if not result.data:
            return {"citta": []}
            
        # Estrai tutte le città uniche
        all_cities = set()
        for cv in result.data:
            if cv.get('citta'):
                all_cities.add(cv['citta'])
        
        # Ordina alfabeticamente
        sorted_cities = sorted(list(all_cities))
        
        return {"citta": sorted_cities}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))