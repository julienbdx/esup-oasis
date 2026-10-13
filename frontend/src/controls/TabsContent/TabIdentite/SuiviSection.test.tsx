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
import { Form } from "antd";
import { axe } from "vitest-axe";
import { renderWithProviders } from "@/test";
import { IUtilisateur } from "@api";
import { RoleValues } from "@lib";
import { SuiviSection } from "./SuiviSection";

vi.mock("@controls/TabsContent/TabProfils", () => ({
  TabProfils: () => <div>Liste des profils</div>,
}));

function Section({
  utilisateur,
  isFetching = false,
}: {
  utilisateur: Partial<IUtilisateur>;
  isFetching?: boolean;
}) {
  const [form] = Form.useForm();
  return (
    <SuiviSection
      utilisateur={utilisateur as IUtilisateur}
      isFetching={isFetching}
      mutateUtilisateur={vi.fn()}
      form={form}
    />
  );
}

const beneficiaire: Partial<IUtilisateur> = {
  "@id": "/utilisateurs/1",
  roles: [RoleValues.ROLE_BENEFICIAIRE],
  numeroAnonyme: 20254800,
  profils: ["/utilisateurs/1/profils/1"],
};

describe("SuiviSection", () => {
  it("expose les profils sous un titre accessible", () => {
    renderWithProviders(<Section utilisateur={beneficiaire} />);

    expect(screen.getByRole("heading", { name: "Profils", level: 3 })).toBeInTheDocument();
    expect(screen.getByText("Liste des profils")).toBeInTheDocument();
  });

  it("n'affiche pas d'état vide quand l'utilisateur a des profils", () => {
    renderWithProviders(<Section utilisateur={beneficiaire} />);

    expect(screen.queryByText("Aucun profil actuellement")).not.toBeInTheDocument();
  });

  it("affiche un état vide explicite quand l'utilisateur n'a aucun profil", () => {
    renderWithProviders(<Section utilisateur={{ ...beneficiaire, profils: [] }} />);

    expect(screen.getByText("Aucun profil actuellement")).toBeInTheDocument();
    expect(screen.getByText("Liste des profils")).toBeInTheDocument();
  });

  it("n'affiche le numéro d'anonymat que pour un bénéficiaire", () => {
    const { unmount } = renderWithProviders(<Section utilisateur={beneficiaire} />);
    expect(screen.getByText("Numéro d'anonymat")).toBeInTheDocument();
    expect(screen.getByText("20254800")).toBeInTheDocument();
    unmount();

    renderWithProviders(
      <Section utilisateur={{ ...beneficiaire, roles: [RoleValues.ROLE_DEMANDEUR] }} />,
    );
    expect(screen.queryByText("Numéro d'anonymat")).not.toBeInTheDocument();
  });

  it("affiche un squelette pendant le chargement", () => {
    renderWithProviders(<Section utilisateur={beneficiaire} isFetching />);

    expect(screen.queryByText("Liste des profils")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Profils" })).not.toBeInTheDocument();
  });

  it("ne présente pas de violation d'accessibilité", async () => {
    const { container } = renderWithProviders(<Section utilisateur={beneficiaire} />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
