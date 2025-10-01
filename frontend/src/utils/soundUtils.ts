// Sound utility for playing notification sounds
export class SoundUtils {
  private static audioContext: AudioContext | null = null;
  private static hornSoundBuffer: AudioBuffer | null = null;

  // Initialize audio context (required for modern browsers)
  private static async initAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate a horn-like sound using Web Audio API
  private static async generateHornSound(): Promise<AudioBuffer> {
    const audioContext = await this.initAudioContext();
    const sampleRate = audioContext.sampleRate;
    const duration = 1.5; // 1.5 seconds
    const length = sampleRate * duration;

    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Create a horn-like sound with multiple frequencies
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2); // Exponential decay

      // Multiple harmonics for horn-like sound
      const fundamental = 200; // Base frequency
      const wave1 = Math.sin(2 * Math.PI * fundamental * t);
      const wave2 = Math.sin(2 * Math.PI * fundamental * 1.5 * t) * 0.5;
      const wave3 = Math.sin(2 * Math.PI * fundamental * 2 * t) * 0.25;
      const wave4 = Math.sin(2 * Math.PI * fundamental * 3 * t) * 0.125;

      // Add some noise for more realistic horn sound
      const noise = (Math.random() - 0.5) * 0.1;

      data[i] = (wave1 + wave2 + wave3 + wave4 + noise) * envelope * 0.3;
    }

    return buffer;
  }

  // Play horn sound
  public static async playHornSound(): Promise<void> {
    try {
      const audioContext = await this.initAudioContext();

      // Resume audio context if suspended (required for user interaction)
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      // Generate or reuse horn sound buffer
      if (!this.hornSoundBuffer) {
        this.hornSoundBuffer = await this.generateHornSound();
      }

      // Create and play the sound
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      source.buffer = this.hornSoundBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set volume
      gainNode.gain.value = 0.5;

      // Play the sound
      source.start();

      console.log("🔊 Horn sound played");
    } catch (error) {
      console.error("❌ Failed to play horn sound:", error);
    }
  }

  // Play a simple beep sound (fallback)
  public static async playBeepSound(): Promise<void> {
    try {
      const audioContext = await this.initAudioContext();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      console.log("🔊 Beep sound played");
    } catch (error) {
      console.error("❌ Failed to play beep sound:", error);
    }
  }

  // Play notification sound based on type
  public static async playNotificationSound(type: string): Promise<void> {
    switch (type) {
      case "stop_loss_triggered":
        await this.playHornSound();
        break;
      case "order_update":
      case "strategy_alert":
        await this.playBeepSound();
        break;
      default:
        // No sound for system notifications
        break;
    }
  }
}
