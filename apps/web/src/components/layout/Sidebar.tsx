import { useState, useEffect } from "react"
import { Home, MessageSquare, Server, Settings, UserPlus, Users, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import logoUrl from '../../../public/logo-sombra.png'
import { useNotification } from '../../contexts/NotificationContext'
import { UserPanel } from './UserPanel'

export function Sidebar({ user, profile }: { user?: any, profile?: any }) {
  const { unreadDMCount } = useNotification()

  return (
    <aside className="w-[280px] h-full flex flex-col bg-alura-navigation z-20 border-r border-alura-border">
      
      {/* Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-alura-border/40">
        <img 
          src={logoUrl} 
          alt="Alura" 
          className="w-10 h-10 object-contain transition-all duration-300" 
          style={{ filter: "var(--theme-logo-filter)" }}
        />
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 custom-scrollbar">
        <NavItem icon={<Home />} label="Início" to="/" />
        <NavItem icon={<Users />} label="Amigos" to="/friends" />
        <NavItem icon={<User />} label="Perfil" to="/profile" />
        <NavItem icon={<UserPlus />} label="Solicitações" to="/requests" />
        <NavItem icon={<MessageSquare />} label="Mensagens" to="/messages" badge={unreadDMCount > 0 ? unreadDMCount.toString() : undefined} />
        
        <div className="py-2" />
        
        <NavItem icon={<Server />} label="Servidores" to="/servers" />
        <NavItem icon={<Settings />} label="Configurações" to="/settings" />
      </nav>

      {user && profile && <UserPanel user={user} profile={profile} />}
    </aside>
  )
}

function NavItem({ icon, label, badge, to }: { icon: React.ReactNode, label: string, badge?: string, to: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex items-center justify-between px-3 h-10 rounded-[10px] transition-all group ${
        isActive && to !== '#'
          ? "bg-alura-selected text-alura-textPrimary border border-alura-borderStrong shadow-[0_0_10px_rgba(0,223,160,0.1)]" 
          : "text-alura-textSecondary hover:bg-alura-hover hover:text-alura-textPrimary border border-transparent"
      }`}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center space-x-3">
            <div className={`[&>svg]:w-5 [&>svg]:h-5 transition-colors ${isActive && to !== '#' ? "text-alura-accent drop-shadow-[0_0_5px_rgba(0,223,160,0.5)]" : "text-alura-textMuted group-hover:text-alura-textPrimary"}`}>
              {icon}
            </div>
            <span className="font-medium text-[15px]">{label}</span>
          </div>
          
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isActive && to !== '#'
                ? "bg-alura-hover text-alura-textPrimary" 
                : "bg-alura-surface1 text-alura-textSecondary"
            }`}>
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
