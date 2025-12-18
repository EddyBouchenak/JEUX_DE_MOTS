# Le Juge de Mots 🎲

Un site web ludique pour vérifier la validité des mots au Scrabble, Bananagrams et autres jeux de lettres.

## Fonctionnalités
- Vérification instantanée des mots (basée sur le dictionnaire ODS8).
- Affichage des points Scrabble.
- Design chaleureux et animé inspiré des jeux de société.
- Interface responsive (mobile et desktop).

## Comment tester en local ?
⚠️ **Attention** : En raison des restrictions de sécurité des navigateurs, le fichier `dictionary.txt` ne peut pas être chargé si vous ouvrez simplement le fichier `index.html` (erreur CORS).

Pour tester en local, vous devez utiliser un petit serveur web.
Si vous avez Python installé :
```bash
python3 -m http.server
```
Puis ouvrez `http://localhost:8000` dans votre navigateur.

## Déploiement sur GitHub Pages 🚀
1.  Créez un nouveau repository sur GitHub.
2.  Poussez ces fichiers sur le repository :
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <VOTRE_URL_GITHUB>
    git push -u origin main
    ```
3.  Allez dans les **Settings** de votre repository sur GitHub.
4.  Dans la section **Pages**, choisissez la branche `main` comme source.
5.  Votre site sera accessible quelques instants plus tard !
