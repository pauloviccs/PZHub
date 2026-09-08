/**
 * PZHub - Tactical Live Radar & Operations Suite
 * Módulo Nativo de Auto-Atualização e Download de Patch (Tauri v2 + Rust)
 */

use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use std::time::Duration;
use tauri::{AppHandle, Emitter};
use futures_util::StreamExt;

#[derive(Clone, serde::Serialize)]
pub struct UpdateProgress {
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub percentage: f32,
}

/// Normaliza links para garantir download binário direto (.exe)
fn normalize_installer_url(url: &str) -> String {
    let mut clean = url.trim().to_string();

    // Dropbox: força dl=1
    if clean.contains("dropbox.com") {
        if clean.contains("dl=0") {
            clean = clean.replace("dl=0", "dl=1");
        } else if !clean.contains("dl=1") {
            if clean.contains('?') {
                clean.push_str("&dl=1");
            } else {
                clean.push_str("?dl=1");
            }
        }
    }

    // Google Drive: converte /file/d/ID/view para download direto
    if clean.contains("drive.google.com") && clean.contains("/file/d/") {
        if let Some(start) = clean.find("/file/d/") {
            let sub = &clean[start + 8..];
            if let Some(end) = sub.find('/') {
                let id = &sub[..end];
                clean = format!("https://drive.google.com/uc?export=download&id={}", id);
            }
        }
    }

    clean
}

#[tauri::command]
pub async fn fetch_update_manifest(manifest_url: String) -> Result<serde_json::Value, String> {
    let mut clean_url = manifest_url.trim().to_string();
    if clean_url.contains("pastebin.com/") && !clean_url.contains("pastebin.com/raw/") {
        clean_url = clean_url.replace("pastebin.com/", "pastebin.com/raw/");
    }

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .user_agent("PZHub-Desktop-Updater/2.0")
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| format!("Falha ao inicializar cliente HTTP: {}", e))?;

    let res = client.get(&clean_url)
        .send()
        .await
        .map_err(|e| format!("Falha ao conectar no manifesto: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("Servidor retornou status HTTP: {}", res.status()));
    }

    let text = res.text().await.map_err(|e| format!("Falha ao ler dados: {}", e))?;
    let json: serde_json::Value = serde_json::from_str(&text)
        .map_err(|e| format!("Estrutura JSON inválida: {}", e))?;

    Ok(json)
}

#[tauri::command]
pub async fn download_and_run_installer(
    app: AppHandle,
    installer_url: String,
) -> Result<String, String> {
    let temp_dir = std::env::temp_dir();
    let installer_path: PathBuf = temp_dir.join("PZHub_Update_Setup.exe");

    let direct_url = normalize_installer_url(&installer_url);

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(300)) // 5 minutos de tolerância para conexões lentas
        .user_agent("PZHub-Desktop-Updater/2.0")
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| format!("Falha ao inicializar cliente HTTP: {}", e))?;

    let res = client.get(&direct_url)
        .send()
        .await
        .map_err(|e| format!("Falha ao conectar no servidor de release: {}", e))?;

    if !res.status().is_success() {
        return Err(format!("Servidor retornou erro HTTP: {}", res.status()));
    }

    let total_size = res.content_length().unwrap_or(0);

    // Cria o arquivo temporário
    let mut file = File::create(&installer_path)
        .map_err(|e| format!("Erro ao criar arquivo temporário do instalador: {}", e))?;

    let mut stream = res.bytes_stream();
    let mut downloaded: u64 = 0;
    let mut last_emitted_percent = -1;

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| format!("Falha no streaming do instalador: {}", e))?;
        file.write_all(&chunk)
            .map_err(|e| format!("Erro ao gravar dados no disco: {}", e))?;

        downloaded += chunk.len() as u64;

        let percentage = if total_size > 0 {
            (downloaded as f32 / total_size as f32) * 100.0
        } else {
            0.0
        };

        let current_int_percent = percentage.floor() as i32;
        if current_int_percent != last_emitted_percent {
            last_emitted_percent = current_int_percent;
            let _ = app.emit("updater-progress", UpdateProgress {
                downloaded_bytes: downloaded,
                total_bytes: total_size,
                percentage,
            });
        }
    }

    file.flush().map_err(|e| format!("Erro ao finalizar gravação do arquivo: {}", e))?;
    drop(file); // Garante fechamento do handle do arquivo antes de executar

    // Dispara o instalador NSIS desanexado do processo
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NEW_PROCESS_GROUP: u32 = 0x00000200;
        const DETACHED_PROCESS: u32 = 0x00000008;

        let mut cmd = std::process::Command::new(&installer_path);
        cmd.creation_flags(CREATE_NEW_PROCESS_GROUP | DETACHED_PROCESS);

        cmd.spawn()
            .map_err(|e| format!("Falha ao iniciar o instalador: {}", e))?;

        // Aguarda 400ms para o processo do instalador engatar e fecha o PZHub antigo
        tokio::time::sleep(Duration::from_millis(400)).await;
        std::process::exit(0);
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Download concluído. Em plataformas não-Windows, execute o instalador manualmente.".into())
    }
}
