/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React from "react";
import { App, Tabs } from "antd";
import { RoleValues, Utilisateur } from "../../../lib/Utilisateur";
import { useAuth } from "../../../auth/AuthProvider";
import { TabPersonneInformations } from "../../TabsContent/TabPersonneInformations";
import { TabCampuses } from "../../TabsContent/TabCampuses";
import { TabTypesEvenements } from "../../TabsContent/TabTypesEvenements";
import { TabCompetences } from "../../TabsContent/TabCompetences";
import { TabDisponibilites } from "../../TabsContent/TabDisponibilites";
import { TabProfils } from "../../TabsContent/TabProfils";
import { TabScolarite } from "../../TabsContent/TabScolarite";
import { TabAidesHumaines } from "../../TabsContent/TabAidesHumaines";
import { IUtilisateur } from "../../../api/ApiTypeHelpers";

interface UtilisateurDrawerTabsProps {
   role: RoleValues | string | undefined;
   utilisateur: Utilisateur;
   setUtilisateur: (u: Utilisateur) => void;
   activeKey: string;
   onChange: (key: string) => void;
   onClose: () => void;
   data: IUtilisateur;
}

export default function UtilisateurDrawerTabs({
   role,
   utilisateur,
   setUtilisateur,
   activeKey,
   onChange,
   onClose,
   data,
}: UtilisateurDrawerTabsProps) {
   const auth = useAuth();
   const { message } = App.useApp();

   function getTabsByRole() {
      if (role === RoleValues.ROLE_INTERVENANT) {
         return [
            {
               key: "campus",
               label: `Campus`,
               children: <TabCampuses utilisateur={utilisateur} setUtilisateur={setUtilisateur} />,
            },
            {
               key: "categories",
               label: `Catégories`,
               children: (
                  <TabTypesEvenements utilisateur={utilisateur} setUtilisateur={setUtilisateur} />
               ),
            },
            {
               key: "competences",
               label: `Compétences`,
               children: (
                  <TabCompetences
                     utilisateur={utilisateur}
                     setUtilisateur={setUtilisateur}
                     label="Compétences de l'intervenant"
                  />
               ),
            },
            {
               key: "disponibilites",
               label: `Validité`,
               children: (
                  <TabDisponibilites
                     utilisateur={utilisateur as unknown as IUtilisateur}
                     setUtilisateur={setUtilisateur}
                     onArchive={() => {
                        message.success("Utilisateur archivé").then();
                        onClose();
                     }}
                  />
               ),
            },
         ];
      }

      if (role === RoleValues.ROLE_BENEFICIAIRE) {
         const tabs = [];
         if (auth.user?.isGestionnaire) {
            tabs.push({
               key: "profil",
               label: "Profil",
               children: <TabProfils utilisateur={utilisateur as unknown as IUtilisateur} />,
            });
         }

         tabs.push({
            key: "scolarite",
            label: `Scolarité`,
            children: <TabScolarite utilisateur={data} />,
         });

         tabs.push({
            key: "aidesHumaines",
            label: `Aides humaines`,
            children: <TabAidesHumaines utilisateur={data} />,
         });

         return tabs;
      }

      return [];
   }

   return (
      <Tabs
         activeKey={activeKey}
         onChange={onChange}
         items={[
            {
               key: "informations",
               label: `Informations`,
               children: <TabPersonneInformations />,
            },
            ...getTabsByRole(),
         ]}
      />
   );
}
