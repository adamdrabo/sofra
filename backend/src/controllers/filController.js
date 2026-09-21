const RecettePubliee = require('../models/RecettePubliee');

async function publier(req, res, next) {
  try {
    const { titre, categorie, nombrePortions, tempsPreparation, ingredients, etapes } = req.body;
    const recette = await RecettePubliee.create({
      auteurId: req.compteId,
      titre,
      categorie,
      nombrePortions,
      tempsPreparation,
      ingredients,
      etapes
    });
    res.status(201).json(recette);
  } catch (err) {
    next(err);
  }
}

// Fil chronologique, sans tri ni classement par popularite (decision de produit).
async function consulterFil(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const taillePage = 20;
    const recettes = await RecettePubliee.find()
      .sort({ datePublication: -1 })
      .skip((page - 1) * taillePage)
      .limit(taillePage)
      .populate('auteurId', 'nomAffiche');
    res.json({ recettes, page });
  } catch (err) {
    next(err);
  }
}

module.exports = { publier, consulterFil };
