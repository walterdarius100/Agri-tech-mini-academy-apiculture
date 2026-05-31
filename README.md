# Agri-tech Mini-Academy — Formation pratique en apiculture

Mini-application statique pour donner un accès étudiant simple à la formation déjà vendue et payée **Formation pratique en apiculture**.

## Objectif du projet

Ce projet est prévu pour GitHub Pages et ne nécessite aucun backend. Il sert uniquement à :

- connecter un étudiant par email + code d’accès ;
- protéger le tableau de bord et la page de cours côté navigateur ;
- afficher les modules, leçons, vidéos placeholders et ressources PDF placeholders ;
- sauvegarder la progression localement avec `localStorage` ;
- proposer un lien de support WhatsApp.

Le projet ne contient pas de paiement automatique, pas de page de vente et pas de catalogue multi-formations.

## Comment ajouter un étudiant

1. Générer un code d’accès privé et unique pour l’étudiant, par exemple `API-2026-XXXX`.
2. Calculer le hash SHA-256 de la chaîne :

   ```text
   email-normalise:CODE-NORMALISE
   ```

   L’email est en minuscules et sans espaces autour. Le code est en majuscules et sans espaces autour.

3. Ajouter une entrée dans `js/students.js` :

   ```js
   {
     name: 'Nom Étudiant',
     email: 'etudiant@example.com',
     course: 'Formation pratique en apiculture',
     status: 'active',
     accessHash: 'HASH_SHA_256_ICI',
   }
   ```

4. Ne jamais publier le code d’accès en clair dans le dépôt.

## Comment générer un hash d’accès

### Avec Node.js

```bash
node -e "const crypto=require('crypto'); const email='etudiant@example.com'.trim().toLowerCase(); const code='API-2026-XXXX'.trim().toUpperCase(); console.log(crypto.createHash('sha256').update(email + ':' + code).digest('hex'))"
```

### Dans la console du navigateur

```js
const email = 'etudiant@example.com'.trim().toLowerCase();
const code = 'API-2026-XXXX'.trim().toUpperCase();
const bytes = new TextEncoder().encode(`${email}:${code}`);
const digest = await crypto.subtle.digest('SHA-256', bytes);
[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
```

Un accès démo est présent dans `js/students.js` pour faciliter les tests locaux :

- email : `demo@agritech.ht`
- code : `APICULTURE-2026`

## Limites de sécurité

Cette application est statique. La vérification par hash évite de stocker les codes en clair, mais elle ne remplace pas une authentification serveur :

- le fichier `js/students.js` reste public sur GitHub Pages ;
- un utilisateur technique peut inspecter le JavaScript ;
- la session et la progression sont stockées dans le navigateur ;
- il faut régénérer et republier le site pour désactiver ou ajouter un accès.

Pour un niveau de sécurité plus élevé, il faudra utiliser un backend, une base de données et une authentification serveur.

## Publication sur GitHub Pages

1. Pousser le dépôt sur GitHub.
2. Ouvrir **Settings → Pages**.
3. Dans **Build and deployment**, choisir **Deploy from a branch**.
4. Sélectionner la branche souhaitée, puis le dossier racine `/`.
5. Enregistrer. GitHub Pages servira directement les fichiers HTML, CSS et JavaScript.

## Structure

```text
index.html
login.html
dashboard.html
course.html
access-denied.html
css/styles.css
js/auth.js
js/login.js
js/guard.js
js/students.js
js/course-data.js
js/dashboard.js
js/course.js
js/progress.js
README.md
```
