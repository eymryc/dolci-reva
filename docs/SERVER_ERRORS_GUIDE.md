# Guide d'utilisation de la gestion des erreurs serveur

Ce guide explique comment utiliser le système de gestion des erreurs serveur réutilisable dans vos formulaires.

## Composants créés

1. **`ServerErrorPanel`** - Composant UI pour afficher les erreurs
2. **`useServerErrors`** - Hook personnalisé pour gérer la logique des erreurs
3. **`createFieldLabels`** - Fonction utilitaire pour créer les labels des champs

## Structure des fichiers

```
components/ui/ServerErrorPanel.tsx    # Composant d'affichage des erreurs
hooks/use-server-errors.ts           # Hook de gestion des erreurs
lib/server-error-utils.ts            # Utilitaires pour les labels
```

## Utilisation dans un formulaire

### Étape 1 : Importer les composants nécessaires

```tsx
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
```

### Étape 2 : Configurer le hook dans votre composant

```tsx
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  setError,
  clearErrors,
} = useForm<YourFormValues>({
  resolver: zodResolver(yourSchema),
});

// Mapping des noms de champs du serveur (snake_case) vers le formulaire (camelCase)
const fieldMapping: Record<string, keyof YourFormValues> = {
  first_name: "firstName",
  last_name: "lastName",
  email: "email",
  // ... autres champs
};

// Labels personnalisés pour les champs (optionnel)
const fieldLabels = createFieldLabels({
  first_name: "Prénom",
  last_name: "Nom",
  email: "Email",
  // ... autres labels
});

// Hook pour gérer les erreurs du serveur
const { 
  serverErrors, 
  showErrorPanel, 
  handleServerError, 
  clearErrors: clearServerErrors, 
  setShowErrorPanel 
} = useServerErrors<YourFormValues>({
  setError,
  fieldMapping,
});
```

### Étape 3 : Utiliser dans la fonction onSubmit

```tsx
const onSubmit = async (data: YourFormValues) => {
  try {
    // Effacer les erreurs précédentes
    clearServerErrors();
    clearErrors();

    // Votre appel API
    const response = await api.post("your-endpoint", data);

    // Gérer le succès
    toast.success("Opération réussie");
  } catch (error) {
    const { errorMessage, hasDetailedErrors } = handleServerError(error);

    // Afficher le toast seulement s'il n'y a pas d'erreurs détaillées
    if (!hasDetailedErrors) {
      toast.error(errorMessage);
    }
  }
};
```

### Étape 4 : Ajouter le panneau d'erreurs dans le JSX

```tsx
<CardContent>
  {/* Panneau d'erreurs du serveur */}
  <ServerErrorPanel
    errors={serverErrors}
    fieldLabels={fieldLabels}
    show={showErrorPanel}
    onClose={() => {
      setShowErrorPanel(false);
      clearServerErrors();
      clearErrors();
    }}
  />
  
  <form onSubmit={handleSubmit(onSubmit)}>
    {/* Votre formulaire */}
  </form>
</CardContent>
```

## Exemple complet

Voici un exemple complet pour un formulaire de connexion :

```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ServerErrorPanel } from "@/components/ui/ServerErrorPanel";
import { useServerErrors } from "@/hooks/use-server-errors";
import { createFieldLabels } from "@/lib/server-error-utils";
import api from "@/lib/axios";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Mapping des champs
  const fieldMapping: Record<string, keyof LoginFormValues> = {
    email: "email",
    password: "password",
  };

  // Labels personnalisés
  const fieldLabels = createFieldLabels({
    email: "Email",
    password: "Mot de passe",
  });

  // Hook pour gérer les erreurs
  const { 
    serverErrors, 
    showErrorPanel, 
    handleServerError, 
    clearErrors: clearServerErrors, 
    setShowErrorPanel 
  } = useServerErrors<LoginFormValues>({
    setError,
    fieldMapping,
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      clearServerErrors();
      clearErrors();

      const response = await api.post("auth/login", data);
      toast.success("Connexion réussie");
    } catch (error) {
      const { errorMessage, hasDetailedErrors } = handleServerError(error);

      if (!hasDetailedErrors) {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ServerErrorPanel
        errors={serverErrors}
        fieldLabels={fieldLabels}
        show={showErrorPanel}
        onClose={() => {
          setShowErrorPanel(false);
          clearServerErrors();
          clearErrors();
        }}
      />
      
      {/* Vos champs de formulaire */}
    </form>
  );
}
```

## Personnalisation

### Personnaliser les labels des champs

```tsx
const fieldLabels = createFieldLabels({
  // Labels personnalisés qui remplaceront les labels par défaut
  custom_field: "Mon champ personnalisé",
  another_field: "Autre champ",
});
```

### Personnaliser le panneau d'erreurs

```tsx
<ServerErrorPanel
  errors={serverErrors}
  fieldLabels={fieldLabels}
  show={showErrorPanel}
  title="Erreurs de validation"  // Titre personnalisé
  description="Veuillez corriger les erreurs suivantes :"  // Description personnalisée
  onClose={() => {
    setShowErrorPanel(false);
    clearServerErrors();
    clearErrors();
  }}
/>
```

## Format attendu des erreurs du serveur

Le système attend que les erreurs du serveur soient dans le format suivant :

```json
{
  "message": "Message d'erreur général",
  "data": {
    "field_name": ["Erreur 1", "Erreur 2"],
    "another_field": ["Erreur unique"]
  }
}
```

Ou simplement :

```json
{
  "message": "Message d'erreur général",
  "data": {
    "field_name": "Erreur unique"
  }
}
```

## Avantages de cette approche

1. **Réutilisable** - Un seul composant et hook pour tous les formulaires
2. **Cohérent** - Même UX pour tous les formulaires
3. **Maintenable** - Modifications centralisées
4. **Type-safe** - Support complet TypeScript
5. **Flexible** - Personnalisable selon les besoins

## Formulaires à mettre à jour

- [x] `app/auth/sign-up/page.tsx` ✅
- [x] `app/auth/sign-in/page.tsx` ✅
- [ ] `components/admin/users/UserForm.tsx`
- [ ] `components/admin/residences/ResidenceForm.tsx`
- [ ] `components/admin/bookings/BookingForm.tsx`
- [ ] `components/admin/commissions/CommissionForm.tsx`
- [ ] `components/admin/amenities/AmenityForm.tsx`
- [ ] `components/admin/business-types/BusinessTypeForm.tsx`
- [ ] Autres formulaires...

