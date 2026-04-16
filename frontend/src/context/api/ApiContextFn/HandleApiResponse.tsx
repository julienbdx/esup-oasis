/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

// API Response
import { Button, notification, Space } from "antd";
import { CopyOutlined, LoginOutlined } from "@ant-design/icons";
import { NavigateFunction } from "react-router-dom";
import { ReactElement } from "react";
import { RequestMethod } from "@context/api/ApiProvider";
import { queryClient } from "@/App";
import { AuthContextType } from "@/auth/AuthProvider";

export interface IErreurNotification {
  title: string;
  description: ReactElement;
  statusText?: string;
  duration: number;
}

// On stocke 1 sec la précédente erreur pour ne pas la représenter à l'utilisateur
let previousError: IErreurNotification = {
  title: "",
  description: <></>,
  statusText: "",
  duration: 0,
};

export async function handleApiResponse(
  requestMethod: RequestMethod,
  response: Response,
  navigate: NavigateFunction,
  auth: AuthContextType,
  options?: unknown,
  additionalInfos?: string,
  onError?: (notif: IErreurNotification) => void,
) {
  function afficherErreur(notif: IErreurNotification) {
    if (onError) {
      onError(notif);
      return;
    }

    if (previousError.title !== notif.title || previousError.statusText !== notif.statusText) {
      // Nouvelle erreur
      notification.error({ ...notif, duration: notif.duration || 5 });
      console.error(response, options);
      previousError = notif;

      window.setTimeout(() => {
        // Réinitialisation de l'erreur précédente après 1 sec
        previousError = {
          title: "",
          description: <></>,
          statusText: "",
          duration: 0,
        };
      }, 1500);
    }
  }

  if (response.status >= 400) {
    // Gestion des erreurs
    try {
      let notif: IErreurNotification = {
        title: "Erreur",
        description: (
          <>
            Erreur {response.status} : {response.statusText || "Erreur inconnue"}
          </>
        ),
        statusText: response.statusText || "Erreur inconnue",
        duration: 5,
      };

      const data = await response.json();
      if (response.status === 401) {
        window.setTimeout(() => {
          queryClient.clear();
          auth.signOut(() => navigate("/"));
        }, 1000);
        // Erreur d'authentification
        notif = {
          title: "Erreur d'authentification",
          description: (
            <Space orientation="vertical">
              <div>Votre session a expiré. Veuillez vous reconnecter.</div>
              <Button
                icon={<LoginOutlined />}
                onClick={() => window.location.assign(window.location.origin)}
              >
                Se reconnecter
              </Button>
            </Space>
          ),
          statusText: "Votre session a expiré. Veuillez vous reconnecter.",
          duration: 0,
        };
      } else if (data["hydra:description"] || data.detail) {
        const msg = data["hydra:description"] || data.detail;
        // Erreur avec message emabarqué
        notif = {
          title: "Une erreur a été détectée",
          statusText: msg,
          duration: 5,
          description: (
            <>
              Erreur {response.status} : {msg}
              <div className="mt-2">
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Statut : ${response.status}\n` +
                        `Description : ${msg}\n\n` +
                        `Méthode : ${requestMethod}\n` +
                        `URL : ${response.url}${
                          options ? `\nOptions : ${JSON.stringify(options, null, 2)}` : ""
                        }\n\n` +
                        `Infos supplémentaires : ${additionalInfos || "-"}`,
                    );
                  }}
                >
                  Copier
                </Button>
              </div>
            </>
          ),
        };
      }

      afficherErreur(notif);
    } catch {
      // Erreur inconnue
      afficherErreur({
        description: (
          <>
            Erreur {response.status} : {response.statusText || "Erreur inconnue"}
          </>
        ),
        title: "Erreur",
        statusText: response.statusText || "Erreur inconnue",
        duration: 5,
      });
    }

    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  // No content
  if (response.status === 204) return;

  return response.json();
}
