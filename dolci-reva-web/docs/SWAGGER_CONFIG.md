# Configuration Swagger UI - Endpoints déroulés par défaut

Ce guide explique comment configurer Swagger UI pour que tous les endpoints soient déroulés (expanded) par défaut.

## Configuration côté Backend (Laravel)

Si vous utilisez **L5-Swagger** (Laravel), modifiez le fichier de configuration :

### Fichier : `config/l5-swagger.php`

```php
<?php

return [
    // ... autres configurations
    
    'ui' => [
        'display' => [
            'doc_expansion' => 'list', // Changez en 'full' pour tout dérouler
            'default_models_expand_depth' => 3, // Profondeur d'expansion des modèles
            'default_model_expand_depth' => 3,
        ],
    ],
    
    // OU dans la section 'swagger_ui' :
    'swagger_ui' => [
        'docExpansion' => 'full', // 'list', 'full', ou 'none'
        'defaultModelsExpandDepth' => 3,
        'defaultModelExpandDepth' => 3,
        'defaultModelRendering' => 'model',
        'displayRequestDuration' => true,
        'filter' => true,
        'showExtensions' => true,
        'showCommonExtensions' => true,
    ],
];
```

### Alternative : Configuration via JavaScript dans le template

Si vous avez accès au template Swagger UI, ajoutez cette configuration :

```html
<script>
window.onload = function() {
  const ui = SwaggerUIBundle({
    url: "/api/documentation",
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout",
    docExpansion: "full", // ← Déroule tous les endpoints
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  });
};
</script>
```

## Configuration via URL Parameters

Vous pouvez aussi passer les paramètres directement dans l'URL :

```
http://votre-domaine/api/documentation?docExpansion=full
```

## Paramètres disponibles

| Paramètre | Valeurs | Description |
|-----------|---------|-------------|
| `docExpansion` | `"list"`, `"full"`, `"none"` | Contrôle l'expansion des endpoints |
| `defaultModelsExpandDepth` | `0-10` | Profondeur d'expansion des modèles de schéma |
| `defaultModelExpandDepth` | `0-10` | Profondeur d'expansion d'un modèle individuel |
| `filter` | `true`, `false` | Affiche/masque la barre de recherche |
| `showExtensions` | `true`, `false` | Affiche les extensions OpenAPI |

## Valeurs recommandées

Pour avoir tous les endpoints déroulés par défaut :

```php
'docExpansion' => 'full',
'defaultModelsExpandDepth' => 3,
'defaultModelExpandDepth' => 3,
```

## Vérification

Après modification :
1. Videz le cache Laravel : `php artisan config:clear`
2. Régénérez la documentation : `php artisan l5-swagger:generate`
3. Rechargez la page Swagger UI

## Note

Si vous utilisez une autre bibliothèque Swagger (comme `swagger-ui-express` pour Node.js), la configuration sera similaire mais dans un fichier différent.



