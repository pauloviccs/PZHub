use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Duration;
use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalModInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version_min: Option<String>,
    pub poster_base64: Option<String>,
    pub icon_base64: Option<String>,
    pub source_type: String, // "local" | "workshop"
    pub folder_path: String,
    pub workshop_id: Option<String>,
    pub is_active: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModItem {
    pub id: String,
    pub name: String,
    #[serde(default = "default_mod_type")]
    pub mod_type: String, // "builtin" | "workshop" | "direct_download"
    pub workshop_id: Option<String>,
    pub download_url: Option<String>,
    pub folder_name: Option<String>,
    pub version: Option<String>,
    #[serde(default)]
    pub required: bool,
    pub description: Option<String>,
}

fn default_mod_type() -> String {
    "workshop".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModpackManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub image: Option<String>,
    pub zomboid_version: Option<String>,
    pub updated_at: Option<String>,
    pub source_url: Option<String>,
    #[serde(default)]
    pub mods: Vec<ModItem>,
}

/// Retorna o caminho da pasta Zomboid/mods do usuário
pub fn get_zomboid_mods_dir() -> PathBuf {
    let mut path = dirs::home_dir().unwrap_or_else(|| PathBuf::from("./"));
    path.push("Zomboid");
    path.push("mods");
    path
}

/// Retorna possíveis caminhos da pasta do Workshop do Project Zomboid (App ID: 108600)
pub fn get_steam_workshop_dirs() -> Vec<PathBuf> {
    let mut dirs_list = Vec::new();
    
    // Caminhos padrões conhecidos no Windows
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
            dirs_list.push(p);
        }
    }

    dirs_list
}

/// Lê e faz parse do arquivo mod.info
fn parse_mod_info(info_path: &Path, source_type: &str, workshop_id: Option<String>) -> Option<LocalModInfo> {
    let mut file = File::open(info_path).ok()?;
    let mut content = String::new();
    file.read_to_string(&mut content).ok()?;

    let mut id = String::new();
    let mut name = String::new();
    let mut description = String::new();
    let mut version_min = None;
    let mut poster_base64 = None;
    let mut icon_base64 = None;

    let parent_dir = info_path.parent().unwrap_or(info_path);

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("id=") {
            id = trimmed[3..].trim().to_string();
        } else if trimmed.starts_with("name=") {
            name = trimmed[5..].trim().to_string();
        } else if trimmed.starts_with("description=") {
            description = trimmed[12..].trim().to_string();
        } else if trimmed.starts_with("versionMin=") {
            version_min = Some(trimmed[11..].trim().to_string());
        } else if trimmed.starts_with("poster=") {
            let poster_file = trimmed[7..].trim();
            let poster_path = parent_dir.join(poster_file);
            if poster_path.exists() {
                if let Ok(bytes) = fs::read(&poster_path) {
                    poster_base64 = Some(format!("data:image/png;base64,{}", BASE64.encode(&bytes)));
                }
            }
        } else if trimmed.starts_with("icon=") {
            let icon_file = trimmed[5..].trim();
            let icon_path = parent_dir.join(icon_file);
            if icon_path.exists() {
                if let Ok(bytes) = fs::read(&icon_path) {
                    icon_base64 = Some(format!("data:image/png;base64,{}", BASE64.encode(&bytes)));
                }
            }
        }
    }

    // Se o poster não foi especificado no mod.info mas existir poster.png
    if poster_base64.is_none() {
        let default_poster = parent_dir.join("poster.png");
        if default_poster.exists() {
            if let Ok(bytes) = fs::read(&default_poster) {
                poster_base64 = Some(format!("data:image/png;base64,{}", BASE64.encode(&bytes)));
            }
        }
    }

    // Se o icon não foi especificado no mod.info mas existir icon.png
    if icon_base64.is_none() {
        let default_icon = parent_dir.join("icon.png");
        if default_icon.exists() {
            if let Ok(bytes) = fs::read(&default_icon) {
                icon_base64 = Some(format!("data:image/png;base64,{}", BASE64.encode(&bytes)));
            }
        }
    }

    if id.is_empty() {
        id = parent_dir.file_name().and_then(|n| n.to_str()).unwrap_or("unknown_mod").to_string();
    }
    if name.is_empty() {
        name = id.clone();
    }

    Some(LocalModInfo {
        id,
        name,
        description,
        version_min,
        poster_base64,
        icon_base64,
        source_type: source_type.to_string(),
        folder_path: parent_dir.to_string_lossy().to_string(),
        workshop_id,
        is_active: true,
    })
}

