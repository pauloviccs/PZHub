use std::fs;
use std::path::PathBuf;
use std::process::Command;

/// Retorna possíveis caminhos da pasta de instalação do Project Zomboid (App ID 108600)
pub fn get_pz_game_dirs() -> Vec<PathBuf> {
    let candidates = [
        r"C:\Program Files (x86)\Steam\steamapps\common\ProjectZomboid",
        r"C:\Program Files\Steam\steamapps\common\ProjectZomboid",
        r"C:\Steam\steamapps\common\ProjectZomboid",
        r"D:\SteamLibrary\steamapps\common\ProjectZomboid",
        r"D:\Steam\steamapps\common\ProjectZomboid",
        r"E:\SteamLibrary\steamapps\common\ProjectZomboid",
        r"E:\Steam\steamapps\common\ProjectZomboid",
        r"F:\SteamLibrary\steamapps\common\ProjectZomboid",
        r"G:\SteamLibrary\steamapps\common\ProjectZomboid",
    ];

    let mut dirs = Vec::new();
    for candidate in candidates {
        let p = PathBuf::from(candidate);
        if p.exists() && p.is_dir() {
            dirs.push(p);
        }
    }
    dirs
}

/// Modifica ProjectZomboid64.json para alocar a quantidade de RAM solicitada (em GB)
pub fn configure_pz_ram(ram_gb: u32) -> Result<Option<PathBuf>, String> {
    let ram_val = if ram_gb == 0 { 8 } else { ram_gb };
    let xmx_arg = format!("-Xmx{}m", ram_val * 1024);
    let xms_arg = format!("-Xms{}m", (ram_val / 2).max(2) * 1024);

    let dirs = get_pz_game_dirs();
    for dir in dirs {
        let json_path = dir.join("ProjectZomboid64.json");
        if json_path.exists() {
            if let Ok(content) = fs::read_to_string(&json_path) {
                if let Ok(mut val) = serde_json::from_str::<serde_json::Value>(&content) {
                    if let Some(vm_args) = val.get_mut("vmArgs").and_then(|v| v.as_array_mut()) {
                        let mut found_xmx = false;
                        let mut found_xms = false;

                        for arg in vm_args.iter_mut() {
                            if let Some(s) = arg.as_str() {
                                if s.starts_with("-Xmx") {
                                    *arg = serde_json::Value::String(xmx_arg.clone());
                                    found_xmx = true;
                                } else if s.starts_with("-Xms") {
                                    *arg = serde_json::Value::String(xms_arg.clone());
                                    found_xms = true;
                                }
                            }
                        }

                        if !found_xmx {
                            vm_args.push(serde_json::Value::String(xmx_arg.clone()));
                        }
                        if !found_xms {
                            vm_args.push(serde_json::Value::String(xms_arg.clone()));
                        }

                        if let Ok(pretty) = serde_json::to_string_pretty(&val) {
                            let _ = fs::write(&json_path, pretty);
                            return Ok(Some(json_path));
                        }
                    }
                }
            }
        }
    }
    Ok(None)
}

/// Dispara a execução do Project Zomboid com a RAM configurada via Steam
pub fn launch_game(ram_gb: u32) -> Result<String, String> {
    let ram_val = if ram_gb == 0 { 8 } else { ram_gb };

    // 1. Tenta configurar o ProjectZomboid64.json se encontrado
    let configured_path = configure_pz_ram(ram_val).unwrap_or(None);

    // 2. Dispara via protocolo oficial da Steam
    #[cfg(target_os = "windows")]
    {
        let steam_uri = "steam://run/108600";
        let spawn_res = Command::new("cmd")
            .args(["/C", "start", steam_uri])
            .spawn();

        match spawn_res {
            Ok(_) => {
                let note = if let Some(p) = configured_path {
                    format!(" (alocado em {})", p.display())
                } else {
                    "".to_string()
                };
                Ok(format!("Iniciando Project Zomboid via Steam com {}GB de RAM{}", ram_val, note))
            },
            Err(e) => {
                // Fallback: se o protocolo Steam falhar, tenta iniciar o executável direto
                let dirs = get_pz_game_dirs();
                for dir in dirs {
                    let exe_path = dir.join("ProjectZomboid64.exe");
                    if exe_path.exists() {
                        let _ = Command::new(&exe_path)
                            .current_dir(&dir)
                            .spawn();
                        return Ok(format!("Iniciado executável direto com {}GB de RAM", ram_val));
                    }
                }
                Err(format!("Falha ao iniciar o jogo via Steam: {}", e))
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Err("Lançador compatível apenas com ambiente Windows.".to_string())
    }
}
