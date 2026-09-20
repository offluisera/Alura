import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

// Componentes das Etapas
import { StepBasicInfo } from "./steps/StepBasicInfo"
import { StepGames } from "./steps/StepGames"
import { StepHobbies } from "./steps/StepHobbies"
import { StepProfile } from "./steps/StepProfile"
import { StepMessage } from "./steps/StepMessage"
import { StepFinish } from "./steps/StepFinish"
import bgImage from "../../assets/background.png"

interface OnboardingWizardProps {
  user: any
  profile: any
  onComplete: () => void
}

const STEPS = [
  { id: 1, title: "Informações Básicas", desc: "Dados pessoais e contato" },
  { id: 2, title: "Jogos", desc: "Seus jogos favoritos" },
  { id: 3, title: "Hobbies", desc: "Interesses e atividades" },
  { id: 4, title: "Perfil", desc: "Foto, bio e preferências" },
  { id: 5, title: "Mensagem", desc: "Uma mensagem para a comunidade" },
  { id: 6, title: "Finalização", desc: "Tudo pronto!" }
]

export function OnboardingWizard({ user, profile, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Estado global do formulário
  const [formData, setFormData] = useState({
    fullName: profile?.display_name || "",
    age: "",
    birthDate: "",
    phone: "",
    city: "",
    state: "",
    language: "Português",
    avatarUrl: profile?.avatar_url || "",
    avatarFile: null as any,
    bannerUrl: profile?.banner_url || "",
    bannerFile: null as any,
    bio: profile?.bio || "",
    tags: [] as string[],
    favoriteGames: [] as string[],
    hobbies: [] as string[],
    message: ""
  })

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 6))
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  return (
    <div className="flex h-screen w-full bg-alura-background text-alura-textPrimary overflow-hidden">
      
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex flex-col w-[320px] bg-alura-surface1 border-r border-alura-border p-8 relative overflow-hidden shrink-0">
        
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 mix-blend-screen pointer-events-none opacity-40" 
          style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center left' }} 
        />
        
        <h2 className="text-xl font-bold text-white mb-10 tracking-tight relative z-10">Setup de Perfil</h2>
        
        <div className="space-y-6 relative z-10">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id
            const isPast = currentStep > step.id

            return (
              <div key={step.id} className={`flex items-start space-x-4 transition-opacity duration-300 ${isActive || isPast ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center border text-xs font-bold shrink-0 transition-colors ${
                  isPast 
                    ? 'bg-alura-accent border-alura-accent text-[#0B0D0F]' 
                    : isActive 
                      ? 'bg-alura-selected border-alura-accent text-alura-accent shadow-[0_0_10px_rgba(57,255,136,0.3)]' 
                      : 'bg-transparent border-alura-border text-alura-textMuted'
                }`}>
                  {isPast ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div>
                  <h3 className={`font-semibold text-sm ${isActive ? 'text-alura-accent' : 'text-white'}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-alura-textMuted mt-0.5">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Progress Bar Mobile */}
        <div className="lg:hidden w-full h-1 bg-alura-border">
          <div 
            className="h-full bg-alura-accent transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        {/* Container Central com Animação */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 relative flex justify-center items-center">
          <div className="w-full max-w-[1200px] h-full max-h-[800px] bg-alura-surface1 border border-alura-border rounded-xl p-8 shadow-2xl overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col"
              >
                {currentStep === 1 && <StepBasicInfo data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />}
                {currentStep === 2 && <StepGames data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />}
                {currentStep === 3 && <StepHobbies data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />}
                {currentStep === 4 && <StepProfile data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />}
                {currentStep === 5 && <StepMessage data={formData} updateData={updateFormData} onNext={handleNext} onBack={handleBack} />}
                {currentStep === 6 && <StepFinish data={formData} onComplete={onComplete} onBack={handleBack} user={user} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
    </div>
  )
}
