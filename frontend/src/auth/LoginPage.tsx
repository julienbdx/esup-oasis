/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import { useAuth } from "@/auth/AuthProvider";
import { Alert, Avatar, Button, Col, Row, Spin } from "antd";
import React, { ReactElement } from "react";
import "@/auth/LoginPage.scss";
import { LoadingOutlined, LockFilled, LoginOutlined, MinusOutlined } from "@ant-design/icons";
import { useTypedText } from "@utils/TypedText/useTypedText";
import HomepageImage from "@controls/Images/HomepageImage";
import PageTitle from "@utils/PageTitle/PageTitle";
import { env } from "@/env";

/**
 * Renders the login page with authentication functionality.
 * Button to redirect to CAS authentication.
 *
 * @returns {ReactElement} The rendered login page component.
 */
export default function LoginPage(): ReactElement {
  const auth = useAuth();

  function getMessageAccueil() {
    if (env.REACT_APP_MSG_ACCUEIL) {
      return env.REACT_APP_MSG_ACCUEIL.split(";");
    }
    return [env.REACT_APP_ETABLISSEMENT, env.REACT_APP_TITRE];
  }

  const {
    text: typedText,
    fading: typedFading,
    showCursor,
    hideCursor,
  } = useTypedText({
    strings: getMessageAccueil(),
    typeSpeed: 40,
    startDelay: 250,
    backDelay: 1500,
  });

  return (
    <>
      <PageTitle />
      <Row style={{ minHeight: "calc(100vh - 70px)" }}>
        <Col xs={0} sm={24} md={24} lg={16} className="login-image" onClick={auth.authenticate}>
          <HomepageImage className="pointer" />
        </Col>
        <Col xs={24} sm={24} md={24} lg={8} className="login-form">
          <main className="content" style={{ minHeight: "50vh" }}>
            {auth.loading && (
              <Spin
                aria-label="Chargement en cours"
                indicator={<LoadingOutlined style={{ fontSize: 64 }} />}
                fullscreen
                size="large"
              />
            )}
            <Avatar icon={<LockFilled />} size={64} style={{ backgroundColor: "#000" }} />
            <h1 aria-label={`${env.REACT_APP_ETABLISSEMENT} : ${env.REACT_APP_TITRE}`}>
              <span
                aria-hidden
                style={{ transition: "opacity 0.6s", opacity: typedFading ? 0 : 1 }}
              >
                {typedText}
                {showCursor && (
                  <span
                    className="typed-cursor"
                    style={hideCursor ? { visibility: "hidden" } : undefined}
                  >
                    |
                  </span>
                )}
              </span>
            </h1>
            <Button
              loading={auth.loading}
              type="primary"
              onClick={auth.authenticate}
              className="mb-2"
              style={{ marginTop: 0, textTransform: "uppercase" }}
              size="large"
              icon={<LoginOutlined />}
              aria-label="Se connecter à l'application"
            >
              Se connecter
            </Button>
            {auth.error && (
              <Alert type="error" description={auth.error} className="mt-24" showIcon />
            )}

            <div className="info fs-09">
              La connexion à l'application se fait en utilisant vos identifiants fournis par{" "}
              {env.REACT_APP_ETABLISSEMENT_ARTICLE}.<br />
              {env.REACT_APP_INFOS_AUTH && (
                <a target="_blank" href={env.REACT_APP_INFOS_AUTH} rel="noreferrer">
                  En savoir plus
                </a>
              )}
            </div>
          </main>

          {env.REACT_APP_LOGO && (
            <div className="login-footer">
              <a
                href={env.REACT_APP_ETABLISSEMENT_URL as string}
                target="_blank"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
                aria-label={`Visiter le site de ${env.REACT_APP_ETABLISSEMENT}`}
              >
                <img
                  src={env.REACT_APP_LOGO}
                  alt=""
                  style={{
                    maxWidth: "50vw",
                    maxHeight: "10vh",
                    width: "100%",
                    objectFit: "scale-down",
                  }}
                  aria-hidden="true"
                />
              </a>
            </div>
          )}
        </Col>
      </Row>

      <footer className="bg-light-grey">
        <Row className="pt-2 pb-2">
          <Col span={24} className="text-center fs-09">
            Des cookies sont utilisés afin de garantir le bon fonctionnement de l'application. En
            continuant, vous acceptez l'utilisation de ces cookies. Pour en savoir plus, merci de
            contacter{" "}
            <a style={{ whiteSpace: "nowrap" }} href={`mailto:${env.REACT_APP_EMAIL_SERVICE}`}>
              le service {env.REACT_APP_SERVICE}
            </a>
            .
            <br />
            <a href="/rgpd">Politique d'utilisation des données</a> <MinusOutlined aria-hidden />{" "}
            <a href="/credits">Mentions légales & crédits</a>
          </Col>
        </Row>
      </footer>
    </>
  );
}
