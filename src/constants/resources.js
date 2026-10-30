export const RESOURCES = {
  default: {
    books: [
      {
        id: 'atomic_habits',
        title: 'Atomic Habits',
        author: 'James Clear',
        emoji: '📗',
        desc: 'Cum schimbările mici de 1% creează transformări uriașe. Biblia schimbării de obiceiuri.',
        tags: ['obiceiuri', 'sisteme', 'identitate'],
      },
      {
        id: 'power_habit',
        title: 'Puterea Obiceiului',
        author: 'Charles Duhigg',
        emoji: '📘',
        desc: 'Explică bucla trigger-rutină-recompensă și cum poți rescrie obiceiuri nocive.',
        tags: ['neurologie', 'psihologie', 'transformare'],
      },
      {
        id: 'willpower',
        title: 'Willpower',
        author: 'Roy Baumeister',
        emoji: '📙',
        desc: 'Știința voinței: de ce se epuizează și cum o poți gestiona strategic.',
        tags: ['voință', 'autocontrol', 'știință'],
      },
    ],
    articles: [
      {
        id: 'urge_surfing_guide',
        title: 'Ce este Urge Surfing',
        emoji: '🏄',
        content: 'Urge Surfing este o tehnică mindfulness în care observi impulsul fără să acționezi. Impulsurile sunt ca valurile — cresc, ating un vârf și scad. Durata medie a unui impuls neîntărit este 15-20 de minute. Tehnica: 1) Observă impulsul ca pe un val. 2) Nu lupta cu el, nu te speria. 3) Descrie-l mental: "Simt o tensiune în piept, o dorință intensă". 4) Așteaptă. Valul va trece.',
      },
      {
        id: 'triggers_guide',
        title: 'Înțelege-ți triggerele',
        emoji: '🔑',
        content: 'Triggerele sunt stimuli care declanșează automat obiceiul. Există 5 categorii principale: 1) EMOȚIONALE — stres, anxietate, plictiseală, tristețe. 2) SOCIALE — presiune, singurătate, celebrare. 3) DE MEDIU — locuri, obiecte, ore din zi. 4) FIZICE — foame, oboseală, durere. 5) COGNITIVE — gânduri automate, ruminare. Identificarea triggerelor reduce puterea lor cu 40-60%.',
      },
      {
        id: 'relapse_guide',
        title: 'Recăderile fac parte din proces',
        emoji: '🔄',
        content: 'Modelul schimbării (Prochaska & DiClemente) arată că recăderile sunt o etapă normală, nu un eșec. Statistic, oamenii fac 2-8 tentative înainte de a renunța definitiv. O recădere nu anulează progresul neurologic. Creierul tău a format conexiuni noi. Ce contează: timpul până la reluare, nu numărul de recăderi.',
      },
    ],
    sfaturiImpuls: [
      'Bea un pahar mare de apă lent și conștient',
      'Fă 10 flotări sau 20 de squats — adrenalina fizică înlocuiește pe cea chimică',
      'Numără înapoi de la 100 din 7 în 7 (100, 93, 86...) — ocupă cortexul prefrontal',
      'Sună sau trimite un mesaj cuiva — conexiunea socială reduce impulsul',
      'Ieși afară exact 5 minute — schimbarea mediului schimbă starea',
      'Deschide Urge Mode și înregistrează — simpla înregistrare reduce intensitatea',
    ],
  },
  smoking: {
    books: [
      {
        id: 'easy_way',
        title: 'Metoda Ușoară de a Te Lăsa de Fumat',
        author: 'Allen Carr',
        emoji: '📕',
        desc: 'Cartea care a ajutat milioane să renunțe la fumat fără voință sau suferință.',
        tags: ['fumat', 'psihologie', 'clasic'],
      },
    ],
    facts: [
      '20 de minute după ultima țigară, tensiunea arterială scade',
      'După 48 ore, CO dispare din sânge și simțul mirosului revine',
      'După 2 săptămâni, circulația se îmbunătățește semnificativ',
      'Dependența fizică de nicotină durează 72 ore. Restul e psihologic.',
    ],
  },
  alcohol: {
    books: [
      {
        id: 'this_naked_mind',
        title: 'This Naked Mind',
        author: 'Annie Grace',
        emoji: '📗',
        desc: 'Schimbă perspectiva asupra alcoolului prin știință și introspecție, fără voință forțată.',
        tags: ['alcool', 'mindset', 'știință'],
      },
    ],
    facts: [
      'Alcoolul este un depresiv al sistemului nervos central, nu un stimulent',
      'Anxietatea "a doua zi" (hangxiety) e reală — alcoolul perturbă GABA și glutamat',
      'Somnul după alcool nu este odihnitor — suprima REM',
      'Toleranța crește în 2-3 săptămâni de consum regulat',
    ],
  },
  social_media: {
    books: [
      {
        id: 'deep_work',
        title: 'Deep Work',
        author: 'Cal Newport',
        emoji: '📘',
        desc: 'Cum să fii productiv în era distracțiilor. Include strategii concrete pentru digital detox.',
        tags: ['focus', 'productivitate', 'tech'],
      },
    ],
    facts: [
      'Scroll-ul infinit a fost designat pentru a produce dopamină în mod intermitent — același mecanism ca sloturile',
      'Verificarea telefonului în medie de 96 ori/zi în 2024',
      'Pauzele de 5+ secunde de la ecran reduc anxietatea semnificativ',
      'Notificările reduc capacitatea de concentrare chiar și fără a le verifica',
    ],
  },
};

export function getResourcesForHabit(category) {
  const specific = RESOURCES[category] || {};
  return {
    books: [...(specific.books || []), ...RESOURCES.default.books],
    articles: RESOURCES.default.articles,
    sfaturiImpuls: RESOURCES.default.sfaturiImpuls,
    facts: specific.facts || [],
  };
}
