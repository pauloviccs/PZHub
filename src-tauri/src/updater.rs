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

/// Normaliza URLs de manifestos de atualização para links diretos (RAW)
pub fn normalize_manifest_url(url: &str) -> String {
    let mut clean = url.trim().to_string();

    // GitHub: Converte link de visualização web do GitHub (blob) para raw.githubusercontent.com
    if clean.contains("github.com/") && clean.contains("/blob/") {
        clean = clean
            .replace("github.com/", "raw.githubusercontent.com/")
            .replace("/blob/", "/");
    }

    // Pastebin: Suporte a fallback secundário para links normais do Pastebin
    if clean.contains("pastebin.com/") && !clean.contains("pastebin.com/raw/") {
        clean = clean.replace("pastebin.com/", "pastebin.com/raw/");
    }

    clean
}

#[tauri::command]
pub async fn fetch_update_manifest(manifest_url: String) -> Result<serde_json::Value, String> {
    let mut clean_url = normalize_manifest_url(&manifest_url);

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(15))
        .user_agent("PZHub-Desktop-Updater/2.1")
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| format!("Falha ao inicializar cliente HTTP nativo: {}", e))?;

    let mut res = client.get(&clean_url)
        .send()
        .await
        .map_err(|e| format!("Falha ao conectar no manifesto remoto ({}): {}", clean_url, e))?;

    // Auto-fallback resiliente entre branches master e main caso uma delas retorne 404
    if res.status().as_u16() == 404 {
        let alt_url = if clean_url.contains("/main/") {
            Some(clean_url.replace("/main/", "/master/"))
        } else if clean_url.contains("/master/") {
            Some(clean_url.replace("/master/", "/main/"))
        } else {
            None
        };

        if let Some(ref fallback_url) = alt_url {
            if let Ok(alt_res) = client.get(fallback_url).send().await {
                if alt_res.status().is_success() {
                    res = alt_res;
                    clean_url = fallback_url.clone();
                }
            }
        }
    }

    let status = res.status();
    if !status.is_success() {
        let code = status.as_u16();
        let reason = status.canonical_reason().unwrap_or("Erro desconhecido");
        return Err(format!(
            "Servidor de atualizações retornou erro HTTP {} ({}) ao consultar: {}",
            code, reason, clean_url
        ));
    }

    let text = res.text().await
        .map_err(|e| format!("Falha ao ler dados retornados pelo servidor de atualizações: {}", e))?;

    if text.trim().is_empty() {
        return Err(format!("O servidor retornou uma resposta vazia ao consultar: {}", clean_url));
    }

    let json: serde_json::Value = serde_json::from_str(&text)
        .map_err(|e| {
            let snippet: String = text.chars().take(120).collect();
            format!(
                "O manifesto retornado não é um JSON válido: {} (Início da resposta: '{}')",
                e, snippet.replace('\n', " ").replace('\r', "")
            )
        })?;

    if json.get("version").and_then(|v| v.as_str()).is_none() {
        return Err("Manifesto de atualização inválido: campo 'version' obrigatório não encontrado no JSON.".to_string());
    }

    Ok(json)
}

#[tauri::command]
pub async fn download_and_run_installer(
    app: AppHandle,
    installer_url: String,
) -> Result<String, String> {
    let temp_dir = std::env::temp_dir();
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let installer_path: PathBuf = temp_dir.join(format!("PZHub_Update_Setup_{}.exe", timestamp));

    if installer_path.exists() {
        let _ = std::fs::remove_file(&installer_path);
    }

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

    // Dispara o instalador NSIS desanexado do processo com suporte a elevação UAC no Windows
    #[cfg(target_os = "windows")]
    {
        let installer_str = installer_path.to_string_lossy().to_string();

        // Método 1: Disparo via ShellExecute através do 'cmd /C start "" "path"'
        // O comando 'start' delega para a Shell do Windows, permitindo o prompt UAC de elevação do NSIS
        let spawn_res = std::process::Command::new("cmd")
            .args(["/C", "start", "", &installer_str])
            .spawn();

        let launched = match spawn_res {
            Ok(_) => true,
            Err(e) => {
                eprintln!("[PZHub Native Updater] Falha no cmd /C start: {}. Tentando fallback PowerShell...", e);
                // Método 2: Fallback via PowerShell com -Verb RunAs (garante elevação administrativa)
                let ps_res = std::process::Command::new("powershell")
                    .args([
                        "-NoProfile",
                        "-WindowStyle", "Hidden",
                        "-Command",
                        &format!("Start-Process -FilePath '{}' -Verb RunAs", installer_str.replace('\'', "''"))
                    ])
                    .spawn();

                match ps_res {
                    Ok(_) => true,
                    Err(ps_err) => {
                        return Err(format!("Falha ao iniciar o instalador (cmd: {}, ps: {})", e, ps_err));
                    }
                }
            }
        };

        if launched {
            // Aguarda 1 segundo para garantir que o processo do instalador foi criado pela shell
            tokio::time::sleep(Duration::from_millis(1000)).await;
            // Encerra o PZHub antigo para liberar arquivos bloqueados para a instalação
            std::process::exit(0);
        }

        Ok("Instalador disparado com sucesso.".into())
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Download concluído. Em plataformas não-Windows, execute o instalador manualmente.".into())
    }
}
