// ElevenLabs Voice IDs for preview samples
const voiceIds = {
  ava: 'OUBnvvuqEKdDWtapoJFn',
  ethan: 'irAl0cku0Hx4TEUJ8d1Q',
  sophia: '4xkUqaR9MYOJHoaC1Nak',
  liam: '2OoHspMHbpIu5oiMaqDy',
  emma: 'QITiGyM4owEZrBEf0QV8',
  marco: 'UgBBYS2sOqTuMpoF3BR0'
};

// Sample text for voice previews
const sampleText = "Hi there! I'm your AI voice assistant. I can help you with appointments, answer questions, and so much more. How can I assist you today?";

// Currently playing audio element (for stopping when another plays)
let currentlyPlayingAudio = null;
let currentlyPlayingItem = null;

const aiVoiceSampleAnimation = {
  init() {
    const voiceSampleItems = document.querySelectorAll('.voice-sample-item');

    voiceSampleItems.forEach((item) => {
      item.waveformTimelines = []; // Store GSAP timelines for this item
      item.isLoading = false;

      // Initialize waveform animation
      aiVoiceSampleAnimation.initWaveform(item);

      // Handle play/pause on click
      item.querySelector('.voice-sample-play-button').addEventListener('click', async () => {
        const isPlaying = item.classList.contains('voice-sample-item-active');

        if (isPlaying) {
          // Pause current audio
          aiVoiceSampleAnimation.stopAudio(item);
        } else {
          // Stop any currently playing audio first
          if (currentlyPlayingItem && currentlyPlayingItem !== item) {
            aiVoiceSampleAnimation.stopAudio(currentlyPlayingItem);
          }

          // Play this voice
          await aiVoiceSampleAnimation.playVoice(item);
        }
      });
    });
  },

  async playVoice(item) {
    if (item.isLoading) return;

    const voiceName = item.dataset.voiceName?.toLowerCase();
    const voiceId = voiceIds[voiceName];

    if (!voiceId) {
      console.error('Voice ID not found for:', voiceName);
      return;
    }

    item.isLoading = true;
    toggleAnimation(item, true);

    try {
      // Use ElevenLabs streaming TTS API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: For production, use a backend proxy to hide the API key
          // 'xi-api-key': 'YOUR_API_KEY'
        },
        body: JSON.stringify({
          text: sampleText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        // Fallback to local audio file if API call fails (no API key)
        console.log('ElevenLabs API requires authentication. Using local audio fallback.');
        await aiVoiceSampleAnimation.playLocalAudio(item, voiceName);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      item.audio = audio;
      currentlyPlayingAudio = audio;
      currentlyPlayingItem = item;

      audio.addEventListener('ended', () => {
        aiVoiceSampleAnimation.stopAudio(item);
        URL.revokeObjectURL(audioUrl);
      });

      audio.addEventListener('error', () => {
        aiVoiceSampleAnimation.stopAudio(item);
        URL.revokeObjectURL(audioUrl);
      });

      await audio.play();
      item.isLoading = false;

    } catch (error) {
      console.log('Using local audio fallback:', error.message);
      await aiVoiceSampleAnimation.playLocalAudio(item, voiceName);
    }
  },

  async playLocalAudio(item, voiceName) {
    // Try to load local audio file for this voice
    const audioPath = `./audio/${voiceName}.mp3`;
    const audio = new Audio(audioPath);

    item.audio = audio;
    currentlyPlayingAudio = audio;
    currentlyPlayingItem = item;
    item.isLoading = false;

    audio.addEventListener('ended', () => {
      aiVoiceSampleAnimation.stopAudio(item);
    });

    audio.addEventListener('error', () => {
      console.error(`Audio file not found: ${audioPath}. Please add voice sample audio files to public/audio/`);
      aiVoiceSampleAnimation.stopAudio(item);
    });

    try {
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      aiVoiceSampleAnimation.stopAudio(item);
    }
  },

  stopAudio(item) {
    if (item.audio) {
      item.audio.pause();
      item.audio.currentTime = 0;
    }

    item.isLoading = false;
    toggleAnimation(item, false);

    if (currentlyPlayingItem === item) {
      currentlyPlayingAudio = null;
      currentlyPlayingItem = null;
    }
  },

  initWaveform(item) {
    const svgContainer = item.querySelector('.voice-sample-waveform');

    if (!svgContainer) {
      return;
    }

    const voiceBars = svgContainer.querySelectorAll('.voice-bar');

    if (voiceBars.length === 0) {
      return;
    }

    const originalWidths = Array.from(voiceBars).map((rect) => {
      const width = Number.parseFloat(rect.getAttribute('width')) || 0;
      return width;
    });

    // Store original widths and bars for this item
    item.waveformBars = voiceBars;
    item.waveformOriginalWidths = originalWidths;
  },

  startWaveform(item) {
    if (!item.waveformBars || !item.waveformOriginalWidths) {
      return;
    }

    const voiceBars = item.waveformBars;
    const originalWidths = item.waveformOriginalWidths;
    const timelines = [];

    voiceBars.forEach((singleBar, index) => {
      const originalWidth = originalWidths[index];

      // Skip if original width is 0 or very small
      if (originalWidth <= 1) {
        return;
      }

      const isHighBar = singleBar.dataset.barType === 'high';

      const minHeight = isHighBar
        ? originalWidth * 0.2 // High bars start at 20% of original
        : originalWidth * 0.1; // Low bars start at 10% of original

      const maxHeight = originalWidth; // Never exceed original height

      // Create wave effect with staggered delays
      // Use sine wave pattern for more natural voice-like flow
      const position = index / voiceBars.length; // 0 to 1
      const sineOffset = Math.sin(position * Math.PI * 4) * 0.1; // Wave pattern
      const baseDelay = index * 0.012; // Stagger based on position
      const delay = baseDelay + sineOffset;

      // Duration varies to create natural rhythm - faster for high bars
      const duration = isHighBar
        ? 0.4 + Math.random() * 0.25 // High bars: 0.4-0.65s (faster)
        : 0.6 + Math.random() * 0.3; // Low bars: 0.6-0.9s (slower)

      // Set initial width to a random value between min and max for variety
      const initialHeight = minHeight + (maxHeight - minHeight) * (0.3 + Math.random() * 0.2);
      gsap.set(singleBar, {
        attr: { width: initialHeight },
      });

      const tl = gsap.timeline({
        repeat: -1,
        delay: delay,
      });

      tl.to(singleBar, {
        attr: { width: maxHeight },
        duration: duration,
        ease: 'sine.inOut',
      }).to(singleBar, {
        attr: { width: minHeight },
        duration: duration,
        ease: 'linear',
      });

      timelines.push(tl);
    });

    // Store timelines for this item
    item.waveformTimelines = timelines;
  },

  stopWaveform(item) {
    if (!item.waveformTimelines) {
      return;
    }

    // Kill all timelines and reset bars to original widths
    item.waveformTimelines.forEach((tl) => {
      tl.kill();
    });

    // Reset all bars to their original widths
    if (item.waveformBars && item.waveformOriginalWidths) {
      item.waveformBars.forEach((bar, index) => {
        const originalWidth = item.waveformOriginalWidths[index];
        gsap.set(bar, {
          attr: { width: originalWidth },
        });
      });
    }

    item.waveformTimelines = [];
  },
};

const toggleAnimation = (item, isPlaying) => {
  const content = item.querySelector('.voice-sample-item-content');
  const svg = item.querySelector('.voice-sample-svg');
  const playIcon = item.querySelector('.play-icon');
  const pauseIcon = item.querySelector('.pause-icon');

  if (isPlaying) {
    item.classList.add('voice-sample-item-active');
    // Start waveform animation
    aiVoiceSampleAnimation.startWaveform(item);
  } else {
    item.classList.remove('voice-sample-item-active');
    // Stop waveform animation
    aiVoiceSampleAnimation.stopWaveform(item);
  }

  gsap.to(content, { y: isPlaying ? -100 : 0, duration: 0.5, ease: 'power2.inOut' });
  gsap.to(svg, { y: isPlaying ? -36 : 0, duration: 0.5, ease: 'power2.inOut' });
  gsap.to(playIcon, { y: isPlaying ? -35 : -9, duration: 0.5, ease: 'power2.inOut' });
  gsap.to(pauseIcon, { y: isPlaying ? 0 : 25, duration: 0.5, ease: 'power2.inOut' });
};

if (globalThis.window !== undefined) {
  aiVoiceSampleAnimation.init();
}
