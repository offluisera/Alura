import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export interface AppRelease {
  id: string
  version: string
  title: string
  release_notes: string
  download_url: string
  is_mandatory: boolean
  is_active: boolean
  created_at: string
}

export interface DownloadProgress {
  percent: number
  received: number
  total: number
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = (v1 || '0').split('.').map(Number)
  const parts2 = (v2 || '0').split('.').map(Number)
  const len = Math.max(parts1.length, parts2.length)
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] || 0
    const p2 = parts2[i] || 0
    if (p1 > p2) return 1
    if (p1 < p2) return -1
  }
  return 0
}

export function useAutoUpdater() {
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0')
  const [latestRelease, setLatestRelease] = useState<AppRelease | null>(null)
  const [hasUpdate, setHasUpdate] = useState<boolean>(false)
  const [isDismissed, setIsDismissed] = useState<boolean>(false)
  const [isDownloading, setIsDownloading] = useState<boolean>(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({ percent: 0, received: 0, total: 0 })
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false)
  const [downloadedPath, setDownloadedPath] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState<boolean>(false)

  const isElectron = typeof window !== 'undefined' && !!(window as any).electronIPC?.isElectron?.()

  // 1. Obter a versão atual do app Electron
  useEffect(() => {
    async function fetchLocalVersion() {
      if (isElectron) {
        try {
          const ver = await (window as any).electronIPC.invoke('get-app-version')
          if (ver) setCurrentVersion(ver)
        } catch (e) {
          console.warn('[AutoUpdater] Não foi possível ler versão do Electron:', e)
        }
      }
    }
    fetchLocalVersion()
  }, [isElectron])

  // 2. Ouvintes de eventos IPC do Electron
  useEffect(() => {
    if (!isElectron) return

    const ipc = (window as any).electronIPC
    const cleanupProgress = ipc.on('update-download-progress', (progress: DownloadProgress) => {
      setIsDownloading(true)
      setDownloadProgress(progress)
    })

    const cleanupDownloaded = ipc.on('update-downloaded', (data: { filePath: string; version: string }) => {
      setIsDownloading(false)
      setIsDownloaded(true)
      setDownloadedPath(data.filePath)
    })

    const cleanupError = ipc.on('update-error', (data: { message: string }) => {
      setIsDownloading(false)
      setError(data.message || 'Falha ao baixar atualização')
    })

    return () => {
      cleanupProgress?.()
      cleanupDownloaded?.()
      cleanupError?.()
    }
  }, [isElectron])

  // 3. Checagem no Supabase
  const checkForUpdates = useCallback(async () => {
    setIsChecking(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('app_versions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (err) throw err

      if (data) {
        const release = data as AppRelease
        setLatestRelease(release)

        // Se a versão remota for superior à local
        const isNewer = compareVersions(release.version, currentVersion) > 0
        if (isNewer) {
          setHasUpdate(true)

          // Se for mandatório, já pode iniciar o download automaticamente no Electron
          if (release.is_mandatory && isElectron && !isDownloading && !isDownloaded) {
            console.log('[AutoUpdater] Atualização mandatória detectada. Iniciando auto-download...')
            ;(window as any).electronIPC.send('start-update-download', {
              downloadUrl: release.download_url,
              version: release.version,
            })
            setIsDownloading(true)
          }
        } else {
          setHasUpdate(false)
        }
      }
    } catch (err: any) {
      console.error('[AutoUpdater] Erro ao checar atualizações:', err)
      setError(err.message)
    } finally {
      setIsChecking(false)
    }
  }, [currentVersion, isElectron, isDownloading, isDownloaded])

  // Checar ao iniciar e periodicamente (a cada 15 min)
  useEffect(() => {
    checkForUpdates()
    const interval = setInterval(checkForUpdates, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [checkForUpdates])

  // Ações de usuário
  const startDownload = useCallback(() => {
    if (!latestRelease) return
    setError(null)

    if (isElectron) {
      setIsDownloading(true)
      setDownloadProgress({ percent: 0, received: 0, total: 0 })
      ;(window as any).electronIPC.send('start-update-download', {
        downloadUrl: latestRelease.download_url,
        version: latestRelease.version,
      })
    } else {
      // Se for browser web comum, faz download direto pelo link
      window.open(latestRelease.download_url, '_blank')
    }
  }, [latestRelease, isElectron])

  const installUpdate = useCallback(
    async (silent: boolean = false) => {
      if (!isElectron) return
      try {
        await (window as any).electronIPC.invoke('install-update', {
          filePath: downloadedPath,
          silent,
        })
      } catch (err: any) {
        setError(err.message || 'Erro ao iniciar instalador')
      }
    },
    [isElectron, downloadedPath]
  )

  const dismissUpdate = useCallback(() => {
    if (latestRelease?.is_mandatory) return // Não permite dispensar se for mandatório
    setIsDismissed(true)
  }, [latestRelease])

  return {
    currentVersion,
    latestRelease,
    hasUpdate: hasUpdate && !isDismissed,
    isMandatory: latestRelease?.is_mandatory ?? false,
    isDownloading,
    downloadProgress,
    isDownloaded,
    downloadedPath,
    isChecking,
    error,
    isElectron,
    startDownload,
    installUpdate,
    dismissUpdate,
    checkForUpdates,
  }
}
