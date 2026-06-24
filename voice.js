/**
 * School Van Management System - Voice Command Assistant (voice.js)
 * Wraps browser Web Speech API with specific command matchers for English and Tamil.
 */

export const VoiceAssistant = {
  recognition: null,
  isListening: false,
  callbacks: {},

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      this._trigger('start');
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      this._trigger('result', transcript);
      this.parseCommand(transcript);
    };

    this.recognition.onerror = (event) => {
      this._trigger('error', event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this._trigger('end');
    };

    return true;
  },

  start(lang = 'en') {
    if (!this.recognition) return;
    this.recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
    try {
      this.recognition.start();
    } catch (e) {
      console.error("Speech recognition start failed:", e);
    }
  },

  stop() {
    if (!this.recognition) return;
    this.recognition.stop();
  },

  on(event, cb) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(cb);
  },

  _trigger(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  },

  parseCommand(text) {
    console.log("Parsing voice command:", text);
    const cleaned = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

    // Command mapping lists
    // English Matches
    const enShowStudents = ['show students', 'open students', 'go to students', 'students list'];
    const enShowDrivers = ['show drivers', 'open drivers', 'go to drivers', 'drivers list'];
    const enShowVans = ['show vans', 'open vans', 'go to vans', 'vans list', 'show vehicles'];
    const enOpenPayments = ['open payments', 'show payments', 'payments', 'fee status'];
    const enOpenReports = ['open reports', 'show reports', 'reports', 'download reports'];
    const enPendingPayments = ['show pending payments', 'pending payments', 'who has pending payments'];

    // Tamil Matches
    const taShowStudents = ['மாணவர்களைக் காட்டு', 'மாணவர்கள்', 'மாணவர் பட்டியல்'];
    const taShowDrivers = ['ஓட்டுநர்களைக் காட்டு', 'ஓட்டுநர்கள்', 'ஓட்டுநர் பட்டியல்'];
    const taShowVans = ['வண்டிகளைக் காட்டு', 'வண்டிகள்', 'வாகனங்கள்'];
    const taOpenPayments = ['கட்டணங்களைத் திற', 'கட்டணங்கள்', 'பணம்'];
    const taOpenReports = ['அறிக்கைகளைத் திற', 'அறிக்கைகள்', 'அறிக்கை'];
    const taPendingPayments = ['நிலுவைக் கட்டணங்களைக் காட்டு', 'நிலுவை கட்டணம்'];

    // Route transitions
    if (enShowStudents.some(cmd => cleaned.includes(cmd)) || taShowStudents.some(cmd => cleaned.includes(cmd))) {
      this._trigger('command', { type: 'route', target: 'students' });
      return;
    }
    if (enShowDrivers.some(cmd => cleaned.includes(cmd)) || taShowDrivers.some(cmd => cleaned.includes(cmd))) {
      this._trigger('command', { type: 'route', target: 'drivers' });
      return;
    }
    if (enShowVans.some(cmd => cleaned.includes(cmd)) || taShowVans.some(cmd => cleaned.includes(cmd))) {
      this._trigger('command', { type: 'route', target: 'vans' });
      return;
    }
    if (enOpenPayments.some(cmd => cleaned.includes(cmd)) || taOpenPayments.some(cmd => cleaned.includes(cmd))) {
      this._trigger('command', { type: 'route', target: 'payments' });
      return;
    }
    if (enOpenReports.some(cmd => cleaned.includes(cmd)) || taOpenReports.some(cmd => cleaned.includes(cmd))) {
      this._trigger('command', { type: 'route', target: 'reports' });
      return;
    }
    if (enPendingPayments.some(cmd => cleaned.includes(cmd)) || taPendingPayments.some(cmd => cleaned.includes(cmd))) {
      this._trigger('command', { type: 'route', target: 'payments', filter: 'Pending' });
      return;
    }

    // Search matches (e.g., "search student ravi" or "மாணவர் ரவி தேடு")
    // English format: "search student [name]"
    if (cleaned.startsWith('search student ')) {
      const query = cleaned.replace('search student ', '').trim();
      this._trigger('command', { type: 'search', target: 'students', query });
      return;
    }

    // Tamil format: "மாணவர் [பெயர்] தேடு" or "[பெயர்] தேடு"
    if (cleaned.endsWith(' தேடு') || cleaned.endsWith('தேடு')) {
      let query = cleaned.replace('தேடு', '').trim();
      if (query.startsWith('மாணவர் ')) {
        query = query.replace('மாணவர் ', '').trim();
      }
      this._trigger('command', { type: 'search', target: 'students', query });
      return;
    }

    // Fallback: search globally for whatever was spoken
    this._trigger('command', { type: 'global-search', query: cleaned });
  }
};
