-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Per ricerche testuali efficienti

CREATE TABLE cv_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Dati Anagrafici
    cognome VARCHAR,
    nome VARCHAR,
    citta VARCHAR,
    data_nascita DATE,
    
    -- Contatti
    cellulare VARCHAR,
    anni_esperienza INTEGER,
    
    -- Competenze
    competenze VARCHAR,
    tools TEXT[],
    database TEXT[],
    piattaforme TEXT[],
    sistemi_operativi TEXT[],
    linguaggi_programmazione TEXT[],
    
    -- Posizione Contrattuale
    contratto_attuale VARCHAR,
    stipendio_attuale INTEGER,
    scadenza_contratto DATE,
    preavviso VARCHAR,
    tipo_contratto_desiderato VARCHAR,
    stipendio_desiderato INTEGER,
    
    -- Note
    note TEXT,
    
    -- File info
    file_name VARCHAR,
    process_status VARCHAR DEFAULT 'processing'
);

-- Indici per ottimizzare le query più comuni
CREATE INDEX idx_cv_profiles_nome_cognome ON cv_profiles(nome, cognome);
CREATE INDEX idx_cv_profiles_competenze ON cv_profiles USING gin(competenze gin_trgm_ops);
CREATE INDEX idx_cv_profiles_tools ON cv_profiles USING gin(tools);
CREATE INDEX idx_cv_profiles_database ON cv_profiles USING gin(database);
CREATE INDEX idx_cv_profiles_linguaggi ON cv_profiles USING gin(linguaggi_programmazione); 