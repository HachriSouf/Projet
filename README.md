# **Projet TRD_Project**

## **Auteurs**

- Mamoune Abbad El Andaloussi
- Adam Edekkaki
- Mehdi Thaili
- Soufiane Hachri

## **Description**

Ce document explique comment configurer, construire et exécuter le projet **TRD_Project**. Assurez-vous de suivre chaque étape afin de garantir le bon fonctionnement de l'ensemble des services.

---

## **Installation et Lancement**

### **1. Pré-requis**

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js](https://nodejs.org/)
- [Docker & Docker Compose](https://www.docker.com/)

### **2. Configuration du Projet**

1. **Nom du dossier principal**

   - **Le dossier principal du projet doit être nommé** : `TRD_PROJECT`
   - Cela est crucial car les conteneurs sont configurés pour fonctionner avec ce nom.

2. **Installation des dépendances**

   - Ouvrez un terminal à la racine du projet et exécutez :
     ```bash
     npm install
     ```

3. **Construction et lancement des services**

   - Démarrez les services avec la commande :
     ```bash
     docker-compose up --build
     ```

4. **Gestion des conteneurs**
   - Si le conteneur **notification-service** ne démarre pas correctement, relancez-le avec :
     ```bash
     docker-compose restart notification-service
     ```

---

## **Tests et API**

- Un fichier nommé **`commande.md`** est fourni dans le projet.
- Ce fichier contient différentes requêtes API permettant de tester l'application TRD.

---

## **Remarques**

- Assurez-vous que Docker Desktop est bien lancé avant d’exécuter `docker-compose up`.
- Vérifiez que tous les services sont correctement démarrés à l’aide de la commande :
  ```bash
  docker ps
  ```
- En cas d'erreur, consultez les logs des services pour identifier les problèmes :
  ```bash
  docker-compose logs -f
  ```
