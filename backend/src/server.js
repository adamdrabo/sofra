require('dotenv').config({ quiet: true })

const os = require('os')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const { connecterBase } = require('./config/db')
const { routeIntrouvable, gestionnaireErreurs } = require('./middleware/errorHandler');
const quota = require('./services/quotaService')
const authRoutes = require('./routes/authRoutes')
const filRoutes = require('./routes/filRoutes');
const planRoutes = require('./routes/planRoutes')

const VARIABLES_REQUISES = ['MONGODB_URI', 'JWT_SECRET', 'SPOONACULAR_KEY']
const manquantes = VARIABLES_REQUISES.filter((v) => !process.env[v])
if (manquantes.length > 0) {
  console.error(`[config] Variables manquantes dans .env : ${manquantes.join(', ')}`)
  console.error('[config] Copier .env.example vers .env et remplir les valeurs.')
  process.exit(1);
}
if (process.env.JWT_SECRET.length < 32) {
  console.warn('[config] JWT_SECRET est court (< 32 caracteres). Acceptable en dev, pas en production.')
}

const app = express()

// Les apps natives ne sont pas soumises au CORS, mais la version web d'Expo l'est.
app.use(cors());
// 100 ko suffit largement pour une recette ; au-dela, c'est un bogue ou un abus.
app.use(express.json({ limit: '100kb' }))

// Sonde de sante : l'app peut l'appeler pour "reveiller" un hebergement gratuit endormi
// et afficher un etat d'attente explicite (voir "Ce que la passerelle coute" dans le v5).
app.get('/api/sante', (req, res) => {
  res.json({
    ok: true,
    base: mongoose.connection.readyState === 1 ? 'connectee' : 'deconnectee',
    quota: quota.lireEtat(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/fil', filRoutes)
app.use('/api/plan', planRoutes)

app.use(routeIntrouvable)
app.use(gestionnaireErreurs)

function adressesReseau() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}

async function demarrer() {
  await connecterBase(process.env.MONGODB_URI);
  const port = Number(process.env.PORT) || 3000;

  const serveur = app.listen(port, '0.0.0.0', () => {
    console.log(`[serveur] Sofra ecoute sur le port ${port}`)
    for (const ip of adressesReseau()) console.log(`[serveur] Depuis le telephone : http://${ip}:${port}/api`);
  })

  serveur.on('error', (err) => {
    if (err.code === 'EADDRINUSE') console.error(`[serveur] Le port ${port} est deja utilise.`);
    else console.error('[serveur]', err);
    process.exit(1);
  })

  // Arret propre (Ctrl+C, redemarrage de l'hebergeur) : on ferme la base avant de quitter.
  const arreter = async () => {
    serveur.close()
    await mongoose.connection.close()
    process.exit(0)
  };
  process.on('SIGINT', arreter)
  process.on('SIGTERM', arreter)
}

demarrer()
