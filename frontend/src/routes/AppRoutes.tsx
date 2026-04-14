/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { ComponentType, lazy } from "react";
import { RoleValues } from "../lib/Utilisateur";

export interface IRoute {
   path: string;
   element: ComponentType;
   roles: RoleValues[] | null;
}

// --- Imports lazy ---
/**
 * Represents the routes configuration for the application
 * and the roles required to access them.
 *
 * @type {IRoute[]}
 */
export const APP_ROUTES: IRoute[] = [
   {
      path: "/rgpd",
      element: lazy(() => import("./commun/Rgpd")),
      roles: null,
   },
   {
      path: "/credits",
      element: lazy(() => import("./commun/MentionsLegales")),
      roles: null,
   },
   {
      path: "/versions",
      element: lazy(() => import("./commun/Version")),
      roles: null,
   },
   // --- Admin ---
   {
      path: "/administration/referentiels/parametres",
      element: lazy(() => import("./administration/Parametres/Parametres")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/bilans/services-faits",
      element: lazy(() => import("./administration/Bilans/ServicesFaits/ServicesFaits")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/bilans/financier",
      element: lazy(() => import("./administration/Bilans/BilanFinancier/BilanFinancier")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/bilans/activites",
      element: lazy(() => import("./administration/Bilans/BilanActivites/BilanActivites")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/utilisateurs",
      element: lazy(() => import("./administration/Utilisateurs/Utilisateurs")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/sportifs-haut-niveau",
      element: lazy(
         () => import("./administration/Referentiel/SportifsHautNiveau/SportifsHautNiveau"),
      ),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/types-amenagements",
      element: lazy(() => import("./administration/Referentiel/Amenagements/Amenagements")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/clubs-sportifs",
      element: lazy(() => import("./administration/Referentiel/ClubsSportifs/ClubsSportifs")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/referents",
      element: lazy(() => import("./administration/Referentiel/Referents/Referents")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/chartes",
      element: lazy(() => import("./administration/Referentiel/Chartes/Chartes")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/periodes-rh",
      element: lazy(() => import("./administration/Referentiel/PeriodeRh/PeriodesRh")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/types-evenements",
      element: lazy(() => import("./administration/Referentiel/TypeEvenement/TypesEvenements")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/profils",
      element: lazy(() => import("./administration/Referentiel/Profils/Profils")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/tags",
      element: lazy(() => import("./administration/Referentiel/Tags/CategoriesTags")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/types_demandes",
      element: lazy(() => import("./administration/TypesDemandes/TypesDemandes")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/commissions/:id",
      element: lazy(() => import("./administration/Commissions/Commissions")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/commissions",
      element: lazy(() => import("./administration/Commissions/Commissions")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration/referentiels/:referentielId",
      element: lazy(() => import("./administration/Referentiel/Referentiel")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   {
      path: "/administration",
      element: lazy(() => import("./administration/Administration")),
      roles: [RoleValues.ROLE_ADMIN],
   },
   // --- Gestionnaire / Chargé d'accompagnement ---
   {
      path: "/interventions/renforts",
      element: lazy(() => import("./gestionnaire/interventions/ValidationInterventionsRenforts")),
      roles: [RoleValues.ROLE_GESTIONNAIRE],
   },
   {
      path: "/bilans/intervenants",
      element: lazy(() => import("./beneficiaire/BilanBeneficiaireIntervenant")),
      roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
   },
   {
      path: "/bilans/beneficiaires",
      element: lazy(() => import("./beneficiaire/BilanBeneficiaireIntervenant")),
      roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
   },
   {
      path: "/beneficiaires/:id",
      element: lazy(() => import("./gestionnaire/beneficiaires/Beneficiaire")),
      roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_GESTIONNAIRE],
   },
   {
      path: "/bilans",
      element: lazy(() => import("./administration/Bilans/Bilans")),
      roles: [RoleValues.ROLE_GESTIONNAIRE],
   },
   // --- Gestionnaire / Planificateur ---
   {
      path: "/demandes/:id",
      element: lazy(() => import("./gestionnaire/demandeurs/Demande")),
      roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   {
      path: "/demandeurs/:id",
      element: lazy(() => import("./gestionnaire/demandeurs/Demandeur")),
      roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   {
      path: "/demandes/:id/saisie",
      element: lazy(() => import("./gestionnaire/demandeurs/Demande")),
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/demandeurs",
      element: lazy(() => import("./gestionnaire/demandeurs/Demandeurs")),
      roles: [RoleValues.ROLE_PLANIFICATEUR, RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   {
      path: "/beneficiaires",
      element: lazy(() => import("./gestionnaire/beneficiaires/Beneficiaires")),
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/amenagements",
      element: lazy(() => import("./gestionnaire/beneficiaires/Amenagements")),
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/intervenants",
      element: lazy(() => import("./gestionnaire/intervenants/Intervenants")),
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/interventions/forfait",
      element: lazy(() => import("./gestionnaire/interventions/InterventionsForfait")),
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/mes-interventions",
      element: lazy(() => import("../controls/Interventions/MesInterventions")),
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/dashboard",
      element: lazy(() => import("./gestionnaire/dashboard/GestionnaireDashboard")),
      roles: [RoleValues.ROLE_PLANIFICATEUR],
   },
   // --- Membres de commision ---
   {
      path: "/dashboard",
      element: lazy(() => import("./gestionnaire/demandeurs/Demandeurs")),
      roles: [RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   {
      path: "/demandes",
      element: lazy(() => import("./gestionnaire/demandeurs/Demandeurs")),
      roles: [RoleValues.ROLE_MEMBRE_COMMISSION],
   },
   // --- Référents ---
   {
      path: "/amenagements",
      element: lazy(() => import("./gestionnaire/beneficiaires/Amenagements")),
      roles: [RoleValues.ROLE_REFERENT_COMPOSANTE],
   },
   {
      path: "/dashboard",
      element: lazy(() => import("./gestionnaire/beneficiaires/Amenagements")),
      roles: [RoleValues.ROLE_REFERENT_COMPOSANTE],
   },
   // --- Intervenants & bénéficiaires ---
   {
      path: "/profil",
      element: lazy(() => import("./commun/MonProfil")),
      roles: [RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
   // --- Intervenants ---
   {
      path: "/dashboard",
      element: lazy(() => import("./intervenant/dashboard/IntervenantDashboard")),
      roles: [RoleValues.ROLE_INTERVENANT],
   },
   {
      path: "/services-faits",
      element: lazy(() => import("./intervenant/ServicesFaits/ServicesFaits")),
      roles: [RoleValues.ROLE_INTERVENANT],
   },
   // --- Bénéficiaires ---
   {
      path: "/dashboard",
      element: lazy(() => import("./beneficiaire/BeneficiaireDashboard")),
      roles: [RoleValues.ROLE_BENEFICIAIRE],
   },
   // --- Tous les utilisateurs disposant d'un rôle en rapport avec planification ---
   {
      path: "/planning/calendrier",
      element: lazy(() => import("../controls/Calendar/PlanningCalendar")),
      roles: [
         RoleValues.ROLE_ADMIN,
         RoleValues.ROLE_PLANIFICATEUR,
         RoleValues.ROLE_BENEFICIAIRE,
         RoleValues.ROLE_INTERVENANT,
      ],
   },
   {
      path: "/planning/liste-evenements",
      element: lazy(() => import("../controls/Calendar/PlanningTable")),
      roles: [
         RoleValues.ROLE_ADMIN,
         RoleValues.ROLE_PLANIFICATEUR,
         RoleValues.ROLE_BENEFICIAIRE,
         RoleValues.ROLE_INTERVENANT,
      ],
   },
   {
      path: "/planning/evenements-sans-beneficiaires",
      element: lazy(() => import("./gestionnaire/interventions/EvenementsSansBeneficiaires")),
      roles: [RoleValues.ROLE_ADMIN, RoleValues.ROLE_PLANIFICATEUR],
   },
   {
      path: "/planning",
      element: lazy(() => import("../controls/Calendar/PlanningWithSider")),
      roles: [
         RoleValues.ROLE_ADMIN,
         RoleValues.ROLE_PLANIFICATEUR,
         RoleValues.ROLE_BENEFICIAIRE,
         RoleValues.ROLE_INTERVENANT,
      ],
   },
   // --- Demandes ---
   {
      path: "/demandes/:id/saisie",
      element: lazy(() => import("./demandeur/DemandeSaisie")),
      roles: [RoleValues.ROLE_DEMANDEUR, RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
   {
      path: "/demandes/:id",
      element: lazy(() => import("./demandeur/DemandeAvancement")),
      roles: [RoleValues.ROLE_DEMANDEUR, RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
   {
      path: "/demandes",
      element: lazy(() => import("./demandeur/Demandes")),
      roles: [RoleValues.ROLE_DEMANDEUR, RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
   {
      path: "/dashboard",
      element: lazy(() => import("./demandeur/Demandes")),
      roles: [RoleValues.ROLE_DEMANDEUR],
   },
   {
      path: "/demande-soumise",
      element: lazy(() => import("../controls/Questionnaire/TypeDemandeSoumise")),
      roles: [RoleValues.ROLE_DEMANDEUR, RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
   },
];
