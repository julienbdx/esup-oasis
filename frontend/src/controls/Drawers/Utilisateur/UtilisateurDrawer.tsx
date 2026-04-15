/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useApi } from "../../../context/api/ApiProvider";
import { useDrawers } from "../../../context/drawers/DrawersContext";
import { Alert, App, Drawer, Form } from "antd";
import Spinner from "../../Spinner/Spinner";
import { getRoleLabel, RoleValues, Utilisateur } from "../../../lib/Utilisateur";
import { useAuth } from "../../../auth/AuthProvider";
import { queryClient } from "../../../App";
import { arrayUnique } from "../../../utils/array";
import {
   QK_BENEFICIAIRES,
   QK_COMPOSANTES,
   QK_INTERVENANTS,
   QK_STATISTIQUES_EVENEMENTS,
   QK_UTILISATEURS,
} from "../../../api/queryKeys";
import UtilisateurDrawerHeader from "./UtilisateurDrawerHeader";
import UtilisateurDrawerTabs from "./UtilisateurDrawerTabs";
import UtilisateurDrawerFooter from "./UtilisateurDrawerFooter";

interface IUtilisateurDrawerProps {
   id?: string;
   onClose?: () => void;
}

/**
 * Draws the user details in a drawer, allow edition
 *
 * @param {IUtilisateurDrawerProps} props - The props object.
 * @param {string} [props.id] - The user id.
 * @param {Function} [props.onClose] - The function to handle the onClose event.
 *
 * @returns {ReactElement} - The user details drawer component.
 */
export default function UtilisateurDrawer({ id, onClose }: IUtilisateurDrawerProps): ReactElement {
   const [role, setRole] = useState<RoleValues>();
   const [utilisateurId, setUtilisateurId] = useState(id);
   const [utilisateur, setUtilisateur] = useState<Utilisateur>();
   const { drawers, setDrawerUtilisateur } = useDrawers();
   const [form] = Form.useForm();
   const auth = useAuth();
   const [isBeneficiaireSansProfil, setIsBeneficiaireSansProfil] = useState(false);
   const [isIntervenantSansTypeEvenement, setIsIntervenantSansTypeEvenement] = useState(false);
   const [activeTab, setActiveTab] = useState("informations");
   const { message } = App.useApp();

   const getRole = useCallback((): RoleValues | string | undefined => {
      if (role) return role;
      if (utilisateur) return utilisateur.roleCalcule;
      return undefined;
   }, [role, utilisateur]);

   const handleClose = useCallback(() => {
      setActiveTab("informations");
      if (onClose) onClose();
      if (!id) setDrawerUtilisateur(undefined);
   }, [id, onClose, setDrawerUtilisateur]);

   // ----- API
   // Récupération des données
   const { data, isFetching } = useApi().useGetItem({
      path: "/utilisateurs/{uid}",
      url: utilisateurId as string,
      enabled: !!utilisateurId,
   });

   // Mutation de l'utilisateur
   const mutateUtilisateur = useApi().usePatch({
      path: "/utilisateurs/{uid}",
      invalidationQueryKeys: [
         QK_UTILISATEURS,
         QK_INTERVENANTS,
         QK_BENEFICIAIRES,
         QK_STATISTIQUES_EVENEMENTS,
      ],
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: [QK_COMPOSANTES] }).then();
         message.success("Utilisateur mis à jour").then();
         handleClose();
      },
   });

   // ----- FORM

   // Initialisation via contexte : UTILISATEUR
   useEffect(() => {
      if (!id) setUtilisateurId(drawers.UTILISATEUR);
   }, [id, drawers.UTILISATEUR]);

   // Initialisation via contexte : UTILISATEUR_ROLE
   useEffect(() => {
      if (!id) setRole(drawers.UTILISATEUR_ROLE);
   }, [id, drawers.UTILISATEUR_ROLE]);

   // Synchronisation des données data avec la variable utilisateur
   useEffect(() => {
      if (data) setUtilisateur(new Utilisateur(data));
   }, [data]);

   // Synchronisation de la variable utilisateur avec le formulaire
   useEffect(() => {
      form.resetFields();
      form.setFieldsValue(utilisateur);
   }, [form, utilisateur]);

   // --- Message alerte Bénéficiaire sans profil
   useEffect(() => {
      if (utilisateur && getRole() === RoleValues.ROLE_BENEFICIAIRE) {
         setIsBeneficiaireSansProfil(
            (auth.user?.isGestionnaire || false) &&
               (!utilisateur.profils || utilisateur.profils.length === 0),
         );
         setIsIntervenantSansTypeEvenement(false);
      }
   }, [auth.user, getRole, utilisateur]);

   // --- Message alerte Intervenant sans type evt
   useEffect(() => {
      if (utilisateur && getRole() === RoleValues.ROLE_INTERVENANT) {
         setIsIntervenantSansTypeEvenement(
            !utilisateur.typesEvenements || utilisateur.typesEvenements.length === 0,
         );
         setIsBeneficiaireSansProfil(false);
      }
   }, [getRole, utilisateur]);

   if (!data) return <Form form={form} />;
   if (isFetching || !utilisateur)
      return (
         <Form form={form}>
            <Spinner />
         </Form>
      );

   if (getRole() === "intervenant")
      return (
         <Form form={form}>
            <Alert title="Rôle de l'utilisateur inconnu" type="error" />
         </Form>
      );

   return (
      <Drawer
         destroyOnHidden
         title={
            role ? getRoleLabel(getRole() as RoleValues).toLocaleUpperCase() : "PROFIL UTILISATEUR"
         }
         placement="right"
         onClose={handleClose}
         open
         size="large"
         className="oasis-drawer"
      >
         <UtilisateurDrawerHeader utilisateur={utilisateur} />
         <Form<Utilisateur>
            layout="vertical"
            onFinish={(values) => {
               mutateUtilisateur.mutate({
                  "@id": utilisateur?.["@id"] as string,
                  data: {
                     ...{ ...values, nom: undefined, prenom: undefined, email: undefined },
                     roles: [...(utilisateur?.roles || []), getRole() as RoleValues]
                        .filter((r) => r !== RoleValues.ROLE_DEMANDEUR && r !== "ROLE_USER")
                        .filter(arrayUnique),
                  },
               });
            }}
            disabled={!auth.user?.isPlanificateur}
            form={form}
         >
            <UtilisateurDrawerTabs
               role={getRole()}
               utilisateur={utilisateur}
               setUtilisateur={setUtilisateur}
               activeKey={activeTab}
               onChange={(key) => setActiveTab(key)}
               onClose={handleClose}
               data={data}
            />
            <UtilisateurDrawerFooter
               activeTab={activeTab}
               isBeneficiaireSansProfil={isBeneficiaireSansProfil}
               isIntervenantSansTypeEvenement={isIntervenantSansTypeEvenement}
            />
         </Form>
      </Drawer>
   );
}
