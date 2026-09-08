use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

fn default_health() -> f32 {
    100.0
}

fn default_true() -> bool {
    true
}

fn default_server_name() -> String {
    "Project Zomboid".to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerTelemetry {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub steam_id: String,
    #[serde(default)]
    pub x: f64,
    #[serde(default)]
    pub y: f64,
    #[serde(default)]
    pub z: i32,
    #[serde(default = "default_health")]
    pub health: f32,
    #[serde(default)]
    pub faction: String,
    #[serde(default = "default_true")]
    pub is_alive: bool,
    #[serde(default)]
    pub is_self: bool,
    #[serde(default)]
    pub last_seen: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SquadState {
    #[serde(default = "default_server_name")]
    pub server_name: String,
    #[serde(default = "default_true")]
    pub is_connected: bool,
    #[serde(default)]
    pub players: Vec<PlayerTelemetry>,
    #[serde(default)]
    pub timestamp: u64,
    #[serde(default)]
    pub source: String, // "live_game" ou "offline"
}

pub struct TelemetryManager {
    pub is_simulating: Arc<AtomicBool>,
}

impl TelemetryManager {
    pub fn new() -> Self {
        Self {
            is_simulating: Arc::new(AtomicBool::new(false)),
        }
    }
}

fn current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

/// Localiza o arquivo de telemetria em todas as pastas padrão possíveis do Zomboid
pub fn find_telemetry_file() -> Option<PathBuf> {
    let mut candidates = Vec::new();

    // 1. %USERPROFILE%/Zomboid/Lua/viccs_telemetry.json
    if let Some(mut p) = dirs::home_dir() {
        p.push("Zomboid");
        p.push("Lua");
        p.push("viccs_telemetry.json");
        candidates.push(p);
    }

    // 2. Documents/Zomboid/Lua/viccs_telemetry.json
    if let Some(mut p) = dirs::document_dir() {
        p.push("Zomboid");
        p.push("Lua");
        p.push("viccs_telemetry.json");
        candidates.push(p);
    }

    // 3. ./Zomboid/Lua/viccs_telemetry.json (relativo)
    candidates.push(PathBuf::from("Zomboid/Lua/viccs_telemetry.json"));

    for path in candidates {
        if path.exists() {
            return Some(path);
        }
    }

    None
}

/// Tenta ler os dados reais gravados pelo Mod Lua em Zomboid/Lua/viccs_telemetry.json
pub fn read_live_telemetry() -> Option<SquadState> {
    let path = find_telemetry_file()?;

    // Verifica se o arquivo foi modificado recentemente (tolerância de até 30s)
    if let Ok(metadata) = fs::metadata(&path) {
        if let Ok(modified) = metadata.modified() {
            if let Ok(elapsed) = modified.elapsed() {
                if elapsed.as_secs() > 30 {
                    return None;
                }
            }
            // Se modified.elapsed() der erro (clock skew / timestamp futuro), considera ativo!
        }
    }

    let content = fs::read_to_string(&path).ok()?;
    if content.trim().is_empty() {
        return None;
    }

    let mut state: SquadState = serde_json::from_str(&content).ok()?;
    state.source = "live_game".to_string();
    state.is_connected = true;
    if state.timestamp == 0 {
        state.timestamp = current_timestamp();
    }
    Some(state)
}

/// Retorna estado offline limpo (zero jogadores falsos)
pub fn get_offline_state() -> SquadState {
    SquadState {
        server_name: "Aguardando Project Zomboid".to_string(),
        is_connected: false,
        players: vec![],
        timestamp: current_timestamp(),
        source: "offline".to_string(),
    }
}
