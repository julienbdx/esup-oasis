# Oasis

Oasis (**O**util pour l’**A**ccompagnement et le **S**uivi **I**ndividualisé des étudiants à besoins **S**pécifiques)
est une application dédiée à la gestion des étudiants qui, à l'université, ont besoin d'un accompagnement personnalisé :
sportifs de haut niveau, en situation de handicap, élus, salariés...

## Principales fonctionnalités

Oasis propose les fonctionnalités suivantes :

* Saisie par les étudiants des demandes d'accompagnement, en fonction de campagnes définies par les gestionnaires
* Traitement des demandes par les gestionnaires (et les éventuelles commissions)
* Gestion du dossier bénéficiaire (profil, mise en place d'aménagements, CR d'entretiens...)
* Gestion des intervenants (pour de la prise de notes, du tutorat, du secrétariat d'épreuves...)
* Planification des interventions
* Exports / bilans

## Installation

Oasis est disponible sous la forme de deux applications frontend et backend séparées, utilisant les technologies
suivantes :

* Frontend : Javascript, React 18
* Backend : PHP, Symfony 7.1 / Api Platform 3.2

Des Dockerfile sont fournis pour le déploiement des deux applications, plus de détails dans la documentation de
chacune :

* [frontend](docs/frontend/README.md)
* [backend](docs/backend/README.md)

---

_Application développée par la Direction des Systèmes d'Information (DSI) de
l'[université de Bordeaux](https://u-bordeaux.fr), mise à disposition des établissements d'enseignement supérieur via
l'incubateur ESUP (https://www.esup-portail.org/)._