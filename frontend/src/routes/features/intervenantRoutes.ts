/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { lazy } from "react";
import { IRoute } from "@routes/AppRoutes";
import { RoleValues } from "@lib/Utilisateur";

export const INTERVENANT_ROUTES: IRoute[] = [
  {
    path: "/profil",
    element: lazy(() => import("@routes/commun/MonProfil")),
    roles: [RoleValues.ROLE_BENEFICIAIRE, RoleValues.ROLE_INTERVENANT],
  },
  {
    path: "/dashboard",
    element: lazy(() => import("@routes/intervenant/dashboard/IntervenantDashboard")),
    roles: [RoleValues.ROLE_INTERVENANT],
  },
  {
    path: "/services-faits",
    element: lazy(() => import("@routes/intervenant/ServicesFaits/ServicesFaits")),
    roles: [RoleValues.ROLE_INTERVENANT],
  },
];
