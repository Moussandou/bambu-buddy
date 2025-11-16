#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Emitter, Manager};

// Commande pour ouvrir l'URL OAuth dans le navigateur par défaut
#[tauri::command]
fn open_oauth_url(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Enregistrer le deep link handler
            let handle = app.handle().clone();
            app.listen("deep-link://auth-callback", move |event| {
                if let Some(payload) = event.payload() {
                    // Émettre l'événement vers le frontend
                    let _ = handle.emit("oauth-callback", payload);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![open_oauth_url])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
