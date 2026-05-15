import { http, HttpResponse } from "msw";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { server } from "@/mocks/server";
import { envoyerFichierFetch } from "./upload";
import type { AuthContextType } from "@/auth/AuthProvider";
import type { ITelechargement } from "@api";

vi.mock("@utils/logger", () => ({ logger: { error: vi.fn() } }));
vi.mock("@/env", () => ({ env: { REACT_APP_API_PREFIX: "" } }));

const API_URL = "http://api.test";
const UPLOAD_URL = `${API_URL}/telechargements`;
const NO_IMPERSONATE = { impersonate: undefined } as unknown as AuthContextType;
const WITH_IMPERSONATE = { impersonate: "agent@test.fr" } as unknown as AuthContextType;
const FILE = new Blob(["file content"], { type: "text/plain" });

describe("envoyerFichierFetch", () => {
  beforeEach(() => vi.clearAllMocks());

  it("upload réussi → onSuccess reçoit ITelechargement", async () => {
    const telechargement: ITelechargement = { "@id": "/telechargements/1" } as ITelechargement;
    server.use(http.post(UPLOAD_URL, () => HttpResponse.json(telechargement, { status: 201 })));

    const onSuccess = vi.fn();
    await envoyerFichierFetch(API_URL, NO_IMPERSONATE, FILE, onSuccess);

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess).toHaveBeenCalledWith(telechargement);
  });

  it("response.ok === false → onError appelé", async () => {
    server.use(http.post(UPLOAD_URL, () => new HttpResponse(null, { status: 422 })));

    const onError = vi.fn();
    await envoyerFichierFetch(API_URL, NO_IMPERSONATE, FILE, vi.fn(), onError);

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("header X-Switch-User présent si auth.impersonate défini", async () => {
    let capturedHeaders: Headers | undefined;
    server.use(
      http.post(UPLOAD_URL, ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({} as ITelechargement, { status: 201 });
      }),
    );

    await envoyerFichierFetch(API_URL, WITH_IMPERSONATE, FILE, vi.fn());

    expect(capturedHeaders!.get("X-Switch-User")).toBe("agent@test.fr");
  });
});
