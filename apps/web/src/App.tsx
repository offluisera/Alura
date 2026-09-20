import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Login } from "./pages/auth/Login"
import { Dashboard } from "./pages/app/Dashboard"
import { Home } from "./pages/app/Home"
import { Friends } from "./pages/app/Friends"
import { Requests } from "./pages/app/Requests"
import { DirectMessage } from "./pages/app/DirectMessage"
import { MessagesLayout } from "./pages/app/MessagesLayout"
import { Profile } from "./pages/app/Profile"
import { Settings as SettingsPage } from "./pages/app/Settings"
import { NotificationProvider } from "./contexts/NotificationContext"
import { ErrorBoundary } from "./components/common/ErrorBoundary"

export default function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />}>
              <Route index element={<Home />} />
              <Route path="friends" element={<Friends />} />
              <Route path="requests" element={<Requests />} />
              <Route path="messages" element={<MessagesLayout />}>
                <Route index element={
                  <div className="flex-1 flex flex-col items-center justify-center text-alura-textMuted bg-[#000808]">
                    <h3 className="text-xl font-bold text-alura-textPrimary">Nenhuma conversa selecionada</h3>
                    <p className="text-sm mt-2">Escolha uma conversa na barra lateral para começar a enviar mensagens.</p>
                  </div>
                } />
                <Route path=":otherUserId" element={<DirectMessage />} />
              </Route>
              <Route path="servers" element={<Friends />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:targetUserId" element={<Profile />} />
              <Route path="settings" element={
                <ErrorBoundary fallbackTitle="Erro ao carregar Configurações">
                  <SettingsPage />
                </ErrorBoundary>
              } />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ErrorBoundary>
  )
}
