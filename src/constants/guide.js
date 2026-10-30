const GUIDES = {
  smoking: {
    what: 'Marchează în fiecare zi dacă ai fumat sau nu.',
    steps: [
      { emoji: '📅', when: 'Seara, înainte de culcare', how: 'Apasă „Zi reușită" dacă nu ai fumat deloc astăzi, sau „Recădere" dacă ai fumat.' },
      { emoji: '⚡', when: 'Când simți nevoia să fumezi', how: 'Apasă „Simt un impuls acum" — înregistrează intensitatea și ce ai simțit. Te ajută să înțelegi triggerele.' },
      { emoji: '🛡️', when: 'Zi extrem de dificilă', how: 'Folosește Zi de grație o singură dată pentru a-ți păstra streak-ul fără să marchezi o recădere.' },
    ],
  },
  alcohol: {
    what: 'Înregistrează zilnic dacă ai consumat alcool sau nu.',
    steps: [
      { emoji: '📅', when: 'Seara sau la finalul zilei', how: 'Apasă „Zi reușită" dacă nu ai băut, sau „Recădere" dacă ai consumat alcool.' },
      { emoji: '⚡', when: 'Când simți pofta de a bea', how: 'Deschide Urge Mode imediat — notează intensitatea și contextul. E un instrument de autocunoaștere, nu de judecată.' },
      { emoji: '🛡️', when: 'Situație excepțională', how: 'Zi de grație îți protejează streak-ul pentru o zi pe care nu ai putut-o controla complet.' },
    ],
  },
  social_media: {
    what: 'Urmărește zilnic dacă ai reușit să limitezi rețelele sociale.',
    steps: [
      { emoji: '📅', when: 'La finalul zilei', how: 'Marchează „Zi reușită" dacă ai respectat limita pe care ți-ai setat-o, sau „Recădere" dacă ai scrollat excesiv.' },
      { emoji: '⚡', when: 'Când simți nevoia să deschizi aplicațiile', how: 'Apasă Urge Mode — îți reamintește că impulsul trece în 10–15 minute fără să acționezi.' },
      { emoji: '🛡️', when: 'Zi cu mult stres sau o zi specială', how: 'O singură Zi de grație disponibilă — folosește-o cu înțelepciune.' },
    ],
  },
  junk_food: {
    what: 'Notează zilnic dacă ai evitat mâncarea nesănătoasă.',
    steps: [
      { emoji: '📅', when: 'Seara, după ultima masă', how: 'Marchează „Zi reușită" dacă nu ai consumat junk food azi, sau „Recădere" dacă ai cedat.' },
      { emoji: '⚡', when: 'Când simți pofta intensă', how: 'Deschide Urge Mode — înregistrează ce simți și ce ai mâncat în ziua respectivă. Ajută la identificarea tiparelor emoționale.' },
      { emoji: '🛡️', when: 'O ocazie socială sau o zi excepțională', how: 'Zi de grație menține streak-ul activ fără să te judeci.' },
    ],
  },
  gambling: {
    what: 'Monitorizează zilnic dacă ai jucat sau nu jocuri de noroc.',
    steps: [
      { emoji: '📅', when: 'La finalul fiecărei zile', how: 'Apasă „Zi reușită" dacă nu ai jucat și nu ai plasat niciun pariu, sau „Recădere" dacă ai jucat.' },
      { emoji: '⚡', when: 'Când simți dorința de a juca', how: 'Urge Mode te ajută să amâni decizia și să înregistrezi ce a declanșat impulsul — plictiseală, stres, tentație financiară.' },
      { emoji: '🛡️', when: 'Zi cu presiune extremă', how: 'Zi de grație disponibilă o singură dată pe toată durata obiceiului.' },
    ],
  },
  procrastination: {
    what: 'Evaluează zilnic dacă ai lucrat la sarcinile importante sau le-ai amânat.',
    steps: [
      { emoji: '📅', when: 'La finalul programului de lucru', how: 'Apasă „Zi reușită" dacă ai terminat cel puțin un task important, sau „Recădere" dacă ai amânat tot ce era prioritar.' },
      { emoji: '⚡', when: 'Când te surprinzi amânând', how: 'Urge Mode te ajută să notezi ce obicei de evitare ai avut — social media, Netflix, curățenie în loc de muncă.' },
      { emoji: '🛡️', when: 'Zi cu forță majoră (boală, urgență)', how: 'Zi de grație — fără penalizare pentru circumstanțe cu adevărat excepționale.' },
    ],
  },
  sugar: {
    what: 'Înregistrează zilnic dacă ai evitat zahărul rafinat și dulciurile procesate.',
    steps: [
      { emoji: '📅', when: 'Seara, după cină', how: 'Marchează „Zi reușită" dacă nu ai consumat zahăr adăugat sau dulciuri procesate, sau „Recădere" dacă ai cedat.' },
      { emoji: '⚡', when: 'Când simți pofta de dulce', how: 'Deschide Urge Mode — notează ora și contextul. Pofta de dulce este adesea o nevoie emoțională deghizată.' },
      { emoji: '🛡️', when: 'Un eveniment social cu tort sau dulciuri', how: 'Zi de grație — folosește-o pentru ocazii reale, nu pentru impulsuri de rutină.' },
    ],
  },
  caffeine: {
    what: 'Urmărești zilnic dacă ai redus sau eliminat cofeina.',
    steps: [
      { emoji: '📅', when: 'La prânz sau seara', how: 'Marchează „Zi reușită" dacă nu ai depășit limita zilnică setată (sau nu ai consumat deloc), sau „Recădere" dacă ai depășit-o.' },
      { emoji: '⚡', when: 'Când simți nevoia urgentă de cafea', how: 'Urge Mode îți amintește că senzația de oboseală fără cofeină este temporară și face parte din sevraj.' },
      { emoji: '🛡️', when: 'Zi cu program extrem sau privare de somn', how: 'Zi de grație — fără judecată pentru situații cu adevărat excepționale.' },
    ],
  },
};

export function getGuideForHabit(category) {
  return GUIDES[category];
}
