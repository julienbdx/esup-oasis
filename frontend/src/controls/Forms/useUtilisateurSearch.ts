/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useState } from "react";
import { RoleValues } from "@lib/Utilisateur";
import { useApi } from "@context/api/ApiProvider";

export interface IUseUtilisateurSearchProps {
   utilisateurId?: string;
   roleUtilisateur?: RoleValues;
   intervenantArchive?: boolean;
   existeNumeroEtudiant?: boolean;
   forcerRechercheEnBase?: boolean;
}

function getPath(forcerRechercheEnBase = false, roleUtilisateur?: string) {
   if (forcerRechercheEnBase) {
      return "/utilisateurs";
   }

   switch (roleUtilisateur) {
      case RoleValues.ROLE_INTERVENANT:
         return "/intervenants";
      case RoleValues.ROLE_BENEFICIAIRE:
         return "/beneficiaires";
      case RoleValues.ROLE_RENFORT:
         return "/renforts";
      case RoleValues.ROLE_ENSEIGNANT:
      default:
         return "/utilisateurs";
   }
}

function getFiltre(
   forcerRechercheEnBase = false,
   roleUtilisateur?: string,
   recherche?: string,
   intervenantArchive?: boolean,
   existeNumeroEtudiant?: boolean,
) {
   if (forcerRechercheEnBase) {
      return {
         // recherche LDAP
         recherche: recherche,
         intervenantArchive,
         "exists[numeroEtudiant]": existeNumeroEtudiant,
      };
   }

   if (getPath(forcerRechercheEnBase, roleUtilisateur) === "/utilisateurs") {
      return {
         // recherche LDAP
         term: recherche,
         intervenantArchive,
         "exists[numeroEtudiant]": existeNumeroEtudiant,
      };
   } else {
      return {
         // recherche en base
         recherche: recherche,
         intervenantArchive,
         "exists[numeroEtudiant]": existeNumeroEtudiant,
      };
   }
}

export const useUtilisateurSearch = ({
   utilisateurId,
   roleUtilisateur,
   intervenantArchive,
   existeNumeroEtudiant,
   forcerRechercheEnBase,
}: IUseUtilisateurSearchProps) => {
   const [tappedSearch, setTappedSearch] = useState("");
   const [search, setSearch] = useState("");
   const itemsPerPage = 25;

   const { data: dataUtilisateur, isFetching: isFetchingUtilisateur } = useApi().useGetItem({
      path: "/utilisateurs/{uid}",
      url: utilisateurId as string,
      enabled: !!utilisateurId,
   });

   const { data: utilisateursTrouves, isFetching: isFetchingUtilisateursTrouves } =
      useApi().useGetCollectionPaginated({
         path: getPath(forcerRechercheEnBase, roleUtilisateur),
         page: 1,
         itemsPerPage: itemsPerPage,
         enabled: search.length > 1,
         query: getFiltre(
            forcerRechercheEnBase,
            roleUtilisateur,
            search,
            intervenantArchive,
            existeNumeroEtudiant,
         ),
      });

   return {
      tappedSearch,
      setTappedSearch,
      search,
      setSearch,
      itemsPerPage,
      dataUtilisateur,
      isFetchingUtilisateur,
      utilisateursTrouves,
      isFetchingUtilisateursTrouves,
   };
};
