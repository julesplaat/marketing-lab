# Rinse&Go Marketing Lab

Interne webapp voor het opzetten, evalueren en leren van marketingexperimenten.

## Lokaal starten

```bash
npm install
npm run dev
```

Open `http://localhost:5173/rinsego-marketing-lab/` in je browser.

## Bouwen voor productie

```bash
npm run build
```

De output staat in de `dist/` map.

## Deployen naar GitHub Pages

### Optie 1: Automatisch via gh-pages

```bash
npm run deploy
```

Dit bouwt de app en pusht de `dist/` map naar de `gh-pages` branch.

### Optie 2: Handmatig via GitHub Actions

1. Push de code naar je repository
2. Ga naar **Settings → Pages**
3. Kies als source: **GitHub Actions**
4. Maak een workflow aan (zie `.github/workflows/deploy.yml` hieronder)

### Optie 3: Handmatig via gh-pages branch

```bash
npm run build
git subtree push --prefix dist origin gh-pages
```

## GitHub Pages base path

De app is geconfigureerd voor deployment op `https://<username>.github.io/rinsego-marketing-lab/`.

Als je repository een andere naam heeft, pas dan `base` aan in `vite.config.js`:

```js
base: '/jouw-repo-naam/',
```

## Data-opslag

- Alle data wordt opgeslagen in `localStorage` onder de key `rinsego_marketing_lab_v1`
- Data blijft behouden na page refresh
- Gebruik de **Instellingen** pagina om back-ups te exporteren/importeren
- Bij eerste bezoek worden demo-experimenten geladen

## Technische stack

- **React 18** met functionele components en hooks
- **React Router** (HashRouter voor GitHub Pages compatibiliteit)
- **Vite** als build tool
- **Lucide React** voor iconen
- **localStorage** voor data-persistentie
- Geen backend, geen externe services, geen login