/// Varre recursivamente uma pasta procurando por mod.info
fn scan_folder_for_mods(base_path: &Path, source_type: &str, workshop_id: Option<String>, results: &mut Vec<LocalModInfo>) {
    if !base_path.exists() || !base_path.is_dir() {
        return;
    }

    // Se a própria pasta contém mod.info
    let direct_info = base_path.join("mod.info");
    if direct_info.exists() {
        if let Some(mod_info) = parse_mod_info(&direct_info, source_type, workshop_id.clone()) {
            results.push(mod_info);
            return;
        }
    }

    // Se a pasta for uma pasta pai (ex: Zomboid/mods ou uma pasta de workshop com sub-mods)
    if let Ok(entries) = fs::read_dir(base_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let sub_mod_info = path.join("mod.info");
                if sub_mod_info.exists() {
                    let w_id = if source_type == "workshop" && workshop_id.is_none() {
                        base_path.file_name().and_then(|n| n.to_str()).map(|s| s.to_string())
                    } else {
                        workshop_id.clone()
                    };
                    if let Some(mod_info) = parse_mod_info(&sub_mod_info, source_type, w_id) {
                        results.push(mod_info);
                    }
                } else {
                    // Verifica subpastas com mods aninhados (como mods/42/ ou mods/common/)
                    if let Ok(sub_entries) = fs::read_dir(&path) {
                        for sub_entry in sub_entries.flatten() {
                            let sub_path = sub_entry.path();
                            if sub_path.is_dir() {
                                let nested_mod_info = sub_path.join("mod.info");
                                if nested_mod_info.exists() {
                                    if let Some(mod_info) = parse_mod_info(&nested_mod_info, source_type, workshop_id.clone()) {
                                        results.push(mod_info);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/// Varre todos os mods instalados localmente (%USERPROFILE%/Zomboid/mods e Steam Workshop)
pub fn scan_all_installed_mods() -> Vec<LocalModInfo> {
    let mut mods = Vec::new();

    // 1. Varre a pasta local do usuário
    let user_mods_dir = get_zomboid_mods_dir();
    scan_folder_for_mods(&user_mods_dir, "local", None, &mut mods);

    // 2. Varre as pastas de Workshop da Steam detectadas
    let workshop_dirs = get_steam_workshop_dirs();
    for ws_dir in workshop_dirs {
        if let Ok(entries) = fs::read_dir(&ws_dir) {
            for entry in entries.flatten() {
                let item_dir = entry.path();
                if item_dir.is_dir() {
                    let w_id = item_dir.file_name().and_then(|n| n.to_str()).map(|s| s.to_string());
                    scan_folder_for_mods(&item_dir, "workshop", w_id, &mut mods);
                }
            }
        }
    }

    mods
}

/// Faz download e parse do manifesto remoto de um modpack (via Pastebin ou URL direta JSON)
pub async fn fetch_modpack_manifest(url: String) -> Result<ModpackManifest, String> {
    let mut target_url = url.trim().to_string();

    // Se for URL normal do Pastebin (ex: pastebin.com/XXXX), converte para RAW
    if target_url.contains("pastebin.com/") && !target_url.contains("pastebin.com/raw/") {
        target_url = target_url.replace("pastebin.com/", "pastebin.com/raw/");
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(12))
        .user_agent("PZHub-ModManager/2.0")
        .build()
        .map_err(|e| format!("Erro ao criar cliente HTTP: {}", e))?;

    let response = client.get(&target_url)
        .send()
        .await
        .map_err(|e| format!("Falha ao conectar na URL do Modpack: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("O servidor retornou erro HTTP: {}", response.status()));
    }

    let text_content = response.text()
        .await
        .map_err(|e| format!("Falha ao ler conteúdo do manifesto: {}", e))?;

    // Tenta deserializar o JSON do manifesto
    let mut manifest: ModpackManifest = serde_json::from_str(&text_content)
        .map_err(|e| format!("Estrutura do manifesto inválida (JSON Parse Error): {}", e))?;

    manifest.source_url = Some(target_url);
    Ok(manifest)
}

use std::io::{Cursor, copy};

/// Normaliza URLs de serviços comuns (Dropbox, Google Drive, etc.) para links de download direto de arquivos binários
fn normalize_download_url(url: &str) -> String {
    let mut clean_url = url.trim().to_string();

    // Normalização para Dropbox: dl=0 -> dl=1
    if clean_url.contains("dropbox.com") {
        if clean_url.contains("dl=0") {
            clean_url = clean_url.replace("dl=0", "dl=1");
        } else if !clean_url.contains("dl=1") {
            if clean_url.contains('?') {
                clean_url.push_str("&dl=1");
            } else {
                clean_url.push_str("?dl=1");
            }
        }
    }
    // Normalização para Google Drive
    else if clean_url.contains("drive.google.com/file/d/") {
        if let Some(start) = clean_url.find("/file/d/") {
            let remainder = &clean_url[start + 8..];
            let file_id = remainder.split('/').next().unwrap_or("").split('?').next().unwrap_or("");
            if !file_id.is_empty() {
                clean_url = format!("https://drive.google.com/uc?export=download&id={}", file_id);
            }
        }
    }

    clean_url
}

/// Faz download de um mod em arquivo .ZIP e descompacta de forma nativa e inteligente na pasta Zomboid/mods
pub async fn download_and_extract_direct_mod(download_url: String, folder_name: String) -> Result<String, String> {
    let mods_dir = get_zomboid_mods_dir();
    fs::create_dir_all(&mods_dir).map_err(|e| format!("Não foi possível criar pasta mods: {}", e))?;

    let direct_url = normalize_download_url(&download_url);

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(60))
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client.get(&direct_url)
        .send()
        .await
        .map_err(|e| format!("Erro no download: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("O servidor retornou erro HTTP: {}", resp.status()));
    }

    let bytes = resp.bytes().await.map_err(|e| format!("Erro ao ler bytes do download: {}", e))?;

    if bytes.len() < 22 {
        return Err("O arquivo baixado é inválido ou está vazio.".to_string());
    }

    let cursor = Cursor::new(&bytes);
    let mut archive = zip::ZipArchive::new(cursor)
        .map_err(|e| format!("Erro ao abrir arquivo ZIP: {}. Verifique se o link é direto para um arquivo .zip válido.", e))?;

    let target_dest = mods_dir.join(&folder_name);
    let _ = fs::create_dir_all(&target_dest);

    // Inspeciona se todas as entradas do ZIP possuem um prefixo comum de pasta raiz (ex: "VICCSRadarBridge/")
    let mut common_prefix: Option<String> = None;
    let mut file_count = 0;

    for i in 0..archive.len() {
        if let Ok(file) = archive.by_index(i) {
            let name = file.name().replace('\\', "/");
            if name.is_empty() {
                continue;
            }
            if let Some(first_slash) = name.find('/') {
                let prefix = name[..=first_slash].to_string();
                if let Some(ref current) = common_prefix {
                    if current != &prefix {
                        common_prefix = None;
                        break;
                    }
                } else {
                    common_prefix = Some(prefix);
                }
            } else if !file.is_dir() {
                // Arquivo solto na raiz do ZIP: sem prefixo comum de pasta
                common_prefix = None;
                break;
            }
        }
    }

    let prefix_to_strip = common_prefix.unwrap_or_default();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)
            .map_err(|e| format!("Erro ao ler entrada {} do ZIP: {}", i, e))?;

        let raw_name = file.name().replace('\\', "/");
        let relative_name = if !prefix_to_strip.is_empty() && raw_name.starts_with(&prefix_to_strip) {
            &raw_name[prefix_to_strip.len()..]
        } else {
            &raw_name
        };

        let trimmed_relative = relative_name.trim_start_matches('/');
        if trimmed_relative.is_empty() {
            continue;
        }

        // Prevenção de Zip Slip (segurança contra caminhos com ..)
        let outpath = target_dest.join(trimmed_relative);
        if !outpath.starts_with(&target_dest) {
            continue;
        }

        if file.is_dir() || raw_name.ends_with('/') {
            let _ = fs::create_dir_all(&outpath);
        } else {
            if let Some(p) = outpath.parent() {
                let _ = fs::create_dir_all(p);
            }
            let mut outfile = File::create(&outpath)
                .map_err(|e| format!("Erro ao criar arquivo de destino {:?}: {}", outpath, e))?;
            copy(&mut file, &mut outfile)
                .map_err(|e| format!("Erro ao extrair arquivo {:?}: {}", outpath, e))?;
            file_count += 1;
        }
    }

    Ok(format!("Mod '{}' instalado com sucesso ({} arquivos extraídos) em {:?}", folder_name, file_count, target_dest))
}

/// Remove pasta de um mod desinstalado em Zomboid/mods
pub fn delete_mod_folder(folder_name: &str) -> Result<(), String> {
    let mods_dir = get_zomboid_mods_dir();
    let target = mods_dir.join(folder_name);
    if target.exists() && target.is_dir() {
        fs::remove_dir_all(&target).map_err(|e| format!("Erro ao remover pasta do mod: {}", e))?;
    }
    Ok(())
}

/// Abre item do Steam Workshop no protocolo da Steam ou no navegador como fallback
pub fn open_steam_workshop(workshop_id: &str) -> Result<(), String> {
    let steam_url = format!("steam://url/CommunityFilePage/{}", workshop_id);
    let web_url = format!("https://steamcommunity.com/sharedfiles/filedetails/?id={}", workshop_id);

    #[cfg(target_os = "windows")]
    {
        if Command::new("cmd").args(["/C", "start", &steam_url]).spawn().is_err() {
            let _ = Command::new("cmd").args(["/C", "start", &web_url]).spawn();
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _ = open::that(&web_url);
    }

    Ok(())
}

/// Abre um diretório específico no Windows Explorer
pub fn open_folder(path_str: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("explorer").arg(path_str).spawn();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = open::that(path_str);
    }
    Ok(())
}
