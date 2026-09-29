import { CLES, ecrire, genererId, lire } from '../db/storage';

export const planRepository = {
  async creerPlan(nombrePersonnes, carte, deviseCode, repas) {
    const plans = await lire(CLES.PLANS_HEBDO, []);
    const maintenant = new Date().toISOString();
    const id = genererId();

    const nouveauPlan = {
      id,
      dateDebut: maintenant,
      nombrePersonnes,
      carte,
      deviseCode,
      dateCreation: maintenant,
      repas: repas.map((r) => ({
        id: genererId(),
        recetteId: r.recetteId ?? null,
        recetteExterneId: r.recetteExterneId ?? null,
        jourSemaine: r.jourSemaine,
        typeRepas: r.typeRepas,
        nombrePortions: r.nombrePortions
      }))
    };

    await ecrire(CLES.PLANS_HEBDO, [...plans, nouveauPlan]);
    return id;
  },

  async obtenirDernierPlan() {
    const plans = await lire(CLES.PLANS_HEBDO, []);
    if (plans.length === 0) return null;
    return [...plans].sort((a, b) => b.dateCreation.localeCompare(a.dateCreation))[0];
  },

  async listerRepas(planHebdoId) {
    const plans = await lire(CLES.PLANS_HEBDO, []);
    const plan = plans.find((p) => p.id === planHebdoId);
    return plan ? plan.repas : [];
  },

  async remplacerRepas(planHebdoId, repasId, recetteId) {
    const plans = await lire(CLES.PLANS_HEBDO, []);
    const misAJour = plans.map((plan) =>
      plan.id !== planHebdoId
        ? plan
        : {
            ...plan,
            repas: plan.repas.map((r) =>
              r.id === repasId ? { ...r, recetteId, recetteExterneId: null } : r
            )
          }
    );
    await ecrire(CLES.PLANS_HEBDO, misAJour);
  }
};