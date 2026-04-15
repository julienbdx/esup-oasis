/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useState } from "react";
import { App, UploadFile, UploadProps } from "antd";
import { RcFile } from "antd/es/upload";
import { MAX_FILE_SIZE } from "../../../constants";
import { envoyerFichierFetch } from "../../../utils/upload";
import { useAuth } from "../../../auth/AuthProvider";
import { env } from "../../../env";
import {
   QuestionnaireQuestion,
   useQuestionnaire,
} from "../../../context/demande/QuestionnaireProvider";
import { UploadOutlined } from "@ant-design/icons";

export function useQuestionFileUpload(question: QuestionnaireQuestion) {
   const { mode, form, questUtils, setSubmitting } = useQuestionnaire();
   const auth = useAuth();
   const { notification } = App.useApp();
   const [fileList, setFileList] = useState<UploadFile[]>(
      question.reponse?.piecesJustificatives?.map((pj) => ({
         uid: pj,
         name: "...",
         status: "done",
         url: pj,
      })) || [],
   );
   const [uploading, setUploading] = useState<boolean>(false);

   function envoyerReponse(
      reponse: string[],
      onSuccess: ((body: string) => void) | undefined,
      setNewFileList: () => void,
   ) {
      questUtils?.envoyerReponse(question["@id"] as string, "file", reponse, () => {
         onSuccess?.("ok");
         setNewFileList();
      });
   }

   function removeFile(pieceJustificativeId: string) {
      envoyerReponse(
         question.reponse?.piecesJustificatives?.filter((pj) => pj !== pieceJustificativeId) || [],
         () => {
            setFileList((prev) => {
               return prev.filter((f) => f.uid !== pieceJustificativeId);
            });
            form?.resetFields([question["@id"] as string]);
         },
         () =>
            setFileList((prev) => {
               return prev.filter((f) => f.uid !== pieceJustificativeId);
            }),
      );
   }

   const uploadProps: UploadProps = {
      name: "file",
      fileList: fileList,
      multiple: false,
      disabled: mode === "preview",
      customRequest: async (options) => {
         const { onSuccess, onError, file } = options;

         if (!file) {
            return;
         }

         if (typeof file === "object" && (file as RcFile).size > MAX_FILE_SIZE * 1024 * 1024) {
            notification.error({
               title: `Le fichier "${question.libelle}" dépasse la taille maximum autorisée (${MAX_FILE_SIZE} Mo).`,
               icon: <UploadOutlined className="text-danger" aria-hidden />,
            });
            return;
         }

         // envoi du fichier
         setUploading(true);
         setSubmitting(true);
         await envoyerFichierFetch(
            env.REACT_APP_API as string,
            auth,
            file,
            (pj) => {
               // envoi de la réponse avec l'ID du fichier
               envoyerReponse(
                  question.choixMultiple
                     ? [...(question.reponse?.piecesJustificatives || []), pj["@id"] as string]
                     : [pj["@id"] as string],
                  onSuccess,
                  () =>
                     setFileList((prev) => {
                        setUploading(false);
                        setSubmitting(false);

                        notification.success({
                           title: `Le fichier a été chargé.`,
                           icon: <UploadOutlined className="text-success" aria-hidden />,
                        });

                        // mise à jour du statut du fichier
                        return prev.map((f) => {
                           if (f.uid === (options.file as RcFile).uid) {
                              return {
                                 uid: pj["@id"] as string,
                                 name: f.name,
                                 status: "done",
                                 url: pj["@id"] as string,
                              };
                           }
                           return f;
                        });
                     }),
               );
            },
            (error) => {
               setFileList((prev) => {
                  notification.error({
                     title: `Erreur lors du chargement du fichier.`,
                     icon: <UploadOutlined className="text-danger" aria-hidden />,
                  });

                  // mise à jour de l'état du fichier
                  return prev.map((f) => {
                     setUploading(false);
                     setSubmitting(false);
                     if (f.uid === (options.file as RcFile).uid) {
                        return {
                           uid: f.uid,
                           name: f.name,
                           status: "error",
                           percent: undefined,
                        };
                     }
                     return f;
                  });
               });
               onError?.(error);
            },
         );
      },

      onChange(info) {
         const { status, originFileObj } = info.file;
         if (status === "uploading") {
            if (originFileObj) {
               if (!fileList.some((f) => f.uid === originFileObj.uid)) {
                  // ajout du fichier à la liste
                  setFileList((prev) => [...prev, originFileObj]);
               }
            }
         }
      },
   };

   return {
      fileList,
      setFileList,
      uploading,
      removeFile,
      uploadProps,
   };
}
