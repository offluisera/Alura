import { Button } from "@alura/ui"
import { ArrowRight, ArrowLeft, Camera, User, Gamepad2, X, Plus, BookOpen, Eye, CheckCircle2, Terminal, Code2, Dumbbell, Music, Plane, HeartHandshake, Search, Check, Tag, MonitorPlay, PenTool } from "lucide-react"
import { useRef, useState } from "react"

// Bancos de dados simulados (mesmos dos outros steps)
const GAMES_DB = [
  { id: "cs2", name: "Counter-Strike 2", genre: "FPS", image: "https://steamcdn-a.akamaihd.net/steam/apps/730/library_600x900.jpg" },
  { id: "gta5", name: "Grand Theft Auto V", genre: "Ação/Aventura", image: "https://steamcdn-a.akamaihd.net/steam/apps/271590/library_600x900.jpg" },
  { id: "rdr2", name: "Red Dead Redemption 2", genre: "Aventura", image: "https://steamcdn-a.akamaihd.net/steam/apps/1174180/library_600x900.jpg" },
  { id: "witcher3", name: "The Witcher 3", genre: "RPG", image: "https://steamcdn-a.akamaihd.net/steam/apps/292030/library_600x900.jpg" },
  { id: "bg3", name: "Baldur's Gate 3", genre: "RPG", image: "https://steamcdn-a.akamaihd.net/steam/apps/1086940/library_600x900.jpg" },
  { id: "cyberpunk", name: "Cyberpunk 2077", genre: "RPG", image: "https://steamcdn-a.akamaihd.net/steam/apps/1091500/library_600x900.jpg" },
  { id: "elden", name: "Elden Ring", genre: "RPG", image: "https://steamcdn-a.akamaihd.net/steam/apps/1245620/library_600x900.jpg" },
  { id: "apex", name: "Apex Legends", genre: "Battle Royale", image: "https://steamcdn-a.akamaihd.net/steam/apps/1172470/library_600x900.jpg" },
  { id: "fc24", name: "EA SPORTS FC 24", genre: "Esportes", image: "https://steamcdn-a.akamaihd.net/steam/apps/2195250/library_600x900.jpg" },
  { id: "tlou", name: "The Last of Us Part I", genre: "Ação/Sobrevivência", image: "https://steamcdn-a.akamaihd.net/steam/apps/1888930/library_600x900.jpg" },
  { id: "overwatch2", name: "Overwatch 2", genre: "Hero Shooter", image: "https://steamcdn-a.akamaihd.net/steam/apps/2356590/library_600x900.jpg" },
  { id: "stardew", name: "Stardew Valley", genre: "Simulação", image: "https://steamcdn-a.akamaihd.net/steam/apps/413150/library_600x900.jpg" },
  { id: "hollow", name: "Hollow Knight", genre: "Metroidvania", image: "https://steamcdn-a.akamaihd.net/steam/apps/367520/library_600x900.jpg" },
  { id: "terraria", name: "Terraria", genre: "Sandbox", image: "https://steamcdn-a.akamaihd.net/steam/apps/105600/library_600x900.jpg" },
  { id: "forza", name: "Forza Horizon 5", genre: "Corrida", image: "https://steamcdn-a.akamaihd.net/steam/apps/1551360/library_600x900.jpg" }
]

