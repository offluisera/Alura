import { Button } from "@alura/ui"
import { ArrowRight, ArrowLeft, Smile } from "lucide-react"
import { useState } from "react"
import EmojiPicker, { Theme } from "emoji-picker-react"

export function StepMessage({ data, updateData, onNext, onBack }: any) {
  const [showEmoji, setShowEmoji] = useState(false)

  const onEmojiClick = (emojiObject: any) => {
    updateData({ message: (data.message || "") + emojiObject.emoji })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-4 text-alura-textPrimary">Mensagem</h2>
        <p className="text-alura-textMuted mb-8">Deixe uma mensagem para a comunidade. Diga o que você espera encontrar por aqui.</p>
        
        <div className="relative">
          <textarea 
            placeholder="Ex: E aí pessoal! Sou dev front-end e vim aqui pra fazer networking e jogar um Valorant no fim de semana." 
            value={data.message || ""} 
            onChange={(e: any) => updateData({message: e.target.value})} 
            className="w-full rounded-md px-3 py-2 text-sm bg-alura-surface1 border border-alura-border min-h-[150px] resize-none focus:outline-none focus:border-alura-accent text-alura-textPrimary placeholder:text-alura-textMuted pr-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]" 
          />
          <button 
            type="button"
            onClick={() => setShowEmoji(!showEmoji)}
            className="absolute top-3 right-3 text-alura-textMuted hover:text-alura-accent transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          {showEmoji && (
            <div className="absolute right-0 top-12 z-50">
              <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-6 mt-6 border-t border-alura-border flex justify-between">
        <Button variant="outline" onClick={onBack} className="border-alura-border text-alura-textSecondary hover:bg-alura-surface2 hover:text-alura-textPrimary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} className="bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover">
          Salvar e continuar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
