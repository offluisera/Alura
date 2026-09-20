/**
 * preload-call.js — Janela de chamada recebida (incoming-call.html)
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronIPC', {
  send: (channel, data) => {
    const allowed = ['call-action', 'close-call-window']
    if (allowed.includes(channel)) ipcRenderer.send(channel, data)
  },

  on: (channel, callback) => {
    const allowed = ['incoming-call-data']
    if (!allowed.includes(channel)) return () => {}
    const wrapped = (_event, ...args) => callback(...args)
    ipcRenderer.on(channel, wrapped)
    return () => ipcRenderer.removeListener(channel, wrapped)
  },

  once: (channel, callback) => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args))
  },

  isElectron: () => true,
})
