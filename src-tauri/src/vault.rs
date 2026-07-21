// The Markdown VAULT — the durable knowledge layer (VISION.md). Plain .md files on disk,
// Obsidian-style, owned by the user. The frontend calls these via `invoke("write_note", …)`.
//
// ⚠️ PoC: not compiled here. Paths are taken as arguments for the PoC; a real build would
// confine them to a chosen vault root and validate against path traversal.

use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize)]
pub struct NoteMeta {
    /// Path relative to the vault root, e.g. "temas/mercurio.md".
    pub rel_path: String,
    /// Bytes on disk (cheap listing without reading contents).
    pub size: u64,
}

/// List every Markdown note under `vault` (recursively), newest concerns first.
#[tauri::command]
pub fn list_notes(vault: String) -> Result<Vec<NoteMeta>, String> {
    let root = PathBuf::from(&vault);
    let mut out = Vec::new();
    collect(&root, &root, &mut out).map_err(|e| e.to_string())?;
    Ok(out)
}

fn collect(root: &Path, dir: &Path, out: &mut Vec<NoteMeta>) -> std::io::Result<()> {
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect(root, &path, out)?;
        } else if path.extension().and_then(|e| e.to_str()) == Some("md") {
            let rel = path.strip_prefix(root).unwrap_or(&path).to_string_lossy();
            out.push(NoteMeta {
                rel_path: rel.replace('\\', "/"),
                size: entry.metadata().map(|m| m.len()).unwrap_or(0),
            });
        }
    }
    Ok(())
}

/// Read one note's Markdown.
#[tauri::command]
pub fn read_note(vault: String, rel_path: String) -> Result<String, String> {
    let path = PathBuf::from(vault).join(&rel_path);
    fs::read_to_string(path).map_err(|e| e.to_string())
}

/// Write (create/overwrite) one note. THIS is the "documenta esto → Markdown" bridge target:
/// the frontend summarizes a session/message and drops it here as a durable note.
#[tauri::command]
pub fn write_note(vault: String, rel_path: String, content: String) -> Result<(), String> {
    let path = PathBuf::from(vault).join(&rel_path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(path, content).map_err(|e| e.to_string())
}