const HOBBIES_DB = [
  { id: "dev", name: "Programação", icon: Code2 },
  { id: "gym", name: "Academia", icon: Dumbbell },
  { id: "football", name: "Futebol", icon: Dumbbell },
  { id: "music", name: "Música", icon: Music },
  { id: "travel", name: "Viagens", icon: Plane },
  { id: "cooking", name: "Culinária", icon: BookOpen },
  { id: "reading", name: "Leitura", icon: BookOpen },
  { id: "photo", name: "Fotografia", icon: Camera },
  { id: "painting", name: "Pintura", icon: User },
  { id: "hiking", name: "Trilhas", icon: Plane },
  { id: "yoga", name: "Yoga", icon: Dumbbell },
  { id: "dance", name: "Dança", icon: Music },
  { id: "chess", name: "Xadrez", icon: Gamepad2 },
  { id: "cycling", name: "Ciclismo", icon: Dumbbell },
  { id: '18', name: 'Zelda: Tears of the Kingdom', image: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg' },
  { id: "boardgames", name: "Jogos", icon: Gamepad2 },
  { id: "movies", name: "Filmes", icon: Eye }
]

export const AVAILABLE_TAGS = [
  { id: 'programmer', label: 'Programador', icon: Terminal },
  { id: 'gamer', label: 'Gamer', icon: Gamepad2 },
  { id: 'learning', label: 'Sempre aprendendo', icon: Code2 },
  { id: 'designer', label: 'Designer', icon: PenTool },
  { id: 'streamer', label: 'Streamer', icon: MonitorPlay },
  { id: 'music', label: 'Músico', icon: Music },
]

export const PRESET_BANNERS = [
  { id: "forest", name: "Alura Forest", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80" },
  { id: "synth", name: "Cyber Synth", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80" },
  { id: "deepspace", name: "Deep Space", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80" },
  { id: "aurora", name: "Dark Aurora", url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80" }
]

export function StepProfile({ data, updateData, onNext, onBack }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const [isGameModalOpen, setIsGameModalOpen] = useState(false)
  const [gameSearch, setGameSearch] = useState("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      const isVideo = file.type.startsWith('video/')
      updateData({ avatar: url, avatarFile: file, avatarIsVideo: isVideo })
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      updateData({ banner: url, bannerUrl: url, bannerFile: file })
    }
  }

  // Fallback default avatar se não tiver feito upload
  const avatarImage = data.avatar || "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=256"
  
  // Formatando @username do fullName
  const username = data.fullName 
    ? `@${data.fullName.toLowerCase().replace(/\s+/g, '')}` 
    : "@usuario"

  // Pegando jogos selecionados
  const userGames = GAMES_DB.filter(g => (data.favoriteGames || []).includes(g.id))
  // Pegando hobbies selecionados
  const userHobbies = HOBBIES_DB.filter(h => (data.hobbies || []).includes(h.id))

  // Removendo um jogo diretamente dessa tela
  const removeGame = (id: string) => {
    updateData({ favoriteGames: data.favoriteGames.filter((g: string) => g !== id) })
  }
  
  // Adicionando ou removendo jogo no modal
  const toggleGame = (id: string) => {
    const currentGames = data.favoriteGames || []
    const isSelected = currentGames.includes(id)
    if (isSelected) {
      updateData({ favoriteGames: currentGames.filter((g: string) => g !== id) })
    } else {
      if (currentGames.length < 6) {
        updateData({ favoriteGames: [...currentGames, id] })
      }
    }
  }

  // Toggle tag
  const toggleTag = (id: string) => {
    const currentTags = data.tags || []
    if (currentTags.includes(id)) {
      updateData({ tags: currentTags.filter((t: string) => t !== id) })
    } else {
      if (currentTags.length < 4) {
        updateData({ tags: [...currentTags, id] })
      }
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full relative w-full">
      
      {/* PAINEL ESQUERDO: Formulário */}
      <div className="flex-1 flex flex-col min-w-0 pr-2 pb-4">
        
        {/* Header */}
        <div className="flex items-start space-x-4 mb-8">
          <div className="w-[42px] h-[42px] rounded-full border border-alura-accent/40 flex items-center justify-center bg-alura-accent/10 shrink-0">
            <User className="w-6 h-6 text-alura-accent" />
          </div>
          <div className="mt-1">
            <h2 className="text-2xl font-bold text-alura-textPrimary tracking-wide">Perfil</h2>
            <p className="text-alura-textSecondary text-sm mt-1.5 leading-relaxed max-w-xl">
              Agora vamos personalizar seu perfil! Adicione uma foto, conte um pouco sobre você e escolha<br/>
              o que te representa.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          
          {/* FOTO DE PERFIL */}
          <div className="pb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-alura-surface2 border border-alura-border flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-alura-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-alura-textPrimary">Foto de perfil</h3>
                <p className="text-sm text-alura-textMuted">Adicione uma foto que te represente. Pode ser uma foto real ou seu avatar.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 ml-11">
              <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-b from-alura-accent to-alura-accent/30 shadow-[0_0_15px_rgba(57,255,136,0.15)]">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-alura-background">
                  {data.avatarIsVideo ? (
                    <video src={avatarImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-alura-surface1 border border-alura-accent rounded-full flex items-center justify-center">
                  <Camera className="w-3 h-3 text-alura-accent" />
                </div>
              </div>
              <div>
                <input 
                  type="file" 
                  accept="image/*,video/mp4,video/webm" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline" 
                  className="h-10 px-4 bg-transparent border-alura-border text-alura-textSecondary text-sm font-semibold rounded-lg hover:bg-alura-surface2 hover:text-alura-textPrimary mb-2"
                >
                  <Camera className="w-4 h-4 mr-2" /> Alterar foto
                </Button>
                <p className="text-alura-textMuted text-xs">JPG, PNG, GIF ou MP4. Máx. 10MB.</p>
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-alura-border mb-8"></div>

          {/* BANNER DO PERFIL */}
          <div className="pb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-alura-surface2 border border-alura-border flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-alura-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-alura-textPrimary">Banner de fundo</h3>
                <p className="text-sm text-alura-textMuted">Escolha um estilo para o topo do seu perfil ou envie seu banner personalizado.</p>
              </div>
            </div>

            <div className="ml-11 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_BANNERS.map((preset) => {
                  const currentBanner = data.banner || data.bannerUrl || PRESET_BANNERS[0].url
                  const isSelected = currentBanner === preset.url
                  return (
                    <div
                      key={preset.id}
                      onClick={() => updateData({ banner: preset.url, bannerUrl: preset.url, bannerFile: null })}
                      className={`relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                        isSelected 
                          ? "border-alura-accent ring-2 ring-alura-accent/30 scale-[1.02]" 
                          : "border-alura-border hover:border-alura-accent/50 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                        <span className="text-[11px] font-semibold text-white truncate">{preset.name}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-alura-accent flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#0B0D0F]" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={bannerInputRef} 
                  onChange={handleBannerUpload} 
                  className="hidden" 
                />
                <Button 
                  onClick={() => bannerInputRef.current?.click()}
                  variant="outline" 
                  className="h-10 px-4 bg-transparent border-alura-border text-alura-textSecondary text-sm font-semibold rounded-lg hover:bg-alura-surface2 hover:text-alura-textPrimary"
                >
                  <Camera className="w-4 h-4 mr-2" /> Carregar banner próprio
                </Button>
                <span className="text-alura-textMuted text-xs ml-3">JPG, PNG ou WebP. Proporção recomendada 16:9.</span>
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-alura-border mb-8"></div>

          {/* BIOGRAFIA */}
          <div className="pb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-alura-surface2 border border-alura-border flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-alura-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-alura-textPrimary">Biografia</h3>
                <p className="text-sm text-alura-textMuted">Conte um pouco sobre você. O que te define? O que você gosta de fazer?</p>
              </div>
            </div>
            
            <div className="ml-11">
              <div className="relative">
                <textarea 
                  className="w-full h-32 bg-alura-surface1 border border-alura-border rounded-lg p-4 text-alura-textPrimary text-sm resize-none focus:outline-none focus:border-alura-accent transition-colors placeholder:text-alura-textMuted"
                  placeholder="Ex: Sou apaixonado por tecnologia, jogos e boa companhia.&#10;Sempre em busca de novos desafios!"
                  value={data.bio || ""}
                  onChange={(e) => updateData({bio: e.target.value.slice(0, 200)})}
                />
                <div className="absolute bottom-3 right-4">
                  <span className="text-alura-accent text-xs">{(data.bio || "").length}/200</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] w-full bg-alura-border mb-8"></div>

          {/* JOGOS FAVORITOS */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-alura-surface2 border border-alura-border flex items-center justify-center shrink-0">
                <Gamepad2 className="w-4 h-4 text-alura-accent" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-alura-textPrimary">Jogos favoritos</h3>
                <p className="text-sm text-alura-textMuted">Sua seleção atual de jogos.</p>
              </div>
            </div>
            
            <div className="ml-11 flex flex-wrap gap-4">
              {userGames.map((game) => (
                <div key={game.id} className="relative w-[90px] flex flex-col">
                  <div className="w-full h-[120px] rounded-lg border border-alura-accent/50 bg-alura-surface1 overflow-hidden group cursor-pointer relative shadow-[0_0_10px_rgba(57,255,136,0.1)]">
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <button 
                      onClick={() => removeGame(game.id)}
                      className="absolute top-1.5 right-1.5 w-5 h-5 bg-alura-background/80 border border-alura-accent rounded-full flex items-center justify-center hover:bg-alura-accent hover:text-[#0B0D0F] text-alura-accent transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs text-alura-textSecondary mt-2 truncate text-center">{game.name}</span>
                </div>
              ))}
              {/* Se tiver menos de 6, exibe placeholder */}
              {userGames.length < 6 && (
                <div className="relative w-[90px] flex flex-col">
                  <div 
                    onClick={() => setIsGameModalOpen(true)}
                    className="w-full h-[120px] rounded-lg border-2 border-dashed border-alura-border bg-alura-surface1/30 flex flex-col items-center justify-center cursor-pointer hover:border-alura-accent hover:bg-alura-surface1 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full border border-alura-accent flex items-center justify-center mb-2 group-hover:bg-alura-accent">
                      <Plus className="w-4 h-4 text-alura-accent group-hover:text-[#0B0D0F] transition-colors" />
                    </div>
                    <span className="text-[10px] text-alura-textMuted group-hover:text-alura-accent transition-colors">Mais jogos</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags (novo) */}
          <div className="pt-6 mt-6 border-t border-alura-border flex flex-col w-full shrink-0 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-alura-surface2 border border-alura-border flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-alura-accent" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-alura-textPrimary">Tags de perfil</h3>
                  <p className="text-sm text-alura-textMuted">Como você se define?</p>
                </div>
              </div>
              <span className="text-xs text-alura-textMuted">
                {(data.tags || []).length}/4
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 ml-11">
              {AVAILABLE_TAGS.map(tag => {
                const Icon = tag.icon;
                const isSelected = (data.tags || []).includes(tag.id);
                return (
                  <div 
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 flex items-center space-x-1.5 border transition-all ${
                      isSelected 
                      ? 'bg-alura-accent/15 border-alura-accent text-alura-accent' 
                      : 'bg-alura-surface2 border-alura-border text-alura-textSecondary hover:border-alura-accent hover:text-alura-accent'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="text-xs font-bold uppercase tracking-wider">{tag.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Footer (Esquerda) */}
        <div className="pt-6 border-t border-alura-border flex justify-between shrink-0">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="h-10 px-4 bg-transparent border-alura-border text-alura-textSecondary text-sm font-semibold rounded-lg hover:bg-alura-surface2 hover:text-alura-textPrimary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <Button 
            onClick={onNext} 
            className="h-10 px-5 bg-alura-accent text-[#0B0D0F] text-sm font-semibold rounded-lg hover:bg-alura-accentHover"
          >
            Salvar e continuar <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* PAINEL DIREITO: Prévia do Perfil */}
      <div className="w-full lg:w-[350px] shrink-0 bg-alura-surface1 border border-alura-border rounded-xl p-5 flex flex-col h-fit">
        
        {/* Título Prévia */}
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="w-4 h-4 text-alura-accent" />
          <h3 className="text-sm font-bold text-alura-textPrimary">Prévia do seu perfil</h3>
        </div>

        {/* Conteúdo da Prévia */}
        <div className="flex flex-col relative w-full h-full">
          {/* Banner */}
          <div className="w-full h-24 rounded-t-xl overflow-hidden relative">
            <img 
              src={data.banner || data.bannerUrl || PRESET_BANNERS[0].url} 
              alt="Banner" 
              className="w-full h-full object-cover transition-all duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-alura-surface1"></div>
          </div>

          {/* Avatar sobreposto */}
          <div className="px-5 relative mt-[-35px]">
            <div className="relative inline-block">
              <div className="w-[72px] h-[72px] rounded-full border-2 border-alura-accent overflow-hidden bg-alura-surface1 p-0.5">
                {data.avatarIsVideo ? (
                  <video src={avatarImage} autoPlay loop muted playsInline className="w-full h-full object-cover rounded-full" />
                ) : (
                  <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                )}
              </div>
              <div className="absolute bottom-1 right-0 w-4 h-4 bg-alura-accent border-[2px] border-alura-surface1 rounded-full"></div>
            </div>

            {/* Nome e Tags */}
            <div className="mt-3">
              <div className="flex items-center space-x-1.5">
                <h4 className="text-lg font-bold text-alura-textPrimary">{username}</h4>
                <CheckCircle2 className="w-4 h-4 text-alura-accent" />
              </div>
              <p className="text-alura-accent text-xs mt-1 font-medium truncate">{data.bio || "Em busca de grandes aventuras!"}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {(data.tags || []).map((tagId: string) => {
                  const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                  if (!tag) return null;
                  const Icon = tag.icon;
                  return (
                    <div key={tag.id} className="bg-alura-accent/15 border border-alura-accent/30 rounded-full px-2.5 py-1 flex items-center space-x-1">
                      <Icon className="w-3 h-3 text-alura-accent" />
                      <span className="text-alura-accent text-[10px] font-bold uppercase tracking-wider">{tag.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-alura-border text-center relative">
              <div>
                <p className="text-alura-textPrimary text-lg font-bold">{userGames.length}</p>
                <p className="text-alura-textMuted text-xs mt-0.5">Jogos</p>
              </div>
              {/* Divider vertical sutil */}
              <div className="absolute left-1/3 top-5 bottom-0 w-[1px] bg-alura-border"></div>
              
              <div>
                <p className="text-alura-textPrimary text-lg font-bold">{userHobbies.length}</p>
                <p className="text-alura-textMuted text-xs mt-0.5">Hobbies</p>
              </div>
              {/* Divider vertical sutil */}
              <div className="absolute left-2/3 top-5 bottom-0 w-[1px] bg-alura-border"></div>
              
              <div>
                <p className="text-alura-textPrimary text-lg font-bold">0</p>
                <p className="text-alura-textMuted text-xs mt-0.5">Seguidores</p>
              </div>
            </div>

            {/* Preview Jogos */}
            <div className="mt-6">
              <h5 className="text-xs font-semibold text-alura-textPrimary mb-3">Jogos favoritos</h5>
              <div className="flex gap-2">
                {userGames.slice(0, 4).map((game) => (
                  <div key={game.id} className="w-[52px] h-[70px] rounded-md border border-alura-border overflow-hidden bg-alura-surface2">
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover opacity-90" />
                  </div>
                ))}
                {userGames.length === 0 && <span className="text-xs text-alura-textMuted">Nenhum jogo selecionado.</span>}
              </div>
            </div>

            {/* Preview Hobbies */}
            <div className="mt-6">
              <h5 className="text-xs font-semibold text-alura-textPrimary mb-3">Hobbies</h5>
              <div className="flex flex-wrap gap-4">
                {userHobbies.slice(0, 4).map(hobby => {
                  const Icon = hobby.icon || Code2
                  return (
                    <div key={hobby.id} className="flex flex-col items-center">
                      <div className="w-[36px] h-[36px] rounded-full border border-alura-border flex items-center justify-center bg-alura-surface2 mb-1.5">
                        <Icon className="w-4 h-4 text-alura-accent" />
                      </div>
                      <span className="text-[10px] text-alura-textMuted">{hobby.name}</span>
                    </div>
                  )
                })}
                {userHobbies.length === 0 && <span className="text-xs text-alura-textMuted">Nenhum hobby selecionado.</span>}
              </div>
            </div>

            {/* Mensagem Inferior */}
            <div className="mt-7 flex items-center justify-center space-x-2 bg-alura-surface2/60 rounded-lg py-3 px-4 border border-alura-border">
              <HeartHandshake className="w-4 h-4 text-alura-accent" />
              <p className="text-xs text-alura-textSecondary">Grandes jornadas começam com um bom time. 🧑‍🚀</p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Modal de Jogos */}
      {isGameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-alura-surface1 border border-alura-border rounded-xl w-full max-w-3xl flex flex-col max-h-[85vh] shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-alura-border shrink-0">
              <h3 className="text-xl font-bold text-alura-textPrimary">Adicionar Jogos</h3>
              <button onClick={() => setIsGameModalOpen(false)} className="text-alura-textMuted hover:text-alura-accent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto flex flex-col min-h-0">
              <div className="relative mb-6 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-alura-textMuted" />
                <input 
                  type="text" 
                  placeholder="Buscar jogos..." 
                  value={gameSearch}
                  onChange={(e) => setGameSearch(e.target.value)}
                  className="w-full pl-9 pr-3 h-11 bg-alura-surface2 border border-alura-border rounded-lg text-sm text-alura-textPrimary focus:border-alura-accent focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 overflow-y-auto pr-2">
                {GAMES_DB.filter(g => g.name.toLowerCase().includes(gameSearch.toLowerCase())).map(game => {
                  const selected = (data.favoriteGames || []).includes(game.id)
                  return (
                    <div 
                      key={game.id} 
                      onClick={() => toggleGame(game.id)}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group aspect-[3/4] ${
                        selected ? 'border-alura-accent bg-alura-selected' : 'border-alura-border hover:border-alura-accent/50'
                      }`}
                    >
                      <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {selected && (
                        <div className="absolute inset-0 bg-alura-background/70 flex items-center justify-center backdrop-blur-[2px]">
                          <div className="bg-alura-accent rounded-full p-1.5"><Check className="w-4 h-4 text-[#0B0D0F]" /></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-alura-border flex justify-between items-center shrink-0 bg-alura-surface2 rounded-b-xl">
              <span className={`text-sm font-medium ${(data.favoriteGames || []).length === 6 ? 'text-alura-accent' : 'text-alura-textMuted'}`}>
                {(data.favoriteGames || []).length} de 6 selecionados
              </span>
              <Button onClick={() => setIsGameModalOpen(false)} className="bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover">
                Concluir seleção
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
