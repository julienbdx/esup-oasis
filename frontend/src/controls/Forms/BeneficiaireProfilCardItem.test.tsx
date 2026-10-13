/*
 * Copyright (c) 2024-2026. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 *
 */

import React from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";
import { axe } from "vitest-axe";
import { renderWithProviders } from "@/test";
import { IUtilisateur } from "@api";
import BeneficiaireProfilCardItem from "./BeneficiaireProfilCardItem";

const { profilItem } = vi.hoisted(() => ({
  profilItem: { current: undefined as Record<string, unknown> | undefined },
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetFullCollection: (query: { path: string }) => ({
      isFetching: false,
      data: {
        items:
          query.path === "/typologies"
            ? []
            : [{ "@id": "/profils/1", libelle: "Situation de handicap", avecTypologie: false }],
      },
    }),
    useGetItem: () => ({ isFetching: false, data: profilItem.current }),
  }),
}));

vi.mock("@controls/Items/GestionnaireItem", () => ({
  GestionnaireItem: () => <span>Lesley GREEN</span>,
}));

vi.mock("@controls/Forms/BeneficiaireProfilFormItemEdit", () => ({
  BeneficiaireProfilFormItemEdit: () => <div>Formulaire d'édition</div>,
}));

const utilisateur = { "@id": "/utilisateurs/1" } as IUtilisateur;

function profil(debut: dayjs.Dayjs, fin: dayjs.Dayjs, avecAccompagnement = true) {
  return {
    "@id": "/utilisateurs/1/profils/1",
    profil: "/profils/1",
    debut: debut.toISOString(),
    fin: fin.toISOString(),
    gestionnaire: "/utilisateurs/2",
    avecAccompagnement,
    typologies: [],
  };
}

const enCours = () => profil(dayjs().subtract(1, "month"), dayjs().add(1, "year"));
const termine = () => profil(dayjs().subtract(2, "year"), dayjs().subtract(1, "year"), false);

function renderCard(props: Partial<React.ComponentProps<typeof BeneficiaireProfilCardItem>> = {}) {
  return renderWithProviders(
    <BeneficiaireProfilCardItem
      value="/utilisateurs/1/profils/1"
      utilisateur={utilisateur}
      {...props}
    />,
  );
}

describe("BeneficiaireProfilCardItem", () => {
  it("indique par écrit qu'un profil est en cours et met son libellé en avant", () => {
    profilItem.current = enCours();
    renderCard();

    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.queryByText("Terminé")).not.toBeInTheDocument();
    expect(screen.getByText("Situation de handicap").closest("strong")).toBeInTheDocument();
  });

  it("indique par écrit qu'un profil est terminé, sans mise en avant", () => {
    profilItem.current = termine();
    renderCard();

    expect(screen.getByText("Terminé")).toBeInTheDocument();
    expect(screen.queryByText("En cours")).not.toBeInTheDocument();
    expect(screen.getByText("Situation de handicap").closest("strong")).not.toBeInTheDocument();
  });

  it("affiche le gestionnaire et le type d'accompagnement", () => {
    profilItem.current = enCours();
    const { rerender } = renderCard();

    expect(screen.getByText("Lesley GREEN")).toBeInTheDocument();
    expect(screen.getByText("Avec accompagnement")).toBeInTheDocument();

    profilItem.current = termine();
    rerender(
      <BeneficiaireProfilCardItem value="/utilisateurs/1/profils/1" utilisateur={utilisateur} />,
    );
    expect(screen.getByText("Sans accompagnement")).toBeInTheDocument();
  });

  it("affiche le contenu additionnel (ex. bouton de suppression) transmis par la liste", () => {
    profilItem.current = enCours();
    renderCard({ extra: <button>Supprimer le profil</button> });

    expect(screen.getByRole("button", { name: "Supprimer le profil" })).toBeInTheDocument();
  });

  it("propose un bouton de modification nommé, qui ouvre le formulaire d'édition", async () => {
    profilItem.current = enCours();
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: "Modifier le profil" }));

    expect(screen.getByText("Formulaire d'édition")).toBeInTheDocument();
  });

  it("masque le bouton de modification quand le profil n'est pas éditable", () => {
    profilItem.current = enCours();
    renderCard({ editable: false });

    expect(screen.queryByRole("button", { name: "Modifier le profil" })).not.toBeInTheDocument();
  });

  it("affiche directement le formulaire quand le profil n'existe pas encore", () => {
    profilItem.current = undefined;
    renderCard({ value: undefined });

    expect(screen.getByText("Formulaire d'édition")).toBeInTheDocument();
  });

  it("ne présente pas de violation d'accessibilité", async () => {
    profilItem.current = enCours();
    const { container } = renderCard();

    expect(await axe(container)).toHaveNoViolations();
  });
});
