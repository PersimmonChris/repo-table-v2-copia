-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE process_status AS ENUM (
        'pending',
        'processing',
        'completed',
        'error'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_type AS ENUM (
        'determinato',
        'indeterminato',
        'partita_iva',
        'altro'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS cv_linguaggi_programmazione CASCADE;
DROP TABLE IF EXISTS cv_sistemi_operativi CASCADE;
DROP TABLE IF EXISTS cv_piattaforme CASCADE;
DROP TABLE IF EXISTS cv_database CASCADE;
DROP TABLE IF EXISTS cv_tools CASCADE;
DROP TABLE IF EXISTS competenze CASCADE;
DROP TABLE IF EXISTS cv_profiles CASCADE;
DROP TABLE IF EXISTS cv_files CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS cv_search_view CASCADE;

-- Create the main CV files table

CREATE TABLE cv_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    process_status process_status DEFAULT 'pending',
    process_error TEXT,
    uploaded_by UUID REFERENCES auth.users(id)
);

-- Main CV profiles table
CREATE TABLE cv_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cv_file_id UUID REFERENCES cv_files(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified_by UUID REFERENCES auth.users(id),

    -- Campi A (AI-populated fields)
    nome TEXT,
    cognome TEXT,
    data_nascita DATE,
    luogo_residenza TEXT,
    cellulare TEXT,
    email TEXT,
    ruolo_attuale TEXT,
    anni_esperienza INTEGER,
    data_inizio_esperienza DATE,

    -- Campi B (Operator-populated fields)
    contratto_attuale TEXT,
    scadenza_contratto DATE,
    preavviso TEXT,
    tipo_contratto_desiderato contract_type,
    stipendio_desiderato TEXT,
    data_ultimo_contatto DATE,
    nota TEXT
);

-- Separate tables for different types of skills
CREATE TABLE cv_tools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cv_profile_id UUID REFERENCES cv_profiles(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cv_database (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cv_profile_id UUID REFERENCES cv_profiles(id) ON DELETE CASCADE,
    nome_database TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cv_piattaforme (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cv_profile_id UUID REFERENCES cv_profiles(id) ON DELETE CASCADE,
    nome_piattaforma TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cv_sistemi_operativi (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cv_profile_id UUID REFERENCES cv_profiles(id) ON DELETE CASCADE,
    nome_sistema TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cv_linguaggi_programmazione (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cv_profile_id UUID REFERENCES cv_profiles(id) ON DELETE CASCADE,
    nome_linguaggio TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_cv_files_status ON cv_files(process_status);
CREATE INDEX idx_cv_profiles_nome_cognome ON cv_profiles(nome, cognome);
CREATE INDEX idx_cv_tools ON cv_tools(cv_profile_id, tool_name);
CREATE INDEX idx_cv_database ON cv_database(cv_profile_id, nome_database);
CREATE INDEX idx_cv_piattaforme ON cv_piattaforme(cv_profile_id, nome_piattaforma);
CREATE INDEX idx_cv_sistemi_operativi ON cv_sistemi_operativi(cv_profile_id, nome_sistema);
CREATE INDEX idx_cv_linguaggi_programmazione ON cv_linguaggi_programmazione(cv_profile_id, nome_linguaggio);

-- Update trigger for cv_files
CREATE OR REPLACE FUNCTION update_cv_files_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cv_files_modified
    BEFORE UPDATE ON cv_files
    FOR EACH ROW
    EXECUTE PROCEDURE update_cv_files_modified();

-- Update trigger for cv_profiles
CREATE OR REPLACE FUNCTION update_cv_profiles_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cv_profiles_modified
    BEFORE UPDATE ON cv_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_cv_profiles_modified();

-- Create a view for CV search with all skills
CREATE OR REPLACE VIEW cv_search_view AS
SELECT 
    p.id,
    p.created_at,
    p.updated_at,
    p.nome,
    p.cognome,
    p.luogo_residenza,
    p.anni_esperienza,
    p.email,
    p.cellulare,
    p.ruolo_attuale,
    p.contratto_attuale,
    p.scadenza_contratto,
    p.stipendio_desiderato,
    p.data_ultimo_contatto,
    p.nota,
    f.process_status,
    array_remove(array_agg(DISTINCT t.tool_name), NULL) as tools,
    array_remove(array_agg(DISTINCT d.nome_database), NULL) as database,
    array_remove(array_agg(DISTINCT pl.nome_piattaforma), NULL) as piattaforme,
    array_remove(array_agg(DISTINCT os.nome_sistema), NULL) as sistemi_operativi,
    array_remove(array_agg(DISTINCT l.nome_linguaggio), NULL) as linguaggi_programmazione
FROM cv_profiles p
LEFT JOIN cv_files f ON p.cv_file_id = f.id
LEFT JOIN cv_tools t ON t.cv_profile_id = p.id
LEFT JOIN cv_database d ON d.cv_profile_id = p.id
LEFT JOIN cv_piattaforme pl ON pl.cv_profile_id = p.id
LEFT JOIN cv_sistemi_operativi os ON os.cv_profile_id = p.id
LEFT JOIN cv_linguaggi_programmazione l ON l.cv_profile_id = p.id
GROUP BY p.id, f.id;

-- Enable RLS on all tables
ALTER TABLE cv_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_piattaforme ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_sistemi_operativi ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_linguaggi_programmazione ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable all operations for cv_files" ON cv_files;
DROP POLICY IF EXISTS "Enable all operations for cv_profiles" ON cv_profiles;
DROP POLICY IF EXISTS "Enable all operations for cv_tools" ON cv_tools;
DROP POLICY IF EXISTS "Enable all operations for cv_database" ON cv_database;
DROP POLICY IF EXISTS "Enable all operations for cv_piattaforme" ON cv_piattaforme;
DROP POLICY IF EXISTS "Enable all operations for cv_sistemi_operativi" ON cv_sistemi_operativi;
DROP POLICY IF EXISTS "Enable all operations for cv_linguaggi_programmazione" ON cv_linguaggi_programmazione;

-- Create new policies
CREATE POLICY "Enable all operations for cv_files"
ON cv_files FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for cv_profiles"
ON cv_profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for cv_tools"
ON cv_tools FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for cv_database"
ON cv_database FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for cv_piattaforme"
ON cv_piattaforme FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for cv_sistemi_operativi"
ON cv_sistemi_operativi FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for cv_linguaggi_programmazione"
ON cv_linguaggi_programmazione FOR ALL USING (true) WITH CHECK (true);