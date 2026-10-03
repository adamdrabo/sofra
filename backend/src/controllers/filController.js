const mongoose = require('mongoose');
const RecettePubliee = require('../models/RecettePubliee');
const { ErreurApi } = require('../middleware/errorHandler');

function formater(doc) {
  const auteur = doc.auteurId && doc.auteurId.nomAffiche
    ? { id: doc.auteurId._id, nomAffiche: doc.auteurId.nomAffiche }
    : null; 
  const { auteurId, ...reste } = doc;
  return { ...reste, auteur };
}

async function listerFil(req, res) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limite = Math.min(50, Math.max(1, parseInt(req.query.limite, 10) || 20));


  const docs = await RecettePubliee.find()
    .sort({ datePublication: -1, _id: -1 })
    .skip((page - 1) * limite)
    .limit(limite + 1)
    .populate('auteurId', 'nomAffiche')
    .lean();

  const aSuite = docs.length > limite;
  res.json({ page, limite, aSuite, recettes: docs.slice(0, limite).map(formater) });
}

async function lireRecette(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ErreurApi(400, 'IDENTIFIANT_INVALIDE', 'Identifiant invalide.');
  }
  const doc = await RecettePubliee.findById(req.params.id).populate('auteurId', 'nomAffiche').lean();
  if (!doc) throw new ErreurApi(404, 'RECETTE_INTROUVABLE', 'Recette introuvable.');
  res.json({ recette: formater(doc) });
}

async function publierRecette(req, res) {
  const { titre, categorie, nombrePortions, tempsPreparation, ingredients, etapes } = req.body ?? {};


  const etapesNumerotees = Array.isArray(etapes)
    ? etapes.map((e, i) => ({ ordre: i + 1, texte: e?.texte }))
    : etapes;

  const recette = await RecettePubliee.create({
    auteurId: req.compte._id,
    titre,
    categorie,
    nombrePortions,
    tempsPreparation,
    ingredients,
    etapes: etapesNumerotees,
  });

  const doc = await RecettePubliee.findById(recette._id).populate('auteurId', 'nomAffiche').lean();
  res.status(201).json({ recette: formater(doc) });
}

module.exports = { listerFil, lireRecette, publierRecette };
