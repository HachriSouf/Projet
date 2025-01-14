# Projet TRD_Project

Mamoune Abbad El Andaloussi
Adam Edekkaki
Mehdi Thaili
Soufiane Hachri

Ce document explique comment configurer, construire et exécuter le projet TRD_Project. Assurez-vous de suivre chaque étape pour garantir le bon fonctionnement de l'ensemble des services.

---

## **Prérequis**

1. **Docker** et **Docker Compose** :

   - Assurez-vous que Docker et Docker Compose sont installés sur votre machine.
   - Vérifiez les versions :
     ```bash
     docker --version
     docker-compose --version
     ```

2. **Node.js et npm** (facultatif pour le développement local) :

   - Node.js version 18 ou supérieure.
   - Vérifiez avec :
     ```bash
     node --version
     npm --version
     ```

3. **Configuration des fichiers `.env`** :
   - Chaque service dispose de son propre fichier `.env`. Ces fichiers doivent être configurés avec les bonnes variables d'environnement avant de démarrer le projet.

---

## **Structure du projet**

Le projet est structuré comme suit :

```
TRD_Project/
├── docker-compose.yml
├── auth-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   └── index.js
├── customer-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   └── index.js
├── notification-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   └── index.js
├── gateaway-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env
│   └── index.js
├── mongo-db/
│   └── data/
└── README.md
```

---

## **Étapes pour lancer le projet**

### 1. **Cloner le projet**

Clonez le dépôt sur votre machine locale :

```bash
git clone <url-du-repo>
cd TRD_Project
```

### 2. **Configurer les fichiers `.env`**

Créez les fichiers `.env` dans les dossiers de chaque service, si ce n'est pas déjà fait. Voici des exemples de configuration :

#### **auth-service/.env**

```plaintext
JWT_SECRET=your_jwt_secret_key
MESSAGE_BROKER=rabbitmq
MESSAGE_BROKER_USER=guest
MESSAGE_BROKER_PASSWORD=guest
PORT=3000
```

#### **customer-service/.env**

```plaintext
MONGODB_URI=mongodb://mongo-db:27017/Customer-service
PORT=5000
```

#### **notification-service/.env**

```plaintext
MESSAGE_BROKER=rabbitmq
MESSAGE_BROKER_USER=guest
MESSAGE_BROKER_PASSWORD=guest
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
PORT=3001
```

#### **gateaway-service/.env**

```plaintext
PORT=8000
MESSAGE_BROKER=rabbitmq
MESSAGE_BROKER_USER=guest
MESSAGE_BROKER_PASSWORD=guest
```

### 3. **Construire et démarrer les conteneurs Docker**

Lancez la commande suivante depuis le dossier racine du projet :

```bash
docker-compose up --build
```

Cette commande :

- Construit les images Docker pour chaque service.
- Démarre les conteneurs définis dans `docker-compose.yml`.

### 4. **Vérifier l'état des conteneurs**

Assurez-vous que tous les conteneurs sont en cours d'exécution :

```bash
docker ps
```

### 5. **Tester les services**

#### **a. Tester l'auth-service**

Endpoint de création d'utilisateur :

```bash
curl --request POST \
  --url http://localhost:3000/auth/register \
  --header 'Content-Type: application/json' \
  --data '{
    "username": "testuser",
    "password": "securepassword",
    "email": "testuser@example.com"
  }'
```

#### **b. Tester le customer-service**

Endpoint de création de client :

```bash
curl --request POST \
  --url http://localhost:5000/customer/createCustomer \
  --header 'Content-Type: application/json' \
  --data '{
    "username": "testuser",
    "FirstName": "John",
    "LastName": "Doe",
    "Number": "123456789"
  }'
```
