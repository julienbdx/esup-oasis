/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import "@testing-library/jest-dom";
import { toHaveNoViolations } from "vitest-axe/dist/matchers";
import nodeCrypto from "crypto";

expect.extend({ toHaveNoViolations });

// window.env est injecté au runtime via public/env.js — on le mock pour les tests
(window as unknown as Record<string, unknown>).env = {};

global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    };
  };

Object.defineProperty(globalThis, "crypto", {
  value: {
    getRandomValues: (arr: Uint8Array) => nodeCrypto.randomBytes(arr.length),
  },
});
