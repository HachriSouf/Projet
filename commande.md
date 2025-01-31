# **Documentation API TRD_Project**

## **Authentification**

### **Créer un compte utilisateur**

**POST** `localhost:8000/auth/sign-up/`

```json
{
  "username": "",
  "firstname": "",
  "lastname": "",
  "Number": "",
  "password": "",
  "email": ""
}
```

### **Connexion (Admin)**

**POST** `localhost:8000/auth/login/`

```json
{
  "password": "admin",
  "email": "admin@admin.com"
}
```

### **Créer un Bookmaker (nécessite le refreshToken admin a recuperer dans le login)**

**POST** `localhost:8000/auth/bookmaker`

```json
{
  "username": "SalimBtmt",
  "firstname": "Jean",
  "lastname": "Narup",
  "Number": "02394",
  "password": "azerty",
  "email": "sboutament@gmail.com"
}
```

---

## **Équipes**

### **Importer des équipes**

**POST** `localhost:4006/teams/import/`

### **Récupérer les équipes**

**GET** `localhost:8000/teams/`

---

## **Matchs**

### **Créer un match**

**POST** `localhost:8000/matches/`

```json
{
  "homeTeam": "ID d'une équipe",
  "awayTeam": "ID d'une autre équipe"
}
```

### **Placer un pari simple**

**POST** `localhost:8000/bet/`
**Headers:**

```
authorization: Bearer <refreshToken Ici>
```

```json
{
  "matchId": "679d32a389ae501972208132",
  "betAmount": "100",
  "selectedOutcome": "1"
}
```

### **Démarrer un match**

**POST** `localhost:8000/matches/start/:matchID`

---

### **Effectuer un paiement pour avoir une balance superieur au ammount**

**POST** `localhost:8000/payement/process-payment`

```json
{
  "amount": "1000",
  "cardHolderName": "Mamoune",
  "cardNumber": "3443555655367788",
  "expiryDate": "06/27",
  "cvv": "344"
}
```

---

### **Placer un pari combiné**

**POST** `localhost:8000/bet/combined`
**Headers:**

```
authorization: Bearer <refreshToken Ici>
```

```json
{
  "bets": [
    {
      "matchId": "679d381c89ae501972208138",
      "selectedOutcome": "1"
    },
    {
      "matchId": "679d383d89ae50197220813a",
      "selectedOutcome": "1"
    }
  ],
  "betAmount": 50
}
```

---

## **Gestion des Cotes (Odds)**

### **Booster les cotes d'un match necessite le refreshToken du bookmaker**

**PATCH** `localhost:8000/odds/boost/{matchId}`

```json
{
  "homeOdd": "3",
  "drawOdd": "2",
  "awayOdd": "4"
}
```

### **Proposer des cotes attractives (Notification par email)**

**GET** `localhost:8000/odds/propose`

---
