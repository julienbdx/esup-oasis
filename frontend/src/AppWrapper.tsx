/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import { AuthProvider } from "@/auth/AuthProvider";
import Spinner from "@controls/Spinner/Spinner";
import { AccessibiliteProvider } from "@context/accessibilite/AccessibiliteContext";
import { ModalsProvider } from "@context/modals/ModalsContext";
import { DrawersProvider } from "@context/drawers/DrawersContext";
import { AffichageFiltresProvider } from "@context/affichageFiltres/AffichageFiltresContext";

function AppAuthWrapper() {
   return (
      <AuthProvider onSuccess={() => {}}>
         <App />
      </AuthProvider>
   );
}

export default function AppWrapper() {
   return (
      <React.StrictMode>
         <Suspense fallback={<Spinner />}>
            <BrowserRouter>
               <AccessibiliteProvider>
                  <DrawersProvider>
                     <ModalsProvider>
                        <AffichageFiltresProvider>
                           <AppAuthWrapper />
                        </AffichageFiltresProvider>
                     </ModalsProvider>
                  </DrawersProvider>
               </AccessibiliteProvider>
            </BrowserRouter>
         </Suspense>
      </React.StrictMode>
   );
}
