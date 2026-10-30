export const CATEGORY_QUOTES = {
  smoking: [
    { text: 'Plămânii tăi încep să se regenereze în primele 72 de ore după ultima țigară.', author: 'WHO' },
    { text: 'Nu renunți la ceva ce îți place — câștigai libertatea față de ceva ce te controla.', author: 'Allen Carr' },
    { text: 'Fiecare zi fără tutun e o zi câștigată pentru cei care te iubesc.', author: 'Progres 100' },
    { text: 'Sevrajul durează câteva zile. Libertatea durează toată viața.', author: 'Progres 100' },
    { text: 'Nicotina creează iluzia că fumatul calmează — de fapt, retrage anxietatea pe care a creat-o.', author: 'Dr. John Tickell' },
  ],
  alcohol: [
    { text: 'Nu e vorba de voință slabă. E vorba de un creier care a învățat să supraviețuiască cu alcool.', author: 'Dr. Gabor Maté' },
    { text: 'Sobrietatea nu e o pedeapsă. E un cadou pe care ți-l faci ție însuți în fiecare zi.', author: 'Progres 100' },
    { text: 'Prima săptămână e cea mai grea. Al doilea an e cel mai frumos.', author: 'Alcoolicii Anonimi' },
    { text: 'Recăderile nu șterg progresul. Ele fac parte din drum.', author: 'Progres 100' },
    { text: 'Curajul de a fi sobru este mai rar și mai prețios decât curajul de a bea.', author: 'Progres 100' },
  ],
  social_media: [
    { text: 'Atenția ta este cea mai valoroasă resursă. Fii atent la cine ți-o furi.', author: 'Cal Newport' },
    { text: 'Rețelele sociale sunt concepute de cele mai inteligente minți pentru a-ți ocupa timpul. Rezistența e un act de curaj.', author: 'Tristan Harris' },
    { text: 'Viața reală nu are like-uri, dar are momente pe care nu le poți captura într-o poză.', author: 'Progres 100' },
    { text: 'Plictiseala este sala de așteptare a creativității.', author: 'Progres 100' },
    { text: 'Fiecare oră fără scroll este o oră trăită, nu vizionată.', author: 'Progres 100' },
  ],
  junk_food: [
    { text: 'Nu ai nevoie de voință mai multă. Ai nevoie de un mediu mai bun.', author: 'Dr. Brian Wansink' },
    { text: 'Mâncarea e combustibil, nu recompensă și nici pedeapsă.', author: 'Progres 100' },
    { text: 'Corpul tău nu vrea junk food — vrea nutrienți. Diferența e procesul de marketing.', author: 'Michael Pollan' },
    { text: 'Mâncat cu atenție pentru 30 de zile schimbă relația cu mâncarea pentru totdeauna.', author: 'Progres 100' },
    { text: 'Nu e vorba de diete. E vorba de a trata corpul cu același respect cu care l-ai trata pe un prieten drag.', author: 'Progres 100' },
  ],
  gambling: [
    { text: 'Cazinoul nu câștigă niciodată din noroc. Tu nu pierzi niciodată din ghinion.', author: 'Progres 100' },
    { text: 'Cel mai mare câștig pe care îl poți obține este libertatea financiară față de jocuri.', author: 'Progres 100' },
    { text: 'Creierul care a jucat nu e același cu creierul care decide să joace. Cunoaște distincția.', author: 'Dr. Marc Potenza' },
    { text: 'Fiecare zi fără joc e o zi în care tu controlezi banii, nu invers.', author: 'Progres 100' },
    { text: 'Adrenalina câștigului e reală. La fel e și distrugerea pe care o lasă urmă.', author: 'Jucătorii Anonimi' },
  ],
  procrastination: [
    { text: 'Nu amâna ce poți face azi — nu pentru că mâine e prea târziu, ci pentru că azi ești mai odihnit.', author: 'Progres 100' },
    { text: 'Orice sarcină devine mai mică odată ce ai început-o.', author: 'Progres 100' },
    { text: 'Procrastinarea nu e lene. E frică deghizată. Și frica se tratează cu acțiune, nu cu așteptare.', author: 'Dr. Timothy Pychyl' },
    { text: 'Viitorul tău îți mulțumește pentru fiecare oră din prezent în care ai ales munca.', author: 'Progres 100' },
    { text: 'Nu ai nevoie de inspirație ca să începi. Ai nevoie să începi pentru a găsi inspirația.', author: 'Chuck Close' },
  ],
  sugar: [
    { text: 'Corpul tău nu are nevoie de zahăr adăugat. Are nevoie de energie. Diferența e esențială.', author: 'Progres 100' },
    { text: 'Primele 3 zile fără zahăr rafinat sunt grele. A 30-a zi e libertate.', author: 'Progres 100' },
    { text: 'Zahărul nu e mâncare. E un drog legal cu aceleași mecanisme de dependență ca nicotina.', author: 'Dr. Robert Lustig' },
    { text: 'Pofta de dulce nu e o slăbiciune — e o nevoie emoțională în căutarea unei soluții rapide.', author: 'Progres 100' },
    { text: 'Fiecare zi fără zahăr rafinat e o zi în care pancreasul tău respiră.', author: 'Progres 100' },
  ],
  caffeine: [
    { text: 'Cofeina nu îți dă energie. Îți împrumută energie din viitor pe care trebuie să o returnezi cu dobândă.', author: 'Matthew Walker' },
    { text: 'Somnul odihnitor face mai mult pentru concentrare decât orice cantitate de cafea.', author: 'Progres 100' },
    { text: 'Sevrajul de cofeină durează 7-10 zile. Claritatea mentală care urmează durează luni.', author: 'Progres 100' },
    { text: 'Cel mai productiv creier e cel odihnit, nu cel stimulat chimic.', author: 'Progres 100' },
    { text: 'Încearcă să fii treaz și fără cofeină. Dacă nu poți, cofeina te deține, nu invers.', author: 'Progres 100' },
  ],
};

export function getQuoteForHabit(category) {
  const quotes = CATEGORY_QUOTES[category];
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return quotes[dayOfYear % quotes.length];
}
