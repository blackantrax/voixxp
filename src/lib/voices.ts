export type Engine = "kokoro" | "piper";

export type Voice = {
  id: string;
  engine: Engine;
  name: string;
  lang: "fr" | "en" | "es" | "de" | "it" | "pt" | "nl";
  accent: string;
  gender: "F" | "M";
  style: string;
  /** Qualite percue, de 1 a 5, pour le tri. */
  rating: number;
};

export const LANGS: Record<Voice["lang"], string> = {
  fr: "Français",
  en: "Anglais",
  es: "Espagnol",
  de: "Allemand",
  it: "Italien",
  pt: "Portugais",
  nl: "Néerlandais",
};

// Piper (rhasspy, MIT) : voix multilingues legeres. Kokoro-82M (Apache 2.0) : anglais tres naturel.
export const VOICES: Voice[] = [
  { id: "fr_FR-siwis-medium", engine: "piper", name: "Siwis", lang: "fr", accent: "France", gender: "F", style: "Narration, douce", rating: 4 },
  { id: "fr_FR-upmc-medium", engine: "piper", name: "Jessica", lang: "fr", accent: "France", gender: "F", style: "Posée, livre audio", rating: 4 },
  { id: "fr_FR-tom-medium", engine: "piper", name: "Tom", lang: "fr", accent: "France", gender: "M", style: "Dynamique, réseaux sociaux", rating: 4 },
  { id: "fr_FR-upmc-medium:pierre", engine: "piper", name: "Pierre", lang: "fr", accent: "France", gender: "M", style: "Posé, formation & tutoriels", rating: 4 },

  { id: "af_heart", engine: "kokoro", name: "Heart", lang: "en", accent: "Américain", gender: "F", style: "Chaleureuse, pub & vlog", rating: 5 },
  { id: "af_bella", engine: "kokoro", name: "Bella", lang: "en", accent: "Américain", gender: "F", style: "Énergique, TikTok", rating: 5 },
  { id: "af_nicole", engine: "kokoro", name: "Nicole", lang: "en", accent: "Américain", gender: "F", style: "Chuchotée, ASMR", rating: 4 },
  { id: "af_sarah", engine: "kokoro", name: "Sarah", lang: "en", accent: "Américain", gender: "F", style: "Naturelle, lifestyle", rating: 4 },
  { id: "af_kore", engine: "kokoro", name: "Kore", lang: "en", accent: "Américain", gender: "F", style: "Calme, méditation", rating: 3 },
  { id: "af_aoede", engine: "kokoro", name: "Aoede", lang: "en", accent: "Américain", gender: "F", style: "Douce, storytelling", rating: 3 },
  { id: "am_michael", engine: "kokoro", name: "Michael", lang: "en", accent: "Américain", gender: "M", style: "Narrateur YouTube", rating: 4 },
  { id: "am_fenrir", engine: "kokoro", name: "Fenrir", lang: "en", accent: "Américain", gender: "M", style: "Bande-annonce", rating: 4 },
  { id: "am_puck", engine: "kokoro", name: "Puck", lang: "en", accent: "Américain", gender: "M", style: "Joueur, gaming", rating: 4 },
  { id: "bf_emma", engine: "kokoro", name: "Emma", lang: "en", accent: "Britannique", gender: "F", style: "Élégante, corporate", rating: 4 },
  { id: "bf_isabella", engine: "kokoro", name: "Isabella", lang: "en", accent: "Britannique", gender: "F", style: "Raffinée, luxe & mode", rating: 3 },
  { id: "bm_george", engine: "kokoro", name: "George", lang: "en", accent: "Britannique", gender: "M", style: "Classique, podcast", rating: 3 },
  { id: "bm_fable", engine: "kokoro", name: "Fable", lang: "en", accent: "Britannique", gender: "M", style: "Conteur", rating: 3 },

  { id: "en_GB-semaine-medium:poppy", engine: "piper", name: "Poppy", lang: "en", accent: "Britannique", gender: "F", style: "Personnage : joyeuse, pétillante", rating: 3 },
  { id: "en_GB-semaine-medium:spike", engine: "piper", name: "Spike", lang: "en", accent: "Britannique", gender: "M", style: "Personnage : grincheux, sketchs", rating: 3 },
  { id: "es_MX-claude-high", engine: "piper", name: "Claudio", lang: "es", accent: "Mexique", gender: "M", style: "Clair, haute qualité", rating: 4 },
  { id: "es_ES-sharvard-medium:F", engine: "piper", name: "Lucía", lang: "es", accent: "Espagne", gender: "F", style: "Neutre, pédagogique", rating: 3 },
  { id: "es_ES-davefx-medium", engine: "piper", name: "Dave", lang: "es", accent: "Espagne", gender: "M", style: "Neutre", rating: 3 },
  { id: "de_DE-thorsten_emotional-medium:whisper", engine: "piper", name: "Thorsten chuchoté", lang: "de", accent: "Allemagne", gender: "M", style: "Émotion : chuchotement, ASMR", rating: 3 },
  { id: "de_DE-thorsten_emotional-medium:amused", engine: "piper", name: "Thorsten amusé", lang: "de", accent: "Allemagne", gender: "M", style: "Émotion : amusé", rating: 3 },
  { id: "de_DE-thorsten-high", engine: "piper", name: "Thorsten", lang: "de", accent: "Allemagne", gender: "M", style: "Haute qualité", rating: 4 },
  { id: "it_IT-paola-medium", engine: "piper", name: "Paola", lang: "it", accent: "Italie", gender: "F", style: "Claire, narration", rating: 4 },
  { id: "pt_PT-tugão-medium", engine: "piper", name: "Tugão", lang: "pt", accent: "Portugal", gender: "M", style: "Neutre", rating: 3 },
  { id: "pt_BR-faber-medium", engine: "piper", name: "Faber", lang: "pt", accent: "Brésil", gender: "M", style: "Neutre", rating: 3 },
  { id: "nl_BE-nathalie-medium", engine: "piper", name: "Nathalie", lang: "nl", accent: "Belgique", gender: "F", style: "Claire", rating: 3 },
  { id: "nl_NL-mls-medium", engine: "piper", name: "Daan", lang: "nl", accent: "Pays-Bas", gender: "M", style: "Neutre", rating: 3 },
];

export const SAMPLE_TEXT: Record<Voice["lang"], string> = {
  fr: "Salut tout le monde ! Bienvenue sur ma chaîne. Aujourd'hui, je vous montre comment j'ai doublé mes vues en trente jours, sans dépenser un sou.",
  en: "Hey everyone, welcome back to the channel! Today I'm going to show you how I doubled my views in thirty days, without spending a dime.",
  es: "¡Hola a todos! Bienvenidos de nuevo al canal. Hoy les muestro cómo dupliqué mis visitas en treinta días.",
  de: "Hallo zusammen und willkommen zurück auf dem Kanal! Heute zeige ich euch, wie ich meine Aufrufe verdoppelt habe.",
  it: "Ciao a tutti e bentornati sul canale! Oggi vi mostro come ho raddoppiato le visualizzazioni.",
  pt: "Olá pessoal, bem-vindos de volta ao canal! Hoje vou mostrar como dobrei minhas visualizações em trinta dias.",
  nl: "Hallo allemaal en welkom terug op het kanaal! Vandaag laat ik zien hoe ik mijn weergaven heb verdubbeld.",
};
