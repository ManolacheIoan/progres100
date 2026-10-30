import { TRIGGERS } from '../constants/triggers';


const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;


const FALLBACKS = {
  stress: [
    'Pune mâinile sub apă rece 30 de secunde — resetează sistemul nervos imediat. Impulsul va scădea în câteva minute.',
    'Scrie pe hârtie ce te stresează — externalizarea calmează mintea. Dă-ți 5 minute înainte de orice decizie.',
    'Ieși afară și mergi 5 minute — mișcarea și aerul scad cortizolul mai rapid decât orice altceva.',
  ],
  boredom: [
    'Fă 20 de genuflexiuni sau flotări acum — mișcarea fizică înlocuiește plictiseala instantaneu.',
    'Deschide un podcast sau sună pe cineva — redirecționează atenția complet. Impulsul dispare fără atenție.',
    'Fă un mic task de 5 minute: curăță ceva, scrie ceva, mișcă ceva. Acțiunea bate așteptarea.',
  ],
  anxiety: [
    'Tehnica 5-4-3-2-1: numără 5 lucruri vizibile, 4 tactile, 3 auditive — ancorează mintea în prezent imediat.',
    'Respiră în pătrat: 4 secunde inspir, 4 ținut, 4 expir, 4 pauză. Repetă de 3 ori și vei simți diferența.',
  ],
  social: [
    'Spune "am nevoie de câteva minute" și îndepărtează-te fizic — distanța reduce presiunea imediat.',
    'Nu ai nevoie de o justificare lungă pentru refuz. "Nu, mulțumesc" este un răspuns complet.',
  ],
  loneliness: [
    'Trimite un mesaj cuiva drag chiar acum — nu mai târziu, acum. Conexiunea reală bate orice substitut.',
    'Mergi într-un loc public: o cafenea, un parc — simpla prezență a altor oameni ajută mai mult decât pare.',
  ],
  celebration: [
    'Celebrează altfel: mâncare bună, muzică, un film. Meriti bucuria fără obiceiul vechi.',
    'Amintește-ți că succesul tău de până acum este tocmai motivul să continui. Nu rupe ceea ce ai construit.',
  ],
  habit: [
    'Înlocuiește reflexul cu o acțiune fizică mică: bea un pahar de apă sau plimbă-te 2 minute.',
    'Schimbă locul sau activitatea imediat — reflexul este legat de context, nu de nevoie reală.',
  ],
  anger: [
    'Ieși afară 5 minute — aerul și mișcarea sunt cel mai rapid anti-furie disponibil. Acum.',
    'Scrie tot ce simți fără filtru — hârtia poate conține furia. Corpul se va liniști după.',
  ],
  sadness: [
    'Permite-ți să simți tristețea — ea va trece. Obiceiul nu o rezolvă, doar o amână.',
    'Pune muzică instrumentală și stai cu sentimentul câteva minute. Nu trebuie să fugi de el.',
  ],
  tiredness: [
    'Dormi 20 de minute dacă poți — o repriză scurtă resetează mai bine decât orice stimulent.',
    'Impulsul vine din oboseală, nu din nevoie reală. Bea apă și mișcă-te 5 minute mai întâi.',
  ],
  hunger: [
    'Mănâncă ceva nutritiv acum — un fruct, nuci sau iaurt. Foamea fizică are o soluție simplă.',
    'Bea un pahar mare de apă și asteaptă 5 minute — foamea și setea se confundă frecvent.',
  ],
  environment: [
    'Schimbă-ți locul imediat — mutarea fizică slăbește asocierile vechi în câteva minute.',
    'Identifică ce din mediu a declanșat impulsul și îndepărtează-l sau ieși din acel spațiu.',
  ],
  other: [
    'Numără încet de la 10 la 1 și respiră între fiecare număr. Impulsul slăbește în câteva minute.',
    'Bea un pahar de apă rece și plimbă-te 5 minute. Distragerea fizică funcționează imediat.',
  ],
};

function getLocalSuggestion(trigger, intensity, usedIndex = -1) {
  const pool = FALLBACKS[trigger] || FALLBACKS.other;
  // Pick a different one than the last shown, prefer first for high intensity
  if (intensity >= 4 && usedIndex !== 0) return { text: pool[0], index: 0 };
  let idx = (usedIndex + 1) % pool.length;
  return { text: pool[idx], index: idx };
}


async function callClaude(habitName, triggerLabel, intensity, note) {
  if (!API_KEY) return null;

  const intensityWord = intensity >= 5 ? 'extrem de puternic' : intensity >= 4 ? 'puternic' : intensity >= 3 ? 'moderat' : 'slab';
  const noteClause = note?.trim() ? ` Context suplimentar: "${note.trim()}".` : '';

  const userMessage =
    `Persoana încearcă să renunțe la: ${habitName}. ` +
    `Impuls ${intensityWord} (${intensity}/5), declanșat de: ${triggerLabel}.${noteClause} ` +
    `Oferă un sfat practic în exact 2 propoziții scurte, calm și imediat aplicabil. ` +
    `Fără limbaj medical, fără explicații lungi, fără introduceri. Răspunde direct cu sfatul.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.content?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

const aiService = {
  getSupportMessage: async (dateImpuls, retryIndex = -1) => {
    const { habitName = 'obiceiul', trigger = 'other', intensity = 3, note = '' } = dateImpuls;
    const triggerEntry = TRIGGERS.find((t) => t.id === trigger);
    const triggerLabel = triggerEntry ? triggerEntry.label : 'un factor necunoscut';

    // Try AI first
    const aiText = await callClaude(habitName, triggerLabel, intensity, note);
    if (aiText) {
      return { text: aiText, isAI: true, localIndex: -1 };
    }

    const { text, index } = getLocalSuggestion(trigger, intensity, retryIndex);
    return { text, isAI: false, localIndex: index };
  },
};

export default aiService;