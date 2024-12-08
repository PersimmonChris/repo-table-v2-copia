import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

class CVAnalyzer:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("API key non trovata nelle variabili d'ambiente")
        
        genai.configure(api_key=api_key)
        self.generation_config = {
            "temperature": 0.1,
            "top_p": 0.8,
            "max_output_tokens": 2048,
        }
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=self.generation_config
        )

    def analyze_cv(self, cv_text):
        """
        Analizza il testo del CV e restituisce un dizionario con i risultati o gli errori.
        """
        if not cv_text or not isinstance(cv_text, str):
            return {
                'status': 'error',
                'message': 'Il testo del CV è vuoto o non valido'
            }

        try:
            prompt = [
                """Analizza il seguente CV e estrai le informazioni in formato JSON strutturato.
                Esempio di output:
                {
                    "nome": "Mario",
                    "cognome": "Rossi",
                    "citta": "Milano",
                    "data_nascita": "15/05/1990",
                    "email": "mario.rossi@gmail.com",
                    "cellulare": "333123456",
                    "anni_esperienza": 5,
                    "competenze": "Analista_Funzionale",
                    "tools": ["ACTIVE_DIRECTORY", "BIZTALK", "JIRA"],
                    "database": ["MYSQL", "POSTGRESQL", "MONGODB"],
                    "piattaforme": ["AWS", "AZURE", "GOOGLE_CLOUD"],
                    "sistemi_operativi": ["WINDOWS", "LINUX", "MACOS"],
                    "linguaggi_programmazione": ["PYTHON", "JAVA", "C++"]
                }

                IMPORTANTE:
                - Estrai TUTTE le tecnologie e competenze IT menzionate
                - Separa le competenze nelle categorie corrette (tools, database, piattaforme, sistemi_operativi, linguaggi_programmazione), usa underscore (_) per separare le parole in un singolo valore array vedi esempio sopra
                - Calcola gli anni di esperienza basandoti su tutte le esperienze lavorative IT
                - Tutti i nomi di tecnologie devono essere in MAIUSCOLO
                - La data di nascita DEVE essere nel formato DD/MM/YYYY
                - il campo "competenze" indica in pratica il titolo/ruolo,quindi ha solo un valore, NON è un array e NON deve avere spazi tra parole usa underscore (_), vedi esempio sopra
                - il campo "citta" è il luogo di residenza, se ha spazi usa underscore (_), es: San_Giovanni_in_Ponente
                - DEVI rispondere SOLO con un oggetto JSON valido, niente testo prima o dopo

                CV da analizzare:
                """,
                cv_text
            ]

            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                return {
                    'status': 'error',
                    'message': 'Nessuna risposta generata dal modello'
                }

            # Parse the JSON response
            try:
                # Clean the response text (remove any non-JSON content)
                json_str = response.text.strip()
                # If there's any markdown code block, clean it
                if json_str.startswith('```json'):
                    json_str = json_str.replace('```json', '').replace('```', '')
                
                analysis_data = json.loads(json_str.strip())
                
                return {
                    'status': 'success',
                    'analysis': analysis_data
                }
            except json.JSONDecodeError as e:
                return {
                    'status': 'error',
                    'message': f'Errore nella decodifica JSON: {str(e)}',
                    'raw_response': response.text
                }

        except Exception as e:
            return {
                'status': 'error',
                'message': f'Errore durante l\'analisi del CV: {str(e)}'
            }

# Create a singleton instance
cv_analyzer = CVAnalyzer()