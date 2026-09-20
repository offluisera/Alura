import { Button, Input } from "@alura/ui"
import { ArrowRight, ArrowLeft, Search, Check } from "lucide-react"
import { useState } from "react"

// Usando o CDN da Steam que sempre permite hotlinking
export const GAMES_DB = [
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

export function StepGames({ data, updateData, onNext, onBack }: any) {
  const [search, setSearch] = useState("")
  
  const toggleGame = (id: string) => {
    const isSelected = data.favoriteGames.includes(id)
    if (isSelected) {
      updateData({ favoriteGames: data.favoriteGames.filter((g: string) => g !== id) })
    } else {
      if (data.favoriteGames.length < 6) {
        updateData({ favoriteGames: [...data.favoriteGames, id] })
      }
    }
  }

  const filtered = GAMES_DB.filter(g => g.name.toLowerCase().includes(search.toLowerCase()))
  const isValid = data.favoriteGames.length >= 3 && data.favoriteGames.length <= 6
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-3xl font-bold mb-2 text-alura-textPrimary">Jogos Favoritos</h2>
        <p className="text-alura-textMuted mb-6 text-sm">Selecione os jogos que você mais gosta de jogar. Isso nos ajuda a conectar você com pessoas que têm os mesmos interesses!</p>
        
        <div className="relative mb-6 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted" />
          <Input 
            placeholder="Buscar jogos..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-alura-surface2 border-alura-border h-12 text-alura-textPrimary placeholder:text-alura-textMuted focus:border-alura-accent"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(game => {
              const selected = data.favoriteGames.includes(game.id)
              return (
                <div 
                  key={game.id} 
                  onClick={() => toggleGame(game.id)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 group ${
                    selected ? 'border-alura-accent bg-alura-selected shadow-[0_0_15px_rgba(57,255,136,0.15)] scale-[0.98]' : 'border-alura-border bg-alura-surface1 hover:border-alura-accent/50 hover:bg-alura-surface2'
                  }`}
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-alura-surface3">
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  {selected && (
                    <div className="absolute inset-0 bg-alura-background/70 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="bg-alura-accent text-[#0B0D0F] p-2 rounded-full shadow-[0_0_10px_rgba(57,255,136,0.3)]">
                        <Check className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-alura-background to-transparent">
                    <p className="font-semibold text-alura-textPrimary text-sm truncate leading-tight">{game.name}</p>
                    <p className="text-alura-accent text-[10px] uppercase font-bold tracking-wider mt-1">{game.genre}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="text-center py-2 shrink-0">
          <span className={`text-sm font-medium ${isValid ? 'text-alura-accent' : 'text-alura-textMuted'}`}>
            {data.favoriteGames.length} de 6 selecionados {data.favoriteGames.length < 3 && '(mínimo 3)'}
          </span>
        </div>
      </div>
      
      <div className="pt-6 border-t border-alura-border flex justify-between shrink-0">
        <Button variant="outline" onClick={onBack} className="border-alura-border text-alura-textSecondary hover:bg-alura-surface2 hover:text-alura-textPrimary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!isValid} className="bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover disabled:opacity-50">
          Salvar e continuar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
