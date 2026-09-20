import { Button, Input } from "@alura/ui"
import { ArrowRight, ArrowLeft, Search, Check } from "lucide-react"
import { useState } from "react"

export const HOBBIES_DB = [
  { id: "dev", name: "Programação", category: "Tecnologia", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80" },
  { id: "gym", name: "Academia", category: "Esportes", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80" },
  { id: "football", name: "Futebol", category: "Esportes", image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80" },
  { id: "music", name: "Música", category: "Artes", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80" },
  { id: "travel", name: "Viagens", category: "Lifestyle", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80" },
  { id: "cooking", name: "Culinária", category: "Gastronomia", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400&q=80" },
  { id: "reading", name: "Leitura", category: "Lifestyle", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80" },
  { id: "photo", name: "Fotografia", category: "Artes", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80" },
  { id: "painting", name: "Pintura", category: "Artes", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80" },
  { id: "hiking", name: "Trilhas", category: "Esportes", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=400&q=80" },
  { id: "yoga", name: "Yoga", category: "Esportes", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80" },
  { id: "dance", name: "Dança", category: "Artes", image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=400&q=80" },
  { id: "chess", name: "Xadrez", category: "Jogos", image: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?auto=format&fit=crop&w=400&q=80" },
  { id: "cycling", name: "Ciclismo", category: "Esportes", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80" },
  { id: "boardgames", name: "Jogos de Tabuleiro", category: "Jogos", image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?auto=format&fit=crop&w=400&q=80" },
  { id: "movies", name: "Filmes e Séries", category: "Lifestyle", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80" }
]

export function StepHobbies({ data, updateData, onNext, onBack }: any) {
  const [search, setSearch] = useState("")
  
  const toggleHobby = (id: string) => {
    const isSelected = data.hobbies.includes(id)
    if (isSelected) {
      updateData({ hobbies: data.hobbies.filter((h: string) => h !== id) })
    } else {
      if (data.hobbies.length < 12) {
        updateData({ hobbies: [...data.hobbies, id] })
      }
    }
  }

  const filtered = HOBBIES_DB.filter(h => h.name.toLowerCase().includes(search.toLowerCase()))
  const isValid = data.hobbies.length >= 3 && data.hobbies.length <= 12
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col min-h-0">
        <h2 className="text-3xl font-bold mb-2 text-alura-textPrimary">Hobbies</h2>
        <p className="text-alura-textMuted mb-6 text-sm">Conte para a comunidade o que você gosta de fazer no seu tempo livre. Selecione seus hobbies e interesses.</p>
        
        <div className="relative mb-6 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted" />
          <Input 
            placeholder="Buscar interesses..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-alura-surface2 border-alura-border h-12 text-alura-textPrimary placeholder:text-alura-textMuted focus:border-alura-accent"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map(hobby => {
              const selected = data.hobbies.includes(hobby.id)
              return (
                <div 
                  key={hobby.id} 
                  onClick={() => toggleHobby(hobby.id)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 group h-32 ${
                    selected ? 'border-alura-accent bg-alura-selected shadow-[0_0_15px_rgba(57,255,136,0.15)] scale-[0.98]' : 'border-alura-border bg-alura-surface1 hover:border-alura-accent/50 hover:bg-alura-surface2'
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-alura-surface3">
                    <img src={hobby.image} alt={hobby.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  {selected && (
                    <div className="absolute inset-0 bg-alura-background/70 flex items-center justify-center z-20 backdrop-blur-[2px]">
                      <div className="bg-alura-accent text-[#0B0D0F] p-2 rounded-full shadow-[0_0_10px_rgba(57,255,136,0.3)]">
                        <Check className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-alura-background to-transparent">
                    <p className="font-semibold text-alura-textPrimary text-sm truncate leading-tight">{hobby.name}</p>
                    <p className="text-alura-accent text-[10px] uppercase font-bold tracking-wider mt-1">{hobby.category}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="text-center py-2 shrink-0">
          <span className={`text-sm font-medium ${isValid ? 'text-alura-accent' : 'text-alura-textMuted'}`}>
            {data.hobbies.length} de 12 selecionados {data.hobbies.length < 3 && '(mínimo 3)'}
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
