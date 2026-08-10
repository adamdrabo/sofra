# PlanSpot

PlantSpot — Nos choix de conception 

Exigences et cas d'utilisation 

Plateforme et stockage 

On développe sur iOS. Pour sauvegarder les données de l'utilisateur (ses plantes, ses emplacements enregistrés), on utilise Core Data en local sur l'appareil. 

On a choisi le mode invité, sans compte ni authentification. 
Core Data suffit pour tout garder localement, donc on n'a pas besoin de backend. 
Un compte ne servirait qu'à synchroniser entre plusieurs appareils, ce qui n'est pas nécessaire pour le MVP. 
Comme on a un seul type d'utilisateur, il n'y a pas de généralisation d'acteur dans le modèle. 
