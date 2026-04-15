/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { useEffect, useState } from "react";
import {
   App,
   Button,
   Checkbox,
   Empty,
   List,
   Popconfirm,
   Skeleton,
   Space,
   Tag,
   Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { ICommissionMembre, IUtilisateur } from "../../../api/ApiTypeHelpers";
import { useApi } from "../../../context/api/ApiProvider";
import { QK_COMMISSIONS_MEMBRES, QK_ROLES_UTILISATEURS } from "../../../api/queryKeys";
import { RoleValues, Utilisateur } from "../../../lib/Utilisateur";
import { UtilisateurAvatar } from "../../Avatars/UtilisateurAvatar";
import { NB_MAX_ITEMS_PER_PAGE } from "../../../constants";
import { CommissionsMemberAddForm } from "./CommissionsMemberAddForm";

interface CommissionsMembersListProps {
   commissionId: string | undefined;
}

function CommissionsEditionMembreRole(props: { membre: ICommissionMembre }) {
   const { message } = App.useApp();
   const [editing, setEditing] = useState<boolean>(false);
   const [attribuerProfil, setAttribuerProfil] = useState<boolean>(
      props.membre.roles?.includes(RoleValues.ROLE_ATTRIBUER_PROFIL) as boolean,
   );
   const [validerConformite, setValiderConformite] = useState<boolean>(
      props.membre.roles?.includes(RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE) as boolean,
   );

   const mutationPut = useApi().usePut({
      path: "/commissions/{commissionId}/membres/{uid}",
      invalidationQueryKeys: [QK_COMMISSIONS_MEMBRES, QK_ROLES_UTILISATEURS],
      onSuccess: () => {
         message.success("Le membre a bien été modifié").then();
         setEditing(false);
      },
   });

   if (editing) {
      return (
         <Space orientation="vertical" className="mt-2">
            <div>
               <Checkbox
                  className="mr-1"
                  checked={validerConformite}
                  onChange={(e) => setValiderConformite(e.target.checked)}
               >
                  Valider la conformité des demandes
               </Checkbox>
            </div>
            <div>
               <Checkbox
                  className="mr-1"
                  checked={attribuerProfil}
                  onChange={(e) => setAttribuerProfil(e.target.checked)}
               >
                  Attribuer le profil aux bénéficiaires
               </Checkbox>
            </div>
            <div className="mt-2">
               <Space>
                  <Button
                     type="primary"
                     onClick={() => {
                        mutationPut.mutate({
                           "@id": props.membre["@id"] as string,
                           data: {
                              roles: [
                                 validerConformite
                                    ? RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE
                                    : undefined,
                                 attribuerProfil ? RoleValues.ROLE_ATTRIBUER_PROFIL : undefined,
                              ].filter((r) => r !== undefined) as RoleValues[],
                           },
                        });
                     }}
                  >
                     Enregistrer
                  </Button>
                  <Button
                     onClick={() => {
                        setEditing(false);
                     }}
                  >
                     Annuler
                  </Button>
               </Space>
            </div>
         </Space>
      );
   }

   return (
      <Typography.Text
         type="secondary"
         editable={{
            tooltip: "Cliquez pour modifier les privilèges",
            onStart: () => {
               setEditing(true);
            },
         }}
      >
         {props.membre.roles?.includes(RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE) && (
            <Tag color="purple">Valider conformité</Tag>
         )}
         {props.membre.roles?.includes(RoleValues.ROLE_ATTRIBUER_PROFIL) && (
            <Tag color="purple">Attribuer profil</Tag>
         )}
         {!props.membre.roles?.includes(RoleValues.ROLE_VALIDER_CONFORMITE_DEMANDE) &&
            !props.membre.roles?.includes(RoleValues.ROLE_ATTRIBUER_PROFIL) &&
            "Aucun privilège"}
      </Typography.Text>
   );
}

function CommissionsEditionMembre(props: { membre: ICommissionMembre }) {
   const { message } = App.useApp();
   const [membreUtilisateur, setMembreUtilisateur] = useState<Utilisateur>();
   const { data: membre, isFetching } = useApi().useGetItem({
      path: "/utilisateurs/{uid}",
      url: props.membre.utilisateur,
      enabled: !!props.membre.utilisateur,
   });

   const mutationDelete = useApi().useDelete({
      path: "/commissions/{commissionId}/membres/{uid}",
      invalidationQueryKeys: [QK_COMMISSIONS_MEMBRES],
      onSuccess: () => {
         message.success("Le membre a bien été retiré de la commission").then();
      },
   });

   useEffect(() => {
      if (membre) setMembreUtilisateur(new Utilisateur(membre as IUtilisateur));
   }, [membre]);

   if (isFetching) return <Skeleton paragraph={{ rows: 1 }} active />;
   if (!membre) return null;

   return (
      <List.Item
         actions={[
            <Popconfirm
               key="delete"
               title="Voulez-vous vraiment retirer ce membre de la commission ?"
               onConfirm={() => {
                  mutationDelete.mutate({
                     "@id": props.membre["@id"] as string,
                  });
               }}
               okText="Oui"
               okType="danger"
               cancelText="Non"
            >
               <Button
                  icon={<DeleteOutlined aria-hidden />}
                  className="btn-danger-hover btn-label-hover"
               >
                  Supprimer
               </Button>
            </Popconfirm>,
         ]}
      >
         <List.Item.Meta
            title={`${membre?.nom} ${membre?.prenom}`}
            description={<CommissionsEditionMembreRole membre={props.membre} />}
            avatar={
               <UtilisateurAvatar
                  utilisateur={membre}
                  role={membreUtilisateur?.roleCalcule as RoleValues}
               />
            }
         />
      </List.Item>
   );
}

export const CommissionsMembersList: React.FC<CommissionsMembersListProps> = ({ commissionId }) => {
   const [ajouterMembre, setAjouterMembre] = useState<boolean>(false);
   const { data: membres, isFetching } = useApi().useGetCollection({
      path: "/commissions/{commissionId}/membres",
      query: {
         page: 1,
         itemsPerPage: NB_MAX_ITEMS_PER_PAGE,
      },
      parameters: {
         commissionId: commissionId as string,
      },
      enabled: !!commissionId,
   });

   if (isFetching) return <Skeleton paragraph={{ rows: 4 }} active />;

   if (!membres) return null;

   return (
      <>
         {ajouterMembre && (
            <CommissionsMemberAddForm
               commissionId={commissionId}
               onCancel={() => setAjouterMembre(false)}
               onSuccess={() => setAjouterMembre(false)}
            />
         )}
         <List
            className="ant-list-radius"
            header={
               commissionId && (
                  <div className="text-right">
                     <Button
                        key="ajouterMembre"
                        type="primary"
                        icon={<PlusOutlined aria-hidden />}
                        onClick={() => {
                           setAjouterMembre(true);
                        }}
                     >
                        Ajouter un membre
                     </Button>
                  </div>
               )
            }
         >
            {membres.items.map((membre) => (
               <CommissionsEditionMembre key={membre["@id"]} membre={membre} />
            ))}
            {membres.items.length === 0 && (
               <List.Item>
                  <Empty className="m-auto" description="Aucun membre dans cette commission" />
               </List.Item>
            )}
         </List>
      </>
   );
};
