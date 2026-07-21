// The SESSIONS layer — chat conversations (VISION.md: "un log de chat no es un documento",
// so this is structured, NOT Markdown). JSON on disk for the PoC; SQLite is the natural next
// step. Kept deliberately separate from the vault so the two layers never mix.
//
// ⚠️ PoC: not compiled here.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
pub struct Turn {
    pub role: String,
    pub content: String,
}

#[derive(Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub title: String,
    /// ISO timestamp, set by the frontend (Rust side just stores it).
    pub updated_at: String,
    pub turns: Vec<Turn>,
}

fn store_path(dir: &str) -> PathBuf {
    PathBuf::from(dir).join("sessions.json")
}

/// Load all saved sessions (empty list if the store doesn't exist yet).
#[tauri::command]
pub fn load_sessions(dir: String) -> Result<Vec<Session>, String> {
    let path = store_path(&dir);
    if !path.exists() {
        return Ok(Vec::new());
    }
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

/// Upsert one session (replace by id) and persist the whole store.
#[tauri::command]
pub fn save_session(dir: String, session: Session) -> Result<(), String> {
    let mut all = load_sessions(dir.clone())?;
    match all.iter_mut().find(|s| s.id == session.id) {
        Some(existing) => *existing = session,
        None => all.push(session),
    }
    if let Some(parent) = store_path(&dir).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(&all).map_err(|e| e.to_string())?;
    fs::write(store_path(&dir), json).map_err(|e| e.to_string())
}
