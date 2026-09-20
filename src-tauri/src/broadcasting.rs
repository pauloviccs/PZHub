use std::fs;
use std::path::PathBuf;
use tauri::Manager;

/// Procura o arquivo de comunicação game_to_app.json gerado pelo mod
pub fn find_broadcasting_file() -> Option<PathBuf> {
    let mut candidates = Vec::new();

    // 1. %USERPROFILE%/Zomboid/Lua/PZMusic/game_to_app.json
    if let Some(mut p) = dirs::home_dir() {
        p.push("Zomboid");
        p.push("Lua");
        p.push("PZMusic");
        p.push("game_to_app.json");
        candidates.push(p);
    }

    // 2. Documents/Zomboid/Lua/PZMusic/game_to_app.json
    if let Some(mut p) = dirs::document_dir() {
        p.push("Zomboid");
        p.push("Lua");
        p.push("PZMusic");
        p.push("game_to_app.json");
        candidates.push(p);
    }

    // 3. Caminho relativo padrão
    candidates.push(PathBuf::from("Zomboid/Lua/PZMusic/game_to_app.json"));

    for path in candidates {
        if path.exists() {
            return Some(path);
        }
    }

    None
}

/// Verifica se o mod VICCS_Broadcasting está instalado em Zomboid/mods ou no Workshop
pub fn is_broadcasting_mod_installed() -> bool {
    // 1. Verifica no diretório local Zomboid/mods/VICCS_Broadcasting/mod.info
    if let Some(mut p) = dirs::home_dir() {
        p.push("Zomboid");
        p.push("mods");
        p.push("VICCS_Broadcasting");
        p.push("mod.info");
        if p.exists() {
            return true;
        }
    }

    // 2. Verifica no Documents/Zomboid/mods/VICCS_Broadcasting/mod.info
    if let Some(mut p) = dirs::document_dir() {
        p.push("Zomboid");
        p.push("mods");
        p.push("VICCS_Broadcasting");
        p.push("mod.info");
        if p.exists() {
            return true;
        }
    }

    // 3. Verifica em diretórios da Steam Workshop conhecidos
    let candidates = [
        r"C:\Program Files (x86)\Steam\steamapps\workshop\content\108600",
        r"C:\Steam\steamapps\workshop\content\108600",
        r"D:\SteamLibrary\steamapps\workshop\content\108600",
        r"D:\Steam\steamapps\workshop\content\108600",
        r"E:\SteamLibrary\steamapps\workshop\content\108600",
        r"E:\Steam\steamapps\workshop\content\108600",
        r"F:\SteamLibrary\steamapps\workshop\content\108600",
        r"G:\SteamLibrary\steamapps\workshop\content\108600",
    ];

    for candidate in candidates {
        let p = PathBuf::from(candidate);
        if p.exists() && p.is_dir() {
            // Procura subpastas que tenham mod.info com VICCS_Broadcasting
            if let Ok(entries) = fs::read_dir(p) {
                for entry in entries.flatten() {
                    let mut info_path = entry.path();
                    info_path.push("mods");
                    info_path.push("VICCS_Broadcasting");
                    info_path.push("mod.info");
                    if info_path.exists() {
                        return true;
                    }
                }
            }
        }
    }

    false
}

/// Lê o conteúdo bruto de game_to_app.json
pub fn read_broadcasting_json() -> Option<String> {
    let path = find_broadcasting_file()?;
    fs::read_to_string(&path).ok()
}

/// Controla a visibilidade da janela flutuante de TV (PiP)
pub fn set_pip_visible(app: &tauri::AppHandle, visible: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("pip_player") {
        if visible {
            window.show().map_err(|e| e.to_string())?;
            window.set_always_on_top(true).map_err(|e| e.to_string())?;
        } else {
            window.hide().map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}
