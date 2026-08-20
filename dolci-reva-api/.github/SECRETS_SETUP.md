# 🔐 Configuration des Secrets GitHub Actions

## 📍 Où configurer les secrets

### Méthode 1 : Via l'interface GitHub (Recommandé)

1. **Allez sur votre repository GitHub**
2. **Cliquez sur "Settings"** (en haut du repository)
3. **Dans le menu de gauche, cliquez sur "Secrets and variables" > "Actions"**
4. **Cliquez sur "New repository secret"**
5. **Ajoutez chaque secret un par un :**

#### Secrets nécessaires pour le déploiement :

| Nom du Secret | Description | Exemple |
|--------------|-------------|---------|
| `DEPLOY_HOST` | Adresse IP ou domaine du serveur | `192.168.1.100` ou `deploy.example.com` |
| `DEPLOY_USER` | Nom d'utilisateur SSH | `deploy` ou `www-data` |
| `DEPLOY_KEY` | Clé privée SSH (contenu complet) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### Méthode 2 : Via GitHub CLI

```bash
# Installer GitHub CLI si nécessaire
# brew install gh (sur macOS)

# Se connecter
gh auth login

# Ajouter les secrets
gh secret set DEPLOY_HOST --body "votre-adresse-serveur"
gh secret set DEPLOY_USER --body "votre-utilisateur"
gh secret set DEPLOY_KEY < ~/.ssh/id_rsa
```

## 🔑 Générer une clé SSH pour le déploiement

Si vous n'avez pas encore de clé SSH pour le déploiement :

```bash
# Générer une nouvelle clé SSH (spécifique pour le déploiement)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Copier la clé publique sur le serveur
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@votre-serveur

# Afficher la clé privée pour la copier dans GitHub
cat ~/.ssh/github_actions_deploy
```

⚠️ **Important** : Copiez TOUT le contenu de la clé privée (y compris `-----BEGIN` et `-----END`)

## 📝 Exemple de configuration complète

### 1. Sur votre serveur

```bash
# Créer un utilisateur pour le déploiement
sudo adduser deploy
sudo usermod -aG www-data deploy

# Créer le répertoire de déploiement
sudo mkdir -p /var/www/v2-dolcireva-api
sudo chown deploy:www-data /var/www/v2-dolcireva-api

# Autoriser l'utilisateur à exécuter artisan sans sudo
sudo visudo
# Ajouter : deploy ALL=(ALL) NOPASSWD: /usr/bin/php /var/www/v2-dolcireva-api/artisan
```

### 2. Dans GitHub

Ajoutez les secrets avec les valeurs suivantes :

- **DEPLOY_HOST** : `192.168.1.100` (ou votre IP/domaine)
- **DEPLOY_USER** : `deploy`
- **DEPLOY_KEY** : Le contenu complet de votre clé privée SSH

## 🔒 Bonnes pratiques de sécurité

1. **Ne jamais commiter les secrets** dans le code
2. **Utiliser des clés SSH dédiées** pour le déploiement (pas votre clé personnelle)
3. **Restreindre les permissions** de la clé SSH sur le serveur
4. **Utiliser des environnements GitHub** pour séparer staging/production
5. **Rotater les secrets régulièrement**

## 🌍 Configuration des environnements

Pour séparer staging et production :

1. **Settings > Environments**
2. **New environment** : Créez `staging` et `production`
3. **Protection rules** : Activez les règles de protection si nécessaire
4. **Secrets** : Ajoutez des secrets spécifiques à chaque environnement

## ✅ Vérifier que les secrets sont configurés

Les secrets ne sont **jamais visibles** dans l'interface GitHub (c'est normal pour la sécurité).

Pour vérifier qu'ils sont bien configurés :
1. Allez dans **Settings > Secrets and variables > Actions**
2. Vous devriez voir la liste des secrets (sans leurs valeurs)
3. Si vous voyez `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY` dans la liste, c'est bon !

## 🧪 Tester le déploiement

Une fois les secrets configurés :

1. **Créez une branche de test** :
   ```bash
   git checkout -b test-deploy
   git push origin test-deploy
   ```

2. **Déclenchez le workflow manuellement** :
   - Allez dans **Actions** sur GitHub
   - Sélectionnez le workflow "Deploy"
   - Cliquez sur "Run workflow"
   - Choisissez l'environnement (staging)

3. **Vérifiez les logs** pour voir si les secrets sont bien utilisés

## 🚨 Dépannage

### Les secrets ne sont pas trouvés

- Vérifiez l'orthographe exacte (sensible à la casse)
- Vérifiez que vous êtes dans le bon repository
- Vérifiez que les secrets sont bien dans "Repository secrets" et non "Environment secrets"

### Erreur de connexion SSH

- Vérifiez que la clé publique est bien sur le serveur : `~/.ssh/authorized_keys`
- Vérifiez les permissions : `chmod 600 ~/.ssh/authorized_keys`
- Testez la connexion manuellement : `ssh -i ~/.ssh/github_actions_deploy deploy@votre-serveur`

### Erreur de permissions

- Vérifiez que l'utilisateur a les bonnes permissions sur le répertoire
- Vérifiez que PHP et Composer sont accessibles

