use std::sync::Mutex;
use tauri::{Manager, RunEvent, State};
use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandChild;

struct AppState {
    child: Mutex<Option<CommandChild>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .manage(AppState {
            child: Mutex::new(None),
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let state = app.state::<AppState>();
            let sidecar_command = app.shell().sidecar("valovault-backend").unwrap();
            let (_rx, child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

            *state.child.lock().unwrap() = Some(child);

            Ok(())
        });

    let app = builder
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|app_handle, event| {
        if let RunEvent::ExitRequested { .. } = event {
            let state: State<AppState> = app_handle.state();
            if let Some(child) = state.child.lock().unwrap().take() {
                child.kill().expect("Failed to kill sidecar");
            };
        }
    });
}

