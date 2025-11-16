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

    let state_for_callback = state.clone();
    let callback = warp::path("callback")
        .map(move || {
            warp::reply::html(r#"
<!DOCTYPE html>
<html>
<head>
    <title>Authentication</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #4CAF50; }
    </style>
</head>
<body>
    <h1>Authentication successful!</h1>
    <p>You can close this window and return to the app.</p>
    <script>
        // Extraire les paramètres du fragment (#)
        const hash = window.location.hash.substring(1);
        if (hash) {
            // Envoyer le fragment au serveur via une requête POST
            fetch('/store_token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fragment: hash })
            }).then(() => {
                console.log('Token stored successfully');
            }).catch(err => {
                console.error('Error storing token:', err);
            });
        }
    </script>
</body>
</html>
            "#)
        });

    let state_for_store = state.clone();
    let store_token = warp::path("store_token")
        .and(warp::post())
        .and(warp::body::json())
        .map(move |body: serde_json::Value| {
            if let Some(fragment) = body.get("fragment").and_then(|v| v.as_str()) {
                let callback_url = format!("http://localhost:8765/callback#{}", fragment);
                if let Ok(mut state) = state_for_store.lock() {
                    state.callback_url = Some(callback_url);
                }
            }
            warp::reply::json(&serde_json::json!({"status": "ok"}))
        });

    let routes = callback.or(store_token);

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
