/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useEffect, useState } from "react";
import { Button, Form, message, Modal, notification } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Evenement } from "../../../lib/Evenement";
import { useApi } from "../../../context/api/ApiProvider";
import { queryClient } from "../../../App";
import { arrayContainsDuplicates } from "../../../utils/array";
import { createDateAsUTC } from "../../../utils/dates";
import { TYPE_EVENEMENT_RENFORT } from "../../../constants";
import { IEvenement } from "../../../api/ApiTypeHelpers";
import { QK_EVENEMENTS, QK_STATISTIQUES_EVENEMENTS } from "../../../api/queryKeys";
import { UseStateDispatch } from "../../../utils/utils";
import { EvenementDupliquerForm, IDuplicationOptions } from "./EvenementDupliquerForm";

interface IEvenementDupliquerDrawer {
   evenement: Evenement;
   open: boolean;
   setOpen: UseStateDispatch<boolean>;
}

/**
 * Modale de duplication d'un évènement sur plusieurs jours.
 */
export default function EvenementDupliquerModal({
   evenement,
   open,
   setOpen,
}: IEvenementDupliquerDrawer): ReactElement {
   const [form] = Form.useForm();
   const [afficherAide, setAfficherAide] = useState(false);
   const [datesSelectionnees, setDatesSelectionnees] = useState<Date[]>([]);
   const [submitted, setSubmitted] = useState(false);
   const [options, setOptions] = useState<IDuplicationOptions>({
      horaire: true,
      typeEvenement: true,
      beneficiaire: true,
      intervenant: evenement.type === TYPE_EVENEMENT_RENFORT,
      suppleants: false,
      campus: true,
      salle: false,
      equipements: true,
      paiement: false,
   });

   const postEvenement = useApi().usePost({
      path: "/evenements",
      onSuccess: () => {
         window.setTimeout(() => {
            setDatesSelectionnees((prev) => prev.slice(1));
         }, 500);
      },
   });

   const handleClose = () => {
      setOpen(() => {
         queryClient.invalidateQueries({ queryKey: [QK_EVENEMENTS] }).then();
         queryClient.invalidateQueries({ queryKey: [QK_STATISTIQUES_EVENEMENTS] }).then();
         return false;
      });
   };

   function postEvenementDuplique() {
      if (datesSelectionnees.length > 0) {
         const date = datesSelectionnees[0];
         const debut = new Date(date);
         debut.setHours(
            evenement.debutDate()?.getHours() || 0,
            evenement.debutDate()?.getMinutes(),
         );
         const fin = new Date(date);
         fin.setHours(evenement.finDate()?.getHours() || 0, evenement.finDate()?.getMinutes());

         const nvoEvenement: IEvenement = {
            id: undefined,
            "@id": undefined,
            debut: createDateAsUTC(debut).toISOString(),
            fin: createDateAsUTC(fin).toISOString(),
            libelle: evenement.libelle,
            campus: evenement.campus,
            type: evenement.type,
            beneficiaires: options.beneficiaire ? evenement.beneficiaires : undefined,
            intervenant: options.intervenant ? evenement.intervenant : undefined,
            suppleants: options.suppleants ? evenement.suppleants : undefined,
            salle: options.salle ? evenement.salle : undefined,
            equipements: options.equipements ? evenement.equipements : undefined,
            tempsPreparation: options.paiement ? evenement.tempsPreparation : undefined,
            tempsSupplementaire: options.paiement ? evenement.tempsSupplementaire : undefined,
         };

         postEvenement.mutate({ data: nvoEvenement });
      } else {
         message.success("Évènement dupliqué avec succès").then();
         setSubmitted(false);
         handleClose();
      }
   }

   useEffect(() => {
      if (submitted) {
         postEvenementDuplique();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [submitted, datesSelectionnees]);

   const handleSubmit = (values: IDuplicationOptions) => {
      if (
         arrayContainsDuplicates(datesSelectionnees.map((d) => d.toISOString())) &&
         (values.intervenant || values.beneficiaire)
      ) {
         notification.error({
            message: "Duplication impossible",
            description:
               "Vous ne pouvez pas dupliquer un évènement sur le même jour avec un intervenant ou un bénéficiaire. Un utilisateur ne peut avoir 2 évènements sur le même créneau horaire.",
         });
         return;
      }
      setSubmitted(() => {
         setOptions(values);
         return true;
      });
   };

   return (
      <Modal
         destroyOnHidden
         title={
            <>
               {!afficherAide && (
                  <Button
                     className="float-right mr-5 p-0"
                     icon={<QuestionCircleOutlined />}
                     onClick={() => setAfficherAide(true)}
                     type="link"
                     style={{ marginTop: -7 }}
                  >
                     Aide
                  </Button>
               )}
               {"Dupliquer un évènement".toLocaleUpperCase()}
            </>
         }
         onOk={() => form.submit()}
         onCancel={handleClose}
         okButtonProps={{
            disabled: datesSelectionnees.length === 0,
         }}
         okText="Dupliquer"
         open={open}
         className="oasis-drawer"
         width={800}
         confirmLoading={submitted}
      >
         <EvenementDupliquerForm
            form={form}
            evenement={evenement}
            datesSelectionnees={datesSelectionnees}
            setDatesSelectionnees={setDatesSelectionnees}
            options={options}
            onFinish={handleSubmit}
            afficherAide={afficherAide}
            setAfficherAide={setAfficherAide}
         />
      </Modal>
   );
}
