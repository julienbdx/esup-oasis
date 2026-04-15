/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement } from "react";
import { Alert, Button, Col, Empty, Form, FormInstance, List, Row, Switch } from "antd";
import { Calendar, Day } from "@lib/react-modern-calendar-datepicker";
import { modernCalendarLocaleFr } from "@lib/react-modern-calendar-datepicker/SmallCalendarLocale";
import { toDate, toDayValue } from "@utils/dates";
import { DeleteOutlined } from "@ant-design/icons";
import { Evenement } from "@lib/Evenement";
import { useApi } from "@context/api/ApiProvider";
import { useAuth } from "@/auth/AuthProvider";
import { TYPE_EVENEMENT_RENFORT } from "@/constants";
import { PREFETCH_LAST_PERIODES_RH } from "@api/ApiPrefetchHelpers";
import { UseStateDispatch } from "@utils/utils";

export interface IDuplicationOptions {
   horaire: boolean;
   typeEvenement: boolean;
   beneficiaire: boolean;
   intervenant: boolean;
   suppleants: boolean;
   campus: boolean;
   salle: boolean;
   equipements: boolean;
   paiement: boolean;
}

interface IEvenementDupliquerFormProps {
   form: FormInstance;
   evenement: Evenement;
   datesSelectionnees: Date[];
   setDatesSelectionnees: UseStateDispatch<Date[]>;
   options: IDuplicationOptions;
   onFinish: (values: IDuplicationOptions) => void;
   afficherAide: boolean;
   setAfficherAide: UseStateDispatch<boolean>;
}

/**
 * Formulaire de duplication d'un évènement : sélection des dates et des options à conserver.
 */
export function EvenementDupliquerForm({
   form,
   evenement,
   datesSelectionnees,
   setDatesSelectionnees,
   options,
   onFinish,
   afficherAide,
   setAfficherAide,
}: IEvenementDupliquerFormProps): ReactElement {
   const user = useAuth().user;
   const { data: lastPeriodes } = useApi().useGetCollection(PREFETCH_LAST_PERIODES_RH(user));

   return (
      <>
         {afficherAide && (
            <Alert
               closable={{ onClose: () => setAfficherAide(false) }}
               title="Dupliquer un évènement"
               description={
                  <>
                     Cette fonctionnalité vous permet de dupliquer un évènement sur plusieurs jours.
                     Vous devez :
                     <ol className="mt-0 mb-0">
                        <li>
                           Sélectionner les jours sur lesquels vous souhaitez copier l'évènement
                           dans le calendrier à gauche
                        </li>
                        <li>
                           Sélectionner dans la partie de droite les informations de l'évènement que
                           vous souhaitez conserver dans les évènements à créer
                        </li>
                     </ol>
                  </>
               }
               type="info"
               showIcon
               className="mb-2"
            />
         )}
         <Form
            form={form}
            layout="vertical"
            name="evenement-dupliquer"
            onFinish={onFinish}
            initialValues={options}
         >
            <Row gutter={[16, 16]}>
               <Col lg={12} sm={24}>
                  <Calendar
                     calendarClassName="small-calendar pr-2"
                     shouldHighlightWeekends
                     locale={modernCalendarLocaleFr}
                     minimumDate={
                        user?.isAdmin || !lastPeriodes || !lastPeriodes.items[0]
                           ? undefined
                           : (toDayValue(new Date(lastPeriodes.items[0].butoir as string)) as Day)
                     }
                     onChange={(v) => {
                        if (v) {
                           // Pas de doublons sur les dates car un bénéf ne peut pas avoir 2 évènements sur le même créneau horaire
                           if (
                              datesSelectionnees
                                 .map((d) => d.toISOString())
                                 .includes(toDate(v).toISOString())
                           )
                              return;

                           setDatesSelectionnees([...datesSelectionnees, toDate(v)]);
                        }
                     }}
                  />

                  <p className="semi-bold mt-0">Date des évènements à créer</p>
                  {datesSelectionnees.length > 0 ? (
                     <List size="small">
                        {datesSelectionnees.map((date, index) => (
                           <List.Item
                              key={index}
                              extra={
                                 <Button
                                    icon={<DeleteOutlined />}
                                    onClick={() => {
                                       setDatesSelectionnees(
                                          datesSelectionnees.filter((d) => d !== date),
                                       );
                                    }}
                                 />
                              }
                           >
                              {date.toLocaleDateString()}
                           </List.Item>
                        ))}
                     </List>
                  ) : (
                     <Empty description="Aucune date sélectionnée" />
                  )}
               </Col>
               <Col lg={12} sm={24}>
                  <p className="semi-bold">Informations à dupliquer</p>
                  <Row>
                     <Col span={18} className="text-legende">
                        Horaires (début/fin)
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="horaire" valuePropName="checked">
                           <Switch size="small" checked disabled className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>
                  <Row>
                     <Col span={18} className="text-legende">
                        Catégorie
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="typeEvenement" valuePropName="checked">
                           <Switch size="small" checked disabled className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18} className="text-legende">
                        Bénéficiaire
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="beneficiaire" valuePropName="checked">
                           <Switch size="small" checked={true} disabled className="mb-1" />
                        </Form.Item>
                     </Col>

                     <Col
                        span={18}
                        className={
                           evenement.type === TYPE_EVENEMENT_RENFORT ? "text-legende" : undefined
                        }
                     >
                        Intervenant
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="intervenant" valuePropName="checked">
                           <Switch
                              size="small"
                              checked={evenement.type === TYPE_EVENEMENT_RENFORT ? true : undefined}
                              disabled={evenement.type === TYPE_EVENEMENT_RENFORT}
                              className="mb-1"
                           />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18} className="text-legende">
                        Campus
                     </Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="campus" valuePropName="checked">
                           <Switch size="small" checked={true} disabled className="mb-1" />
                        </Form.Item>
                     </Col>

                     <Col span={18}>Salle</Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="salle" valuePropName="checked">
                           <Switch size="small" className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18}>Equipements</Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="equipements" valuePropName="checked">
                           <Switch size="small" className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>

                  <Row className="mt-2">
                     <Col span={18}>Informations de paiement</Col>
                     <Col span={6} className="text-right">
                        <Form.Item name="paiement" valuePropName="checked">
                           <Switch size="small" className="mb-1" />
                        </Form.Item>
                     </Col>
                  </Row>
               </Col>
            </Row>
         </Form>
      </>
   );
}
