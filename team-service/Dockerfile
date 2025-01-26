# Utiliser l'image Node.js
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste des fichiers de l'application
COPY . .

# Exposer le port du service
EXPOSE 4006

# Commande pour démarrer l'application
CMD ["npm", "start"]
