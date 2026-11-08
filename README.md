# Progres 100

[![CI](https://github.com/ManolacheIoan/progres100/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ManolacheIoan/progres100/actions/workflows/ci.yml)

**Aplicație mobilă pentru eliminarea obiceiurilor nocive și formarea consecvenței**

Proiect de licență — Ioan Manolache

---

## English summary

Bachelor's thesis project: a cross-platform mobile app (iOS and Android) that helps people break harmful habits such as smoking, alcohol, excessive social media use or procrastination. It combines daily progress tracking with behavioural psychology techniques and AI-generated tips (Claude API), with local fallback suggestions when offline. Data is stored on the device, with optional cloud sync. Built with React Native, Expo and Firebase. The app itself is in Romanian.

## Cuprins

1. [Descriere](#descriere)
2. [Obiective](#obiective)
3. [Funcționalități](#funcționalități)
4. [Tehnologii utilizate](#tehnologii-utilizate)
5. [Arhitectura aplicației](#arhitectura-aplicației)
6. [Structura proiectului](#structura-proiectului)
7. [Modelul de date](#modelul-de-date)
8. [Instalare și rulare](#instalare-și-rulare)
9. [Teste](#teste)
10. [Configurare](#configurare)
11. [Direcții de dezvoltare](#direcții-de-dezvoltare)

---

## Descriere

**Progres 100** este o aplicație mobilă cross-platform (iOS și Android) care ajută utilizatorii să renunțe la obiceiuri nocive precum fumatul, consumul de alcool, utilizarea excesivă a rețelelor sociale sau procrastinarea. Aplicația combină urmărirea zilnică a progresului cu tehnici din psihologia comportamentală și cu sugestii personalizate generate cu ajutorul inteligenței artificiale.

Interfața este integral în limba română, iar aplicația funcționează și offline, datele fiind stocate local pe dispozitiv, cu sincronizare opțională în cloud.

## Obiective

- Oferirea unui instrument simplu de monitorizare zilnică a progresului în renunțarea la un obicei.
- Sprijinirea utilizatorului în momentele de impuls prin exerciții și sugestii adaptate contextului.
- Identificarea tiparelor comportamentale (declanșatori, momente de recădere) prin statistici.
- Creșterea motivației prin serii, etape deblocabile și mesaje motivaționale.

## Funcționalități

| Modul | Descriere |
|---|---|
| **Onboarding** | Alegerea obiceiului, a motivației personale, a strategiei și a orei de reminder. |
| **Obiceiuri multiple** | 8 categorii: fumat, alcool, social media, mâncare nesănătoasă, jocuri de noroc, procrastinare, zahăr, cofeină. |
| **Check-in zilnic** | Marcarea zilei ca reușită sau înregistrarea unei recăderi, cu intensitate și declanșator. |
| **Modul Impuls** | Exerciții rapide (amânare 10 minute, respirație box, tehnica 5-4-3-2-1) și sugestii personalizate în funcție de declanșator. |
| **Sugestii AI** | Recomandări generate printr-un model de limbaj (Anthropic Claude API), cu sugestii locale predefinite în lipsa conexiunii. |
| **Serii și etape** | Etape deblocabile la 1, 3, 7, 14, 21, 30, 60, 90, 180 și 365 de zile. |
| **Istoric** | Calendar cu toate zilele și detalii pentru fiecare zi. |
| **Statistici** | Rata de succes, cea mai lungă serie, frecvența declanșatorilor. |
| **Jurnal** | Notițe personale despre stare și progres. |
| **Resurse** | Cărți și strategii recomandate pentru fiecare tip de obicei. |
| **Notificări** | Remindere zilnice configurabile. |
| **Profil și setări** | Poză de profil, temă întunecată/luminoasă, editare cont. |
| **Mod vizitator** | Utilizarea aplicației fără cont, cu acces limitat. |
| **Abonament Premium** | Prototip de flux de abonare (lunar/anual). Plata este simulată, fără procesare reală. |

## Tehnologii utilizate

| Tehnologie | Rol |
|---|---|
| **React Native 0.81** | Framework pentru aplicații mobile native cu JavaScript |
| **Expo SDK 54** | Platformă de dezvoltare, build și acces la API-urile dispozitivului |
| **React 19** | Bibliotecă UI; Context API pentru starea globală |
| **React Navigation 6** | Navigare cu tab-uri (bottom tabs) și stive de ecrane (native stack) |
| **AsyncStorage** | Persistență locală a datelor (offline-first) |
| **Firebase Authentication** | Autentificare utilizatori |
| **Cloud Firestore** | Sincronizarea datelor în cloud |
| **Anthropic Claude API** | Generarea sugestiilor personalizate în modul Impuls |
| **Expo Notifications** | Notificări locale programate |
| **Expo Image Picker** | Selectarea pozei de profil |

## Arhitectura aplicației

Aplicația urmează o arhitectură pe straturi:

```
┌──────────────────────────────────────────┐
│  Ecrane (screens) + Componente UI        │  prezentare
├──────────────────────────────────────────┤
│  Context (Auth, App, Theme)              │  stare globală
├──────────────────────────────────────────┤
│  Servicii (checkin, stats, milestone,    │  logică de business
│  journal, notification, ai, habit ...)   │
├──────────────────────────────────────────┤
│  storageService (AsyncStorage)           │  persistență locală
│  firestoreService (Firebase, opțional)   │  sincronizare cloud
└──────────────────────────────────────────┘
```

**Navigare:**

```
AppNavigator
├── AuthNavigator          (Login, Register, ForgotPassword)
├── OnboardingNavigator    (Habit, Reason, Strategy, Reminder)
└── MainTabNavigator
    ├── Acasă      → check-in, modul Impuls, jurnal, etape
    ├── Istoric    → detalii zi
    ├── Statistici
    └── Profil     → setări, obiceiuri, resurse, abonament
```

**Principii de proiectare:**

- **Offline-first:** toate datele sunt salvate local; Firebase se activează doar dacă este configurat.
- **Degradare elegantă:** în lipsa cheii API sau a conexiunii, modulul AI folosește sugestii locale.
- **Separarea responsabilităților:** ecranele nu accesează direct stocarea, ci trec prin servicii.

## Structura proiectului

```
Progres100/
├── App.js                  # Punctul de intrare, providerii de context
├── app.json                # Configurare Expo
├── assets/                 # Iconiță, splash screen
└── src/
    ├── components/         # Componente reutilizabile (Button, Card, ProgressBar ...)
    ├── config/             # Inițializare Firebase
    ├── constants/          # Conținut static: obiceiuri, exerciții, citate, etape, culori
    ├── context/            # AuthContext, AppContext, ThemeContext
    ├── navigation/         # Navigatoarele aplicației
    ├── screens/            # Ecranele, grupate pe module
    ├── services/           # Logica de business și accesul la date
    └── utils/              # Funcții ajutătoare
```

## Modelul de date

Datele locale sunt stocate în AsyncStorage, cu chei prefixate `@progres100:`.

- **Utilizator:** profil, setări, abonament.
- **Obiceiuri:** lista obiceiurilor urmărite și obiceiul activ.
- **Check-in-uri:** obiect indexat după dată (`YYYY-MM-DD`), cu status (reușită / recădere), intensitate și declanșator.
- **Impulsuri:** listă de evenimente cu declanșator, intensitate și rezultat.
- **Etape:** etapele deblocate și data deblocării.
- **Jurnal:** intrări text datate.

În Firestore, datele sunt organizate în documentul `users/{uid}` și subcolecțiile asociate.

## Instalare și rulare

**Cerințe:** Node.js 18+, npm, aplicația Expo Go pe telefon sau un emulator Android / simulator iOS.

```bash
git clone https://github.com/ManolacheIoan/progres100.git
cd progres100
npm install
cp .env.example .env     # completează valorile (opțional)
npx expo start
```

Apoi scanează codul QR cu Expo Go sau apasă `a` (Android) / `i` (iOS).

Build nativ:

```bash
npx expo run:android
npx expo run:ios
```

## Teste

Logica de calcul are teste unitare (Jest, preset `jest-expo`): zilele consecutive, cea mai lungă serie, rata de reușită pe 7 și 30 de zile, recăderile, declanșatorul cel mai frecvent, ziua cea mai grea și deblocarea etapelor. Stocarea locală și sincronizarea în cloud sunt simulate, iar data e fixă, ca rezultatele să fie aceleași la fiecare rulare.

```bash
npm test
```

Testele rulează automat pe GitHub Actions la fiecare push.

## Configurare

Fișierul `.env` (vezi `.env.example`) conține:

| Variabilă | Descriere | Obligatoriu |
|---|---|---|
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | Cheie pentru sugestiile AI | Nu — fără ea se folosesc sugestii locale |
| `EXPO_PUBLIC_FIREBASE_*` | Configurația proiectului Firebase | Nu — fără ea aplicația rulează doar local |

> **Notă de securitate:** variabilele `EXPO_PUBLIC_*` sunt incluse în aplicația compilată. Pentru o versiune de producție, apelurile către API-ul AI ar trebui mutate pe un server intermediar.

## Direcții de dezvoltare

- Integrarea unui procesator de plăți real (Stripe / App Store / Google Play Billing).
- Mutarea apelurilor AI pe un backend propriu (de ex. Firebase Cloud Functions).
- Grafice avansate și exportul datelor.
- Funcții sociale: parteneri de responsabilitate, grupuri de suport.
- Widget-uri pentru ecranul principal.
- Teste end-to-end pe dispozitiv (de exemplu cu Maestro sau Detox).

---

© 2026 Ioan Manolache. Proiect realizat în scop academic.
