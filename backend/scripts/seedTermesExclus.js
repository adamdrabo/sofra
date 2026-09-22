
require('dotenv').config({quiet: true})
const mongoose = require('mongoose')
const TermeExclu = require('../src/models/TermeExclu')

const PORC = 'Porc ou derive du porc'
const ALCOOL = 'Boisson alcoolisee ou ingredient a base d\'alcool'

const TERMES = [
  
  ['pork', PORC], ['bacon', PORC], ['ham', PORC], ['prosciutto', PORC], ['pancetta', PORC],
  ['lard', PORC], ['pepperoni', PORC], ['salami', PORC], ['chorizo', PORC], ['guanciale', PORC],
  ['mortadella', PORC], ['pork sausage', PORC], ['bratwurst', PORC], ['gelatin', PORC],
  
  ['wine', ALCOOL], ['beer', ALCOOL], ['rum', ALCOOL], ['vodka', ALCOOL], ['whiskey', ALCOOL],
  ['whisky', ALCOOL], ['bourbon', ALCOOL], ['brandy', ALCOOL], ['cognac', ALCOOL], ['gin', ALCOOL],
  ['tequila', ALCOOL], ['sake', ALCOOL], ['mirin', ALCOOL], ['sherry', ALCOOL], ['vermouth', ALCOOL],
  ['champagne', ALCOOL], ['liqueur', ALCOOL], ['marsala', ALCOOL],
]

async function main() {
    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI manquante dans .env')
        process.exit(1)
    }

    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })

     const operations = TERMES.map(([terme, raison]) => ({
    updateOne: {
      filter: { terme },
      update: { $setOnInsert: { terme, langue: 'en', raison, estActif: true } },
      upsert: true,
    },
  }))

    const resultat = await TermeExclu.bulkWrite(operations)
    const actifs = await TermeExclu.countDocuments({ estActif: true })

    console.log(`[seed] ${resultat.upsertedCount} termes ajoutes, ${actifs} termes actifs au total.`)
    await mongoose.connection.close()
}

main().catch(async (err) => {
  console.error('[seed] Echec :', err.message)
  await mongoose.connection.close().catch(() => {});
  process.exit(1)
})