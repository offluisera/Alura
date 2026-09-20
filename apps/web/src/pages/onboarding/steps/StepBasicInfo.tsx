import { Button } from "@alura/ui"
import { ArrowRight, ArrowLeft, User, Calendar, Phone, MapPin, Globe, ChevronDown, Info } from "lucide-react"

export function StepBasicInfo({ data, updateData, onNext, onBack }: any) {
  
  // Funções de formatação (Máscaras)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 11) v = v.slice(0, 11)
    if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`
    if (v.length > 9) v = `${v.slice(0,10)}-${v.slice(10)}`
    updateData({ phone: v })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 8) v = v.slice(0, 8)
    if (v.length > 2) v = `${v.slice(0,2)}/${v.slice(2)}`
    if (v.length > 5) v = `${v.slice(0,5)}/${v.slice(5)}`
    
    // Auto calcular idade se a data estiver completa (8 digitos + 2 barras = 10 chars)
    let age = data.age || ""
    if (v.length === 10) {
      const parts = v.split('/')
      const bday = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
      if (!isNaN(bday.getTime())) {
        const today = new Date()
        let calcAge = today.getFullYear() - bday.getFullYear()
        const m = today.getMonth() - bday.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) {
          calcAge--
        }
        age = `${calcAge} anos`
      }
    }
    
    updateData({ birthDate: v, age: age })
  }
  
  const handleTextOnly = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^a-zA-Záéíóúâêôãõç\s]/gi, '')
    updateData({ [field]: v })
  }

  // Validação
  const numericAge = parseInt(String(data.age).replace(/\D/g, '') || "0")
  const isValidAge = numericAge >= 14
  const canProceed = data.fullName && data.birthDate?.length === 10 && isValidAge && data.phone && data.city && data.state && data.language

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-[42px] h-[42px] rounded-full border border-alura-accent/40 flex items-center justify-center bg-alura-accent/10 shrink-0 shadow-[0_0_15px_rgba(57,255,136,0.15)]">
          <User className="w-6 h-6 text-alura-accent" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-alura-textPrimary tracking-wide">Informações Básicas</h2>
          <p className="text-alura-textSecondary text-sm mt-1 max-w-xl leading-relaxed">
            Vamos começar com algumas informações essenciais para que possamos<br/>
            te conhecer melhor. Não se preocupe, você pode alterar depois.
          </p>
        </div>
      </div>
      
      {/* Container Principal */}
      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        <div className="bg-alura-surface1 border border-alura-border rounded-xl p-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6">
            
            {/* Linha 1 */}
            <div>
              <label className="block text-alura-textSecondary text-sm font-medium mb-1.5">
                Nome completo <span className="text-alura-accent">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted" />
                <input 
                  type="text"
                  placeholder="João Pedro Silva" 
                  value={data.fullName || ""} 
                  onChange={(e) => updateData({fullName: e.target.value})} 
                  className="w-full pl-10 pr-3 h-12 bg-alura-surface2 border border-alura-border rounded-lg text-alura-textPrimary text-sm focus:outline-none focus:border-alura-accent transition-colors placeholder:text-alura-textMuted"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-alura-textSecondary text-sm font-medium mb-1.5 flex justify-between">
                <span>Idade <span className="text-alura-accent">*</span></span>
                {(!isValidAge && data.age) && <span className="text-red-400 text-xs">Mínimo 14 anos</span>}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted" />
                <input 
                  type="text"
                  placeholder="18 anos" 
                  value={data.age || ""} 
                  onChange={(e) => updateData({age: e.target.value.replace(/[^0-9\sanos]/g, '')})} 
                  className={`w-full pl-10 pr-8 h-12 bg-alura-surface2 border rounded-lg text-sm focus:outline-none transition-colors placeholder:text-alura-textMuted ${!isValidAge && data.age ? 'border-red-500 text-red-400 focus:border-red-500' : 'border-alura-border text-alura-textPrimary focus:border-alura-accent'}`}
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted pointer-events-none" />
              </div>
            </div>

            {/* Linha 2 */}
            <div>
              <label className="block text-alura-textSecondary text-sm font-medium mb-1.5">
                Data de nascimento <span className="text-alura-accent">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted" />
                <input 
                  type="text"
                  placeholder="15/04/2007" 
                  value={data.birthDate || ""} 
                  onChange={handleDateChange} 
                  className="w-full pl-10 pr-8 h-12 bg-alura-surface2 border border-alura-border rounded-lg text-alura-textPrimary text-sm focus:outline-none focus:border-alura-accent transition-colors placeholder:text-alura-textMuted"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-alura-textSecondary text-sm font-medium mb-1.5">
                Telefone <span className="text-alura-accent">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted" />
                <input 
                  type="text"
                  placeholder="(11) 98765-4321" 
                  value={data.phone || ""} 
                  onChange={handlePhoneChange} 
                  className="w-full pl-10 pr-3 h-12 bg-alura-surface2 border border-alura-border rounded-lg text-alura-textPrimary text-sm focus:outline-none focus:border-alura-accent transition-colors placeholder:text-alura-textMuted"
                />
              </div>
            </div>

            {/* Linha 3 */}
            <div>
              <label className="block text-alura-textSecondary text-sm font-medium mb-1.5">
                Cidade <span className="text-alura-accent">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted" />
                <input 
                  type="text"
                  placeholder="São Paulo" 
                  value={data.city || ""} 
                  onChange={handleTextOnly('city')} 
                  className="w-full pl-10 pr-8 h-12 bg-alura-surface2 border border-alura-border rounded-lg text-alura-textPrimary text-sm focus:outline-none focus:border-alura-accent transition-colors placeholder:text-alura-textMuted"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted pointer-events-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-alura-textSecondary text-sm font-medium mb-1.5">
                Estado <span className="text-alura-accent">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted" />
                <input 
                  type="text"
                  placeholder="São Paulo" 
                  value={data.state || ""} 
                  onChange={handleTextOnly('state')} 
                  className="w-full pl-10 pr-8 h-12 bg-alura-surface2 border border-alura-border rounded-lg text-alura-textPrimary text-sm focus:outline-none focus:border-alura-accent transition-colors placeholder:text-alura-textMuted"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted pointer-events-none" />
              </div>
            </div>

            {/* Linha 4 (Full Width) */}
            <div className="sm:col-span-2">
              <label className="block text-alura-textSecondary text-sm font-medium mb-1.5">
                Idioma preferido
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted z-10" />
                <select 
                  value={data.language || ""} 
                  onChange={(e) => updateData({language: e.target.value})} 
                  className="w-full pl-10 pr-8 h-12 bg-alura-surface2 border border-alura-border rounded-lg text-alura-textPrimary text-sm focus:outline-none focus:border-alura-accent transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Selecione um idioma</option>
                  <option value="Português (Brasil)">Português (Brasil)</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Francês">Francês</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-alura-textMuted pointer-events-none" />
              </div>
            </div>
            
            {/* Aviso Informativo */}
            <div className="sm:col-span-2 mt-2">
              <div className="flex items-center space-x-3 bg-alura-surface2/60 border border-alura-border rounded-lg p-4">
                <div className="shrink-0 w-6 h-6 rounded-full border border-alura-accent/30 flex items-center justify-center bg-alura-accent/10">
                  <Info className="w-4 h-4 text-alura-accent" />
                </div>
                <p className="text-xs text-alura-textMuted leading-relaxed">
                  Essas informações são apenas para melhorar sua experiência na plataforma.<br/>
                  Elas não serão compartilhadas com terceiros.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="pt-6 border-t border-alura-border flex justify-between shrink-0 mt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled
          className="h-10 px-4 bg-transparent border-alura-border text-alura-textSecondary text-sm font-semibold rounded-lg hover:bg-alura-surface2 hover:text-alura-textPrimary disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="h-10 px-5 bg-alura-accent text-[#0B0D0F] text-sm font-semibold rounded-lg hover:bg-alura-accentHover disabled:opacity-50"
        >
          Salvar e continuar <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
