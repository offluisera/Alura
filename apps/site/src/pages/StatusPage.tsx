import React, { useState } from 'react';
import {
  CheckCircle2,
  Activity,
  Server,
  Radio,
  Database,
  Lock,
  HardDrive,
  Globe,
  Clock,
  Mail,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

interface SystemComponent {
  name: string;
  category: string;
  status: 'operational' | 'degraded' | 'outage';
  statusText: string;
  latency: string;
  uptime: string;
  icon: React.ElementType;
}

const componentsData: SystemComponent[] = [
  {
    name: 'Cluster Phoenix Elixir (BEAM Core)',
    category: 'Sinalização & Realtime',
    status: 'operational',
    statusText: 'Operacional',
    latency: '16ms',
    uptime: '99.99%',
    icon: Server,
  },
  {
    name: 'Engine de Voz & WebRTC Mesh',
    category: 'Mídia & Áudio',
    status: 'operational',
    statusText: 'Operacional',
    latency: '24ms',
    uptime: '99.98%',
    icon: Radio,
  },
  {
    name: 'Banco de Dados PostgreSQL (Supabase)',
    category: 'Dados & Persistência',
    status: 'operational',
    statusText: 'Operacional',
    latency: '28ms',
    uptime: '99.99%',
    icon: Database,
  },
  {
    name: 'Autenticação & Sessões JWT Seguras',
    category: 'Segurança',
    status: 'operational',
    statusText: 'Operacional',
    latency: '18ms',
    uptime: '100%',
    icon: Lock,
  },
  {
    name: 'Storage & CDN de Mídia/Avatares',
    category: 'Armazenamento',
    status: 'operational',
    statusText: 'Operacional',
    latency: '35ms',
    uptime: '99.97%',
    icon: HardDrive,
  },
  {
    name: 'Serviço Web App (app.alura.net.br)',
    category: 'Frontend & Edge',
    status: 'operational',
    statusText: 'Operacional',
    latency: '12ms',
    uptime: '99.99%',
    icon: Globe,
  },
];

export const StatusPage: React.FC = () => {
  return (
    <div className="pt-28 pb-24 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto relative z-10">
      {/* Hero Header limpo sem cápsula */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Status dos Serviços em Tempo Real
        </h1>

        <p className="text-lg sm:text-xl text-white/60 leading-relaxed font-normal">
          Métricas de latência, disponibilidade de canais de voz WebRTC e integridade do cluster da Alura.
        </p>
      </div>

      {/* Banner Principal de Saúde Global */}
      <div className="mb-14 rounded-3xl border border-[var(--color-accent)]/30 bg-gradient-to-r from-[#001B0B] via-[#002A12] to-[#111318] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_0_40px_-15px_rgba(57,255,136,0.2)]">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/15 border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Todos os sistemas operacionais
            </h2>
            <p className="text-sm text-white/60 font-mono">
              99.98% de disponibilidade média nos últimos 90 dias
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10 text-xs font-mono text-[var(--color-accent)]">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping" />
          Atualizado agora mesmo
        </div>
      </div>

      {/* Grade de Componentes */}
      <div className="rounded-3xl border border-white/10 bg-[#111318]/70 backdrop-blur-md overflow-hidden mb-16 shadow-lg">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-[var(--color-accent)]" />
            Integridade dos Nós e Microsserviços
          </h3>
          <span className="text-xs font-mono text-white/40">Status Global</span>
        </div>

        <div className="divide-y divide-white/5">
          {componentsData.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--color-accent)] shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-white">
                      {item.name}
                    </h4>
                    <span className="text-xs font-mono text-white/40">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 text-xs font-mono">
                  <div className="text-right hidden sm:block">
                    <span className="text-white/40 block">Latência</span>
                    <span className="text-white font-medium">{item.latency}</span>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-white/40 block">Uptime</span>
                    <span className="text-white font-medium">{item.uptime}</span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                    {item.statusText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de Uptime (Barras dos 90 Dias) */}
      <div className="rounded-3xl border border-white/10 bg-[#111318]/60 p-6 sm:p-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Histórico de Disponibilidade (Últimos 90 Dias)
            </h3>
            <span className="text-xs text-white/50">
              Zero interrupções não planejadas registradas no período.
            </span>
          </div>
          <span className="text-xs font-mono text-[var(--color-accent)] font-semibold">
            100.0% Operacional
          </span>
        </div>

        {/* Barras de Uptime representativas */}
        <div className="flex items-center gap-[3px] py-2 overflow-hidden">
          {Array.from({ length: 90 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-8 rounded-sm bg-[var(--color-accent)]/80 hover:bg-[var(--color-accent)] hover:scale-110 transition-all cursor-pointer"
              title={`Dia ${90 - i} dias atrás: 100% de disponibilidade`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-white/40 mt-3">
          <span>90 dias atrás</span>
          <span>Hoje</span>
        </div>
      </div>

      {/* Incidentes Recentes */}
      <div className="rounded-3xl border border-white/10 bg-[#111318]/60 p-6 sm:p-8 mb-16">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/50" />
          Registro de Incidentes & Manutenções
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-[var(--color-accent)] font-semibold">
                Manutenção Programada Concluída
              </span>
              <span className="text-xs text-white/40 font-mono">19 de Outubro de 2026</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Migração e orquestração do cluster Phoenix Elixir com Docker em ambiente VPS dedicado. Transições de WebSockets operando com zero interrupção.
            </p>
          </div>

          <p className="text-xs text-white/40 font-mono text-center pt-2">
            Nenhum incidente ativo relatado nas últimas 24 horas.
          </p>
        </div>
      </div>

      {/* Reportar Instabilidade */}
      <div className="rounded-3xl border border-white/10 bg-[#111318]/40 p-8 text-center max-w-xl mx-auto">
        <h3 className="text-lg font-bold text-white mb-2">
          Está enfrentando instabilidade ou perda de pacotes?
        </h3>
        <p className="text-xs text-white/50 mb-6">
          Reporte qualquer anomalia diretamente ao nosso monitoramento para análise imediata de rede.
        </p>
        <a
          href="mailto:suporte@alura.net.br"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--color-accent)] hover:underline"
        >
          <Mail className="w-4 h-4" />
          suporte@alura.net.br
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
