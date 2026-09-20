/**
 * preload.js — Alura Desktop
 * Expõe IPC de forma segura para o renderer, sem depender de window.require
 * no bundle de produção.
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronIPC', {
  // ── Chamadas unidirecionais ────────────────────────────────────────────────
  send: (channel, data) => {
    const allowed = [
      'show-incoming-call',
      'call-action',
      'close-call-window',
      'show-custom-notification',
    ]
    if (allowed.includes(channel)) ipcRenderer.send(channel, data)
  },

  // ── Chamadas bidirecionais (com resposta) ──────────────────────────────────
  invoke: async (channel, ...args) => {
    const allowed = ['get-screen-sources']
    if (allowed.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args)
    }
    return null
  },

  on: (channel, callback) => {
    const allowed = [
      'incoming-call-data',
      'call-action-from-native',
      'execute-notification-click',
    ]
    if (!allowed.includes(channel)) return () => {}
    const wrapped = (_event, ...args) => callback(...args)
    ipcRenderer.on(channel, wrapped)
    return () => ipcRenderer.removeListener(channel, wrapped)
  },

  once: (channel, callback) => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args))
  },

  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },

  // ── Utilidade ───────────────────────────────────────────────────────────────
  isElectron: () => true,
})
