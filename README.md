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

## Utiliser `admin.html` pour préparer le cours

`admin.html` est un outil statique interne qui aide à préparer le fichier `js/course-data.js`. Il ne modifie pas le dépôt directement et ne téléverse aucun fichier.

1. Ouvrir `admin.html` dans le site publié ou en local.
2. Entrer le mot de passe simple défini dans `js/admin.js` avec la constante `ADMIN_PASSWORD`.
3. Modifier le titre/sous-titre si nécessaire.
4. Ajouter les modules avec leur titre et leur description.
5. Ajouter les leçons dans le module voulu avec : titre, durée, lien vidéo embed, lien PDF et résumé.
6. Vérifier l’aperçu du cours.
7. Cliquer sur **Copier le code course-data.js**.
8. Remplacer tout le contenu de `js/course-data.js` par le code généré, puis commit/push pour republier GitHub Pages.

> Important : `admin.html` est volontairement un outil léger côté navigateur. Il ne faut pas le considérer comme un vrai dashboard admin sécurisé.

## Héberger les vidéos sur YouTube non répertorié

1. Téléverser la vidéo dans YouTube Studio.
2. Dans la visibilité, choisir **Non répertoriée** pour éviter qu’elle soit trouvable publiquement par recherche.
3. Garder en tête qu’une vidéo non répertoriée reste accessible à toute personne qui possède le lien.
4. Copier le lien de partage ou le lien d’intégration, puis l’utiliser dans l’outil `admin.html`.

## Récupérer un lien embed YouTube

1. Ouvrir la vidéo YouTube.
2. Cliquer sur **Partager**.
3. Cliquer sur **Intégrer**.
4. Copier uniquement l’URL présente dans l’attribut `src` de l’iframe, par exemple :

   ```text
   https://www.youtube.com/embed/ID_DE_LA_VIDEO
   ```

5. Coller cette URL dans le champ **Lien vidéo embed** de `admin.html`.

## Ajouter les PDF dans `assets/documents`

1. Créer le dossier `assets/documents` s’il n’existe pas encore.
2. Ajouter les fichiers PDF dans ce dossier, avec des noms simples sans espaces, par exemple `module-1-bienvenue.pdf`.
3. Dans `admin.html`, renseigner le chemin relatif :

   ```text
   assets/documents/module-1-bienvenue.pdf
   ```

4. Commit/push les PDF en même temps que le nouveau `js/course-data.js`.

## Limites de sécurité de l’administration statique

GitHub Pages sert uniquement des fichiers statiques. Sans backend, il n’est pas possible de créer un vrai upload admin sécurisé depuis le navigateur :

- ne pas créer d’upload direct dans le dépôt depuis `admin.html` ;
- ne jamais exposer de token GitHub dans le navigateur ;
- le mot de passe dans `js/admin.js` est visible par une personne technique ;
- l’outil sert seulement à éviter l’accès accidentel et à générer du code à copier ;
- pour une administration réellement sécurisée, il faudrait ajouter un backend, une authentification serveur et une gestion de fichiers côté serveur.

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
admin.html
access-denied.html
css/styles.css
assets/documents/.gitkeep
js/auth.js
js/login.js
js/guard.js
js/students.js
js/course-data.js
js/admin.js
js/dashboard.js
js/course.js
js/progress.js
README.md
```
