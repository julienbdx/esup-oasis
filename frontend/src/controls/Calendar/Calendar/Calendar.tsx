/*
 * Copyright (c) 2024. Esup - Université de Bordeaux
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 * For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 * @author Julien Lemonnier <julien.lemonnier@u-bordeaux.fr>
 */

import React, { ReactElement, useCallback, useMemo } from "react";
import "@controls/Calendar/Calendar/Calendar.scss";
import dayjs from "dayjs";
import {
  Calendar as BigCalendar,
  dayjsLocalizer,
  NavigateAction,
  stringOrDate,
  View,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { calendarMessages, getMonthHeader, getWeekHeader } from "@controls/Calendar/Calendar/utils";
import { CalendarEvenement, Evenement } from "@lib/Evenement";
import CalendarEvent from "@controls/Calendar/Calendar/CalendarEvent";
import Spinner from "@controls/Spinner/Spinner";
import {
  calculateRange,
  canCreateEventOnDate,
  createDateFromStringAsUTC,
  stringOrDateToDate,
  stringOrDateToString,
} from "@utils/dates";
import { DensiteValues } from "@context/affichageFiltres/AffichageFiltresContext";
import { useAccessibilite } from "@context/accessibilite/AccessibiliteContext";
import { useModals } from "@context/modals/ModalsContext";
import { useAffichageFiltres } from "@context/affichageFiltres/AffichageFiltresContext";
import { useApi } from "@context/api/ApiProvider";
import { useAuth } from "@/auth/AuthProvider";
import { PREFETCH_LAST_PERIODES_RH, PREFETCH_TYPES_EVENEMENTS } from "@api/ApiPrefetchHelpers";
import { App } from "antd";
import { ITypeEvenement } from "@api/ApiTypeHelpers";

const BigCalendarDnD = withDragAndDrop(BigCalendar);

interface ICalendar {
  events: Evenement[];
  setEvent: (event: Evenement) => void;
}

/**
 * Renders a calendar component with drag and drop functionality for creating and modifying events.
 *
 * @param {ICalendar} props - The component props.
 * @param {Evenement[]} props.events - The array of events to be displayed on the calendar.
 * @param {Function} props.setEvent - The function to set the selected event.
 *
 * @returns {ReactElement} - The rendered calendar component.
 */
export default function Calendar({ events, setEvent }: ICalendar): ReactElement {
  const { message } = App.useApp();
  const user = useAuth().user;
  const localizer = dayjsLocalizer(dayjs);
  const { setModalEvenementId, setModalEvenement } = useModals();
  const { accessibilite: appAccessibilite } = useAccessibilite();
  const { affichageFiltres: appAffichageFiltres, setAffichage, setFiltres } = useAffichageFiltres();
  const { data: typesEvenements, isFetching: isFetchingTypesEvenements } =
    useApi().useGetCollection(PREFETCH_TYPES_EVENEMENTS);

  // Dernière période dont la date butoir est dépassée
  const { data: lastPeriodes } = useApi().useGetCollection(PREFETCH_LAST_PERIODES_RH(user));

  // region "Calendar event handlers"

  /**
   * Handles the change event for a calendar event. (Déplacer un évènement en DnD)
   * @param {CalendarEvenement} event - The calendar event to be modified.
   * @param {stringOrDate} start - The new start date or string representation of a date for the event.
   * @param {stringOrDate} end - The new end date or string representation of a date for the event.
   * @returns {void}
   */
  const handleEventChange = (
    event: CalendarEvenement,
    start: stringOrDate,
    end: stringOrDate,
  ): void => {
    if (
      !canCreateEventOnDate(stringOrDateToDate(start), user, lastPeriodes?.items[0]) ||
      !canCreateEventOnDate(stringOrDateToDate(event.data.debut), user, lastPeriodes?.items[0])
    ) {
      message
        .error(
          "Seuls les administrateurs sont autorisés à modifier des évènements dans les périodes de saisie antérieures.",
        )
        .then();
      return;
    }

    if (event.data.dateEnvoiRH) {
      message.error("L'évènement n'est pas modifiable car il a déjà été envoyé à la RH.").then();
      return;
    }

    setEvent(
      new Evenement({
        ...event.data,
        debut: createDateFromStringAsUTC(stringOrDateToString(start)).toISOString(),
        fin: createDateFromStringAsUTC(stringOrDateToString(end)).toISOString(),
      }),
    );
  };

  /**
   * Handles the creation of an event. (Créer un évènement en DnD)
   *
   * @param {string | Date} start - The start date/time of the event.
   * @param {string | Date} end - The end date/time of the event.
   *
   * @returns {void}
   */
  const handleEventCreate = (start: stringOrDate, end: stringOrDate): void => {
    if (!canCreateEventOnDate(stringOrDateToDate(start), user, lastPeriodes?.items[0])) {
      message
        .error(
          "Seuls les administrateurs sont autorisés à créer des évènements dans les périodes de saisie antérieures.",
        )
        .then();
      return;
    }

    setModalEvenement({
      debut: stringOrDateToString(start),
      fin: stringOrDateToString(end),
    });
  };

  function handleNavigation(date: Date, view: View, navigateAction: NavigateAction) {
    const range = calculateRange(
      date,
      navigateAction === "DATE" ? "day" : appAffichageFiltres.affichage.type,
    );
    setFiltres({ debut: range.from, fin: range.to });
  }

  function handleChangeView(view: View) {
    setAffichage({ type: view });
  }

  // endregion

  /**
   * Calculates the props object for displaying a calendar event.
   *
   * @param {object} event - The calendar event object (cast to CalendarEvenement internally).
   * @returns {Object} - The props object containing the className and style properties.
   */
  const eventPropGetter = useCallback(
    (event: object): object => {
      const calEvent = event as CalendarEvenement;
      const typeEvenement = typesEvenements?.items.find(
        (t: ITypeEvenement) => t["@id"] === calEvent.data.type,
      );

      let props = {
        className: `border-radius ${calEvent.data.dateAnnulation ? "event-annule" : ""}`,
        style: {
          fontSize:
            appAffichageFiltres.affichage.densite === DensiteValues.compact ? "0.8rem" : "1rem",
          backgroundColor: calEvent.data.isAffecte()
            ? `var(--color-${typeEvenement?.couleur})`
            : `var(--color-xlight-${typeEvenement?.couleur})`,
          color: `var(--color-dark-${typeEvenement?.couleur})`,
          border: "none",
          backgroundImage: calEvent.data.isAffecte() ? "" : "url(/images/strip.svg)",
        },
      };

      if (appAccessibilite.contrast) {
        props = {
          ...props,
          style: {
            ...props.style,
            backgroundColor: calEvent.data.isAffecte()
              ? `var(--color-dark-${typeEvenement?.couleur})`
              : `var(--color-xlight-${typeEvenement?.couleur})`,
            color: calEvent.data.isAffecte() ? `#FFF` : "#000",
            border: calEvent.data.isAffecte() ? "none" : `5px solid var(--color-danger)`,
            backgroundImage: "",
          },
        };
      }

      return props;
    },
    [typesEvenements, appAffichageFiltres.affichage.densite, appAccessibilite.contrast],
  );

  function handleOpenModal(data: Evenement) {
    setModalEvenementId(data["@id"]);
  }

  const calendarComponents = useMemo(
    () => ({
      toolbar: undefined as undefined,
      event: (event: { event: object }) => (
        <CalendarEvent
          key={(event.event as CalendarEvenement).data.hashCode()}
          event={event.event as CalendarEvenement}
        />
      ),
      month: {
        header: ({ date }: { date: Date }) => getMonthHeader(date),
      },
      work_week: {
        header: ({ date }: { date: Date }) =>
          getWeekHeader(date, !canCreateEventOnDate(date, user, lastPeriodes?.items[0])),
      },
      week: {
        header: ({ date }: { date: Date }) =>
          getWeekHeader(date, !canCreateEventOnDate(date, user, lastPeriodes?.items[0])),
      },
      day: {
        header: ({ date }: { date: Date }) => <>{date.toLocaleDateString()}</>,
      },
    }),
    [user, lastPeriodes],
  );

  // Custom n'est valable que pour le layout Table
  if (appAffichageFiltres.affichage.type === "custom") {
    setAffichage({ type: "work_week" });
    return (
      <>
        <Spinner />
      </>
    );
  }

  if (isFetchingTypesEvenements)
    return (
      <div data-testid="wait">
        <Spinner />
      </div>
    );

  return (
    <>
      <BigCalendarDnD
        className={`calendar density-${appAffichageFiltres.affichage.densite?.toLowerCase()} calendar-view-${
          appAffichageFiltres.affichage.type
        } ${appAffichageFiltres.affichage.fitToScreen ? "fit-to-screen" : ""}`}
        localizer={localizer}
        timeslots={2}
        step={15}
        min={new Date(0, 0, 0, 7, 0, 0)}
        max={new Date(0, 0, 0, 22, 0, 0)}
        messages={calendarMessages}
        events={events.map((event) => {
          return event.toCalendarEvent();
        })}
        dayLayoutAlgorithm="no-overlap"
        view={appAffichageFiltres.affichage.type}
        views={["month", "week", "work_week", "day"]}
        onView={handleChangeView}
        date={appAffichageFiltres.filtres.debut}
        onNavigate={handleNavigation}
        onSelectEvent={(event) => {
          handleOpenModal((event as CalendarEvenement).data);
        }}
        eventPropGetter={eventPropGetter}
        selectable={user?.isPlanificateur}
        draggableAccessor={() => user?.isPlanificateur || false}
        toolbar={false}
        components={calendarComponents}
        onEventDrop={({ event, start, end }) => {
          if (user?.isPlanificateur) handleEventChange(event as CalendarEvenement, start, end);
        }}
        onEventResize={({ event, start, end }) => {
          if (user?.isPlanificateur) handleEventChange(event as CalendarEvenement, start, end);
        }}
        onSelectSlot={(slotInfo) => {
          if (user?.isPlanificateur) handleEventCreate(slotInfo.start, slotInfo.end);
        }}
      />
    </>
  );
}
