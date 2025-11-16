#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use warp::Filter;

// State partagé pour stocker le résultat OAuth
struct OAuthState {
    callback_url: Option<String>,
    server_handle: Option<tokio::task::JoinHandle<()>>,
}

lazy_static::lazy_static! {
    static ref OAUTH_STATE: Arc<Mutex<OAuthState>> = Arc::new(Mutex::new(OAuthState {
        callback_url: None,
        server_handle: None,
    }));
}

// Commande pour ouvrir l'URL OAuth dans le navigateur par défaut
#[tauri::command]
fn open_oauth_url(url: String) -> Result<(), String> {
    println!("Opening OAuth URL in browser: {}", url);
    open::that(&url).map_err(|e| e.to_string())
}

// Démarre le serveur local pour capturer le callback OAuth
#[tauri::command]
async fn start_oauth_server() -> Result<u16, String> {
    let port = 8765;

    let state = OAUTH_STATE.clone();

    let callback = warp::path("callback")
        .and(warp::query::<std::collections::HashMap<String, String>>())
        .map(move |params: std::collections::HashMap<String, String>| {
            // Construire l'URL complète avec les paramètres
            let url_params: Vec<String> = params.iter()
                .map(|(k, v)| format!("{}={}", k, v))
                .collect();
            let callback_url = format!("http://localhost:8765/callback?{}", url_params.join("&"));

            // Stocker dans le state
            if let Ok(mut state) = state.lock() {
                state.callback_url = Some(callback_url);
            }

            warp::reply::html("<html><body><h1>Authentication successful!</h1><p>You can close this window and return to the app.</p></body></html>")
        });

    let routes = callback;

    let server = warp::serve(routes).run(([127, 0, 0, 1], port));

    let handle = tokio::spawn(server);

    if let Ok(mut state) = OAUTH_STATE.lock() {
        state.server_handle = Some(handle);
    }

    Ok(port)
}

// Récupère le résultat OAuth si disponible
#[tauri::command]
fn get_oauth_result() -> Option<String> {
    if let Ok(mut state) = OAUTH_STATE.lock() {
        state.callback_url.take()
    } else {
        None
    }
}

// Arrête le serveur OAuth
#[tauri::command]
fn stop_oauth_server() {
    if let Ok(mut state) = OAUTH_STATE.lock() {
        if let Some(handle) = state.server_handle.take() {
            handle.abort();
        }
        state.callback_url = None;
    }
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_oauth_url,
            start_oauth_server,
            get_oauth_result,
            stop_oauth_server
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
