/**
 * ElevenLabs Conversational AI Integration
 */
import { Conversation } from '@elevenlabs/client';

// ElevenLabs Agent Configuration
const AGENT_ID = 'agent_1101k6mk95q8ebst236qay0rbdp5';

// Voice IDs mapping
const voiceIds = {
  ava: 'OUBnvvuqEKdDWtapoJFn',
  ethan: 'irAl0cku0Hx4TEUJ8d1Q',
  sophia: '4xkUqaR9MYOJHoaC1Nak',
  liam: '2OoHspMHbpIu5oiMaqDy',
  emma: 'QITiGyM4owEZrBEf0QV8',
  marco: 'UgBBYS2sOqTuMpoF3BR0'
};

// Translations
const translations = {
  en: {
    connecting: 'Connecting...',
    connected: 'Connected - Start speaking!',
    listening: 'Listening...',
    speaking: (name) => `${name} is speaking...`,
    speakingWith: (name) => `Speaking with ${name}`,
    assistantListening: 'Your AI assistant is listening...',
    connectionError: 'Connection error. Please try again.',
    connectionFailed: 'Failed to connect. Please try again.',
    micRequired: 'Microphone access is required to start a voice call. Please allow microphone access and try again.',
    defaultTitle: 'Start talking to our AI Voice Agent',
    defaultSubtitle: 'Allow mic access and start chatting with our voice agent in real-time.'
  },
  it: {
    connecting: 'Connessione in corso...',
    connected: 'Connesso - Inizia a parlare!',
    listening: 'In ascolto...',
    speaking: (name) => `${name} sta parlando...`,
    speakingWith: (name) => `Parlando con ${name}`,
    assistantListening: 'Il tuo assistente AI sta ascoltando...',
    connectionError: 'Errore di connessione. Riprova.',
    connectionFailed: 'Connessione fallita. Riprova.',
    micRequired: "L'accesso al microfono e necessario per iniziare una chiamata vocale. Consenti l'accesso al microfono e riprova.",
    defaultTitle: 'Inizia a parlare con il nostro Agente Vocale AI',
    defaultSubtitle: "Consenti l'accesso al microfono e inizia a chattare con il nostro agente vocale in tempo reale."
  }
};

/**
 * Initialize ElevenLabs voice agent for a page
 * @param {string} lang - Language code ('en' or 'it')
 * @param {string} suffix - Element ID suffix ('' for English, '-it' for Italian)
 */
export function initElevenLabsVoice(lang = 'en', suffix = '') {
  let conversation = null;
  let selectedVoice = 'ava';
  const t = translations[lang] || translations.en;

  // DOM Elements
  const startCallBtn = document.getElementById(`start-call-btn${suffix}`);
  const endCallBtn = document.getElementById(`end-call-btn${suffix}`);
  const callButtons = document.getElementById(`call-buttons${suffix}`);
  const activeCallUI = document.getElementById(`active-call-ui${suffix}`);
  const callStatus = document.getElementById(`call-status${suffix}`);
  const heroTitle = document.getElementById(`hero-title${suffix}`);
  const heroSubtitle = document.getElementById(`hero-subtitle${suffix}`);
  const voicePillsContainer = document.getElementById(`voice-pills-container${suffix}`);
  const pillClass = suffix ? `.voice-agent-pill${suffix}` : '.voice-agent-pill';
  const pills = document.querySelectorAll(pillClass);

  // Check if elements exist
  if (!startCallBtn || !endCallBtn) {
    console.log('ElevenLabs: Voice agent elements not found on this page');
    return;
  }

  // Voice pill selection
  pills.forEach(pill => {
    pill.addEventListener('click', function() {
      if (conversation) return; // Don't allow switching during active call

      pills.forEach(p => {
        p.classList.remove('active', 'bg-white', 'border-white', 'text-[#9333ea]');
        p.classList.add('bg-white/30', 'border-transparent', 'text-black/80');
      });
      this.classList.remove('bg-white/30', 'border-transparent', 'text-black/80');
      this.classList.add('active', 'bg-white', 'border-white', 'text-[#9333ea]');

      selectedVoice = this.dataset.agent;
    });
  });

  // Request microphone permission
  async function requestMicrophonePermission() {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Capitalize first letter
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Start conversation
  async function startConversation() {
    const hasPermission = await requestMicrophonePermission();

    if (!hasPermission) {
      alert(t.micRequired);
      return;
    }

    // Update UI to active call state
    callButtons.classList.add('hidden');
    activeCallUI.classList.remove('hidden');
    activeCallUI.classList.add('flex');
    voicePillsContainer.style.opacity = '0.5';
    voicePillsContainer.style.pointerEvents = 'none';
    heroTitle.textContent = t.speakingWith(capitalize(selectedVoice));
    heroSubtitle.textContent = t.assistantListening;
    callStatus.textContent = t.connecting;

    try {
      // Get the voice ID for the selected voice
      const selectedVoiceId = voiceIds[selectedVoice];
      console.log('Starting conversation with voice:', selectedVoice, 'Voice ID:', selectedVoiceId);

      // Build session config with voice override
      // Note: Using snake_case 'voice_id' as ElevenLabs API may expect this format
      const sessionConfig = {
        agentId: AGENT_ID,
        overrides: {
          agent: {
            tts: {
              voice_id: selectedVoiceId
            }
          }
        },
        onConnect: () => {
          console.log('Connected to ElevenLabs with voice:', selectedVoice, 'ID:', selectedVoiceId);
          callStatus.textContent = t.connected;
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          endConversation();
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          // Don't show error to user if it's just the disconnect error
          if (error && error.message) {
            callStatus.textContent = t.connectionError;
            setTimeout(() => endConversation(), 2000);
          }
        },
        onModeChange: (mode) => {
          console.log('Mode changed:', mode);
          if (mode.mode === 'speaking') {
            callStatus.textContent = t.speaking(capitalize(selectedVoice));
          } else if (mode.mode === 'listening') {
            callStatus.textContent = t.listening;
          }
        }
      };

      console.log('Starting session with config:', sessionConfig);
      conversation = await Conversation.startSession(sessionConfig);
      console.log('Session started:', conversation);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      callStatus.textContent = t.connectionFailed;
      setTimeout(() => endConversation(), 2000);
    }
  }

  // End conversation
  async function endConversation() {
    if (conversation) {
      try {
        await conversation.endSession();
      } catch (e) {
        console.error('Error ending session:', e);
      }
      conversation = null;
    }

    // Reset UI
    activeCallUI.classList.add('hidden');
    activeCallUI.classList.remove('flex');
    callButtons.classList.remove('hidden');
    voicePillsContainer.style.opacity = '1';
    voicePillsContainer.style.pointerEvents = 'auto';
    heroTitle.textContent = t.defaultTitle;
    heroSubtitle.textContent = t.defaultSubtitle;
  }

  // Event listeners
  startCallBtn.addEventListener('click', startConversation);
  endCallBtn.addEventListener('click', endConversation);

  console.log(`ElevenLabs Voice Agent initialized (${lang})`);
}
