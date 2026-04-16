/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

import React from "react";
import { App, Button, Typography } from "antd";
import {
  ETAT_DEMANDE_NON_CONFORME,
  ETAT_DEMANDE_RECEPTIONNEE,
  EtatInfo,
  getEtatDemandeInfo,
} from "@lib/demande";
import { IDemande } from "@api/ApiTypeHelpers";
import { useApi } from "@context/api/ApiProvider";
import { queryClient } from "@/App";
import { FONCTIONNALITES, useQuestionnaire } from "@context/demande/QuestionnaireProvider";
import { QK_DEMANDES } from "@api/queryKeys";
import { useAuth } from "@/auth/AuthProvider";
import ConformiteSelectButton from "@controls/Demande/Avancement/ConformiteSelectButton";

interface EtapeBConformiteProps {
  etatDemande: EtatInfo;
  demande: IDemande;
}

export default function EtapeBConformite({ etatDemande, demande }: EtapeBConformiteProps) {
  const { message } = App.useApp();
  const { user } = useAuth();
  const { questUtils } = useQuestionnaire();
  const { data: membreCommission } = useApi().useGetItem({
    path: "/commissions/{commissionId}/membres/{uid}",
    url: `/commissions/${demande.idCommission}/membres/${user?.uid}`,
    enabled:
      demande.idCommission !== undefined && user?.uid !== undefined && user.isCommissionMembre,
  });

  const mutation = useApi().usePatch({
    path: demande["@id"] as "/demandes/{id}",
    invalidationQueryKeys: [QK_DEMANDES],
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/demandes", demande["@id"]] });
      message.success("Demande déclarée réceptionnée");
    },
  });

  if (etatDemande.id === ETAT_DEMANDE_RECEPTIONNEE)
    return (
      <>
        {questUtils?.isGrantedQuestionnaire(
          FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE,
          membreCommission?.roles,
        ) && <ConformiteSelectButton demande={demande} />}
      </>
    );

  if (etatDemande.etape < "B") return null;

  if (etatDemande.ordre === getEtatDemandeInfo(ETAT_DEMANDE_NON_CONFORME)?.ordre) {
    return (
      <>
        <Typography.Text type="danger">Demande non conforme</Typography.Text>
        {questUtils?.isGrantedQuestionnaire(FONCTIONNALITES.DECLARER_CONFORMITE_DEMANDE) && (
          <Button
            size="small"
            className="mt-1"
            onClick={() => {
              mutation.mutate({
                "@id": demande["@id"] as string,
                data: {
                  etat: ETAT_DEMANDE_RECEPTIONNEE,
                },
              });
            }}
          >
            Annuler
          </Button>
        )}
      </>
    );
  }

  return <Typography.Text>Demande conforme</Typography.Text>;
}
