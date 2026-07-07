// Prevents an additional console window on Windows in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Intentionally minimal — no commands, no plugins, no tray icon yet.
    // This just proves the window boots and loads the Vite/React frontend.
    // System tray behavior, global shortcuts, and notifications (the actual
    // "widget" functionality) are a feature pass on top of this, once the
    // web/server foundation has something worth surfacing here.
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running the Kaam 25 desktop application");
}
