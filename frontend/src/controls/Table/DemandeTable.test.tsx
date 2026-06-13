import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DemandeTable from "./DemandeTable";
import { ETAT_DEMANDE_EN_COURS, ETAT_DEMANDE_RECEPTIONNEE, ETAT_DEMANDE_CONFORME } from "@lib";

// --- Hoisted mocks ---
const { mockUseGetCollectionPaginated, mockUseGetFullCollection } = vi.hoisted(() => ({
  mockUseGetCollectionPaginated: vi.fn(() => ({ data: undefined, isFetching: false })),
  mockUseGetFullCollection: vi.fn(() => ({
    data: {
      items: [
        { "@id": ETAT_DEMANDE_EN_COURS, libelle: "En cours", color: undefined },
        { "@id": ETAT_DEMANDE_RECEPTIONNEE, libelle: "Réceptionnée", color: "purple" },
        { "@id": ETAT_DEMANDE_CONFORME, libelle: "Conforme", color: "blue" },
      ],
      totalItems: 3,
    },
    isLoading: false,
    isFetching: false,
  })),
}));

vi.mock("@context/api/ApiProvider", () => ({
  useApi: () => ({
    useGetCollectionPaginated: mockUseGetCollectionPaginated,
    useGetFullCollection: mockUseGetFullCollection,
    useGetItem: vi.fn(() => ({ data: undefined, isLoading: false })),
  }),
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({ user: undefined, impersonate: undefined }),
}));

vi.mock("@context/utilisateurPreferences/UtilisateurPreferencesProvider", () => ({
  usePreferences: () => ({
    getPreferenceArray: vi.fn(() => []),
    preferencesChargees: true,
  }),
}));

vi.mock("@controls/Table/hooks/useFiltreSessionStorage", () => ({
  useFiltreSessionStorage: () => ({ enabled: false, toggle: vi.fn() }),
}));

vi.mock("@controls/Table/DemandeTableFilters", () => ({
  DemandeTableFilters: () => null,
}));

vi.mock("@controls/Table/DemandeTableExport", () => ({
  default: () => null,
}));

vi.mock("@controls/Table/FiltreDescription", () => ({
  default: () => null,
}));

vi.mock("@controls/Table/FiltreSessionSwitch", () => ({
  FiltreSessionSwitch: () => null,
}));

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));

vi.mock("@/env", () => ({
  env: {
    REACT_APP_API_PREFIX: "",
    REACT_APP_SERVICE: "Service test",
    REACT_APP_ENVIRONMENT: "test",
  },
}));

const testRefs = {
  table: { current: null },
  filtres: { current: null },
  filtresDetails: { current: null },
  favoris: { current: null },
};

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={makeClient()}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("DemandeTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetCollectionPaginated.mockReturnValue({ data: undefined, isFetching: false });
  });

  it("rendu sans données : le tableau s'affiche sans erreur", () => {
    render(
      <Wrapper>
        <DemandeTable refs={testRefs as never} />
      </Wrapper>,
    );
    expect(screen.getByRole("table", { name: /liste des demandes/i })).toBeInTheDocument();
  });

  it("rendu sans données : aucune ligne de données n'est affichée", () => {
    render(
      <Wrapper>
        <DemandeTable refs={testRefs as never} />
      </Wrapper>,
    );
    // 1 header + 1 placeholder row (Ant Design renders an empty <tr> when dataSource is empty)
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2);
  });

  it("rendu avec 3 demandes : 3 lignes de données sont affichées", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [
          { "@id": "/demandes/1", id: 1, etat: ETAT_DEMANDE_EN_COURS },
          { "@id": "/demandes/2", id: 2, etat: ETAT_DEMANDE_RECEPTIONNEE },
          { "@id": "/demandes/3", id: 3, etat: ETAT_DEMANDE_CONFORME },
        ],
        totalItems: 3,
      } as never,
      isFetching: false,
    });
    render(
      <Wrapper>
        <DemandeTable refs={testRefs as never} />
      </Wrapper>,
    );
    // 1 header row + 3 data rows
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("colonne état : affiche le libellé de l'état pour chaque demande", () => {
    mockUseGetCollectionPaginated.mockReturnValue({
      data: {
        items: [
          { "@id": "/demandes/1", id: 1, etat: ETAT_DEMANDE_EN_COURS },
          { "@id": "/demandes/2", id: 2, etat: ETAT_DEMANDE_RECEPTIONNEE },
          { "@id": "/demandes/3", id: 3, etat: ETAT_DEMANDE_CONFORME },
        ],
        totalItems: 3,
      } as never,
      isFetching: false,
    });
    render(
      <Wrapper>
        <DemandeTable refs={testRefs as never} />
      </Wrapper>,
    );
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Réceptionnée")).toBeInTheDocument();
    expect(screen.getByText("Conforme")).toBeInTheDocument();
  });
});
