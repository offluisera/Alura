import { Button } from "@alura/ui"
import { ArrowLeft, Rocket } from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { useNotification } from "../../../contexts/NotificationContext"
import { useState } from "react"
import { compressImageToWebp } from "../../../lib/utils/imageOptimizer"

export function StepFinish({ data, onComplete, onBack, user }: any) {
  const [loading, setLoading] = useState(false)
  const { showToast } = useNotification()

  const handleFinish = async () => {
    setLoading(true)
    // Converte a data DD/MM/YYYY para YYYY-MM-DD para o banco PostgreSQL
    let formattedBirthDate = null;
    if (data.birthDate) {
      const parts = data.birthDate.split('/');
      if (parts.length === 3) {
        formattedBirthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    
    let finalAvatarUrl = data.avatarUrl || data.avatar || null;

    if (data.avatarFile) {
      try {
        const compressedAvatar = await compressImageToWebp(data.avatarFile, { maxWidth: 1024, maxHeight: 1024, quality: 0.85 });
        const fileName = `${user.id}-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, compressedAvatar, { contentType: 'image/webp', upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        finalAvatarUrl = publicUrlData.publicUrl;
      } catch (err: any) {
        console.error("Erro no upload:", err);
        showToast({
          type: "error",
          title: "Erro no Upload",
          message: "Erro ao fazer upload da imagem: " + err.message
        });
        setLoading(false);
        return;
      }
    }

    let finalBannerUrl = data.bannerUrl || data.banner || null;
    if (data.bannerFile) {
      try {
        const compressedBanner = await compressImageToWebp(data.bannerFile, { maxWidth: 1920, maxHeight: 1080, quality: 0.85 });
        const fileName = `banner-${user.id}-${Date.now()}.webp`;
        const { error: bannerUploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, compressedBanner, { contentType: 'image/webp', upsert: true });

        if (!bannerUploadError) {
          const { data: bannerUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          finalBannerUrl = bannerUrlData.publicUrl;
        }
      } catch (err: any) {
        console.warn("Aviso ao carregar banner customizado:", err);
      }
    }

    // Preparar payload. O banco precisa estar atualizado com 20240101000010_user_onboarding.sql
    const payload = {
      display_name: data.fullName,
      age: parseInt(data.age) || null,
      birth_date: formattedBirthDate,
      phone: data.phone || null,
      city: data.city || null,
      state: data.state || null,
      language: data.language || 'Português',
      avatar_url: finalAvatarUrl,
      banner_url: finalBannerUrl,
      bio: data.bio || null,
      tags: data.tags || [],
      favorite_games: data.favoriteGames || [],
      hobbies: data.hobbies || [],
      onboarding_completed: true
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ ...payload, id: user.id })

      if (error) throw error

      // Se o usuário escreveu uma mensagem de boas-vindas, publica no feed social
      if (data.message && data.message.trim()) {
        try {
          await supabase.from('feed_posts').insert({
            user_id: user.id,
            content: data.message.trim()
          })
        } catch (feedErr) {
          console.warn("Aviso ao publicar mensagem inaugural no feed:", feedErr)
        }
      }
      
      onComplete() // Dispara callback para liberar o Dashboard
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Erro ao Salvar",
        message: "Erro ao finalizar: " + err.message
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full items-center justify-center text-center">
      <div className="w-24 h-24 rounded-full bg-alura-accent/10 border-4 border-alura-accent flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(57,255,136,0.25)]">
        <Rocket className="w-12 h-12 text-alura-accent" />
      </div>
      
      <h2 className="text-4xl font-bold mb-4 text-alura-textPrimary">Tudo pronto!</h2>
      <p className="text-alura-textMuted max-w-md mx-auto mb-10">
        Seu perfil foi configurado e a comunidade está de portas abertas.
        A sua jornada dentro da Alura começa agora.
      </p>
      
      <div className="flex space-x-4 w-full max-w-sm">
        <Button variant="outline" onClick={onBack} disabled={loading} className="flex-1 border-alura-border text-alura-textSecondary hover:bg-alura-surface2 hover:text-alura-textPrimary">
          <ArrowLeft className="w-4 h-4 mr-2" /> Revisar
        </Button>
        <Button onClick={handleFinish} disabled={loading} className="flex-[2] bg-alura-accent text-[#0B0D0F] hover:bg-alura-accentHover shadow-[0_0_20px_rgba(57,255,136,0.35)] transition-all font-bold text-lg h-12">
          {loading ? "Salvando..." : "Iniciar jornada!"}
        </Button>
      </div>
    </div>
  )
}
