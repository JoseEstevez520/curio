// Curio — Tauri PoC entry point.
//
// ⚠️ PROOF OF CONCEPT — NOT COMPILED in this environment (no Rust toolchain / WebView2).
// This file documents the SHAPE of the desktop shell: it wraps the existing web core
// (served from ../dist) and exposes the two "second brain" data layers from VISION.md as
// Tauri commands the frontend can call via `invoke`:
//   • a Markdown VAULT on disk (durable knowledge, Obsidian-style)   → vault::*
//   • structured SESSIONS (chat logs; JSON here, SQLite later)       → sessions::*
// The bridge gesture "documenta esto → Markdown" is `vault::write_note`.
//
// See docs/experiments/tauri-poc.md for how to actually build/run it and what's missing.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod sessions;
mod vault;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            vault::list_notes,
            vault::read_note,
            vault::write_note,
            sessions::load_sessions,
            sessions::save_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Curio");
}
