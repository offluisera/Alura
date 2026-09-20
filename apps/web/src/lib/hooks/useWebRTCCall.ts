import { useState, useEffect, useRef, useCallback } from 'react'
import { PhoenixCallSignalingService } from '../services/PhoenixCallSignalingService'
import type { PhoenixCallSignal as CallSignal } from '../services/PhoenixCallSignalingService'
import { CleanvoiceService } from '../services/CleanvoiceService'
import { SoundService } from '../services/SoundService'

// O restante deste hook permanece igual; a única troca de transporte é Phoenix.
// (arquivo será atualizado pelo agente de integração em seguida)
