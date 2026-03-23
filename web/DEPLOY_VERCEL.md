# Guida al Deploy su Vercel (Backend)

Per far girare il backend `web` su Vercel, segui questi passaggi:

### 1. Importa il Progetto
1. Accedi a [Vercel](https://vercel.com/) e clicca su **"Add New"** -> **"Project"**.
2. Collega il tuo account GitHub e seleziona la repo `AI-Fact_Checking_Plugin`.

### 2. Configurazione Automatica (`vercel.json`)
Ho aggiunto un file `vercel.json` nella root del progetto. Grazie a questo, Vercel dovrebbe capire automaticamente che:
- Deve entrare nella cartella `web`.
- Deve eseguire i comandi lì dentro.

Se per qualche motivo non dovesse farlo, nella schermata di configurazione di Vercel:
- **Root Directory**: Imposta manualmente `web`.

### 3. Variabili d'Ambiente (Dashboard Vercel)
Vanno inserite nella Dashboard di Vercel (sotto "Settings" -> "Environment Variables"). Anche se il codice è in `web/`, Vercel le renderà disponibili a tutto il processo di esecuzione.
- **Key**: `GOOGLE_AI_KEY`
- **Value**: `[Tua Chiave API]`

### 4. Deploy
Clicca su **Deploy**. Vercel ti fornirà un URL pubblico (es. `https://ai-fact-checking-web.vercel.app`).

---

### ⚠️ IMPORTANTE: Aggiorna l'Estensione
Una volta che il backend è online, devi dire all'estensione di non chiamare più `localhost:3000` ma il nuovo URL di Vercel:

1. Apri `extension/dist/sidepanel.js`.
2. Trova la riga:
   ```javascript
   const res = await fetch('http://localhost:3000/api/analyze', ...);
   ```
3. Sostituiscila con:
   ```javascript
   const res = await fetch('https://IL-TUO-URL-VERCEL.vercel.app/api/analyze', ...);
   ```
4. Fai lo stesso se hai altri file che puntano a localhost.
5. Inserisci il nuovo URL anche nel `manifest.json` alla voce `host_permissions`.
