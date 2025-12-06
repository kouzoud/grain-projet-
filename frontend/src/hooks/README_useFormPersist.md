# 📝 useFormPersist Hook - Documentation

## 🎯 Objectif

Hook React personnalisé qui permet de **persister automatiquement** les données d'un formulaire dans le `localStorage`. Les données sont sauvegardées à chaque modification et restaurées au rechargement de la page (F5).

## 🚀 Utilisation Rapide

```javascript
import { useFormPersist } from '../hooks/useFormPersist';

const MyForm = () => {
    const { values, handleChange, setFieldValue, clearForm } = useFormPersist(
        'my_unique_form_key',  // Clé unique pour le localStorage
        {                       // Valeurs initiales
            name: '',
            email: '',
            age: 0
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        // ... envoyer les données
        clearForm(); // ⚠️ CRUCIAL : Nettoyer après soumission réussie
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                name="name" 
                value={values.name} 
                onChange={handleChange} 
            />
            <input 
                name="email" 
                value={values.email} 
                onChange={handleChange} 
            />
            <button type="submit">Envoyer</button>
        </form>
    );
};
```

## 📖 API du Hook

### Paramètres

| Paramètre | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Identifiant unique dans le localStorage (ex: `"contact_form"`) |
| `initialValues` | `object` | Valeurs par défaut du formulaire |

### Retour

| Propriété | Type | Description |
|-----------|------|-------------|
| `values` | `object` | État actuel du formulaire (synchronisé avec localStorage) |
| `handleChange` | `function` | Handler pour les inputs classiques (`e.target.name` & `e.target.value`) |
| `setFieldValue` | `function` | Modifier manuellement un champ : `setFieldValue('fieldName', newValue)` |
| `clearForm` | `function` | Réinitialiser le formulaire et supprimer du localStorage |

## 🔧 Exemples d'Utilisation

### 1. Formulaire Simple

```javascript
const ContactForm = () => {
    const { values, handleChange, clearForm } = useFormPersist('contact_form', {
        name: '',
        message: ''
    });

    const onSubmit = async (e) => {
        e.preventDefault();
        await sendMessage(values);
        clearForm(); // ✅ Nettoyer après succès
    };

    return (
        <form onSubmit={onSubmit}>
            <input name="name" value={values.name} onChange={handleChange} />
            <textarea name="message" value={values.message} onChange={handleChange} />
            <button type="submit">Envoyer</button>
        </form>
    );
};
```

### 2. Champs Complexes (Select, Checkbox, File)

```javascript
const RegistrationForm = () => {
    const { values, handleChange, setFieldValue, clearForm } = useFormPersist('register_form', {
        username: '',
        role: 'user',
        acceptTerms: false,
        profilePicture: null
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFieldValue('profilePicture', file ? file.name : null); // ⚠️ Ne stocker que le nom
    };

    return (
        <form>
            {/* Input standard */}
            <input name="username" value={values.username} onChange={handleChange} />
            
            {/* Select */}
            <select name="role" value={values.role} onChange={handleChange}>
                <option value="user">Utilisateur</option>
                <option value="admin">Admin</option>
            </select>
            
            {/* Checkbox */}
            <input 
                type="checkbox" 
                checked={values.acceptTerms} 
                onChange={(e) => setFieldValue('acceptTerms', e.target.checked)} 
            />
            
            {/* File (stocker seulement le nom) */}
            <input type="file" onChange={handleFileChange} />
        </form>
    );
};
```

### 3. Multi-étapes (Wizard Form)

```javascript
const WizardForm = () => {
    const { values, handleChange, setFieldValue, clearForm } = useFormPersist('wizard_form', {
        step: 1,
        personalInfo: { name: '', email: '' },
        preferences: { theme: 'light' }
    });

    const nextStep = () => setFieldValue('step', values.step + 1);
    const prevStep = () => setFieldValue('step', values.step - 1);

    const handleSubmit = async () => {
        await saveData(values);
        clearForm(); // ✅ Réinitialiser tout le wizard
    };

    return (
        <div>
            {values.step === 1 && (
                <div>
                    <input 
                        name="name" 
                        value={values.personalInfo.name} 
                        onChange={(e) => setFieldValue('personalInfo', {
                            ...values.personalInfo,
                            name: e.target.value
                        })} 
                    />
                    <button onClick={nextStep}>Suivant</button>
                </div>
            )}
            {/* Autres étapes... */}
        </div>
    );
};
```

## ⚠️ Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours nettoyer après soumission réussie** :
   ```javascript
   const onSubmit = async () => {
       await api.send(values);
       clearForm(); // ✅ Crucial !
   };
   ```

2. **Utiliser des clés uniques par formulaire** :
   ```javascript
   // ✅ Bon
   useFormPersist('user_registration_form', {...})
   useFormPersist('contact_support_form', {...})
   
   // ❌ Éviter les noms génériques
   useFormPersist('form', {...})
   ```

3. **Mode édition : clé avec ID** :
   ```javascript
   const formKey = isEditMode 
       ? `edit_form_${itemId}` 
       : 'create_form';
   ```

### ❌ À ÉVITER

1. **Ne pas stocker de fichiers complets** :
   ```javascript
   // ❌ Mauvais (localStorage limité à ~5-10MB)
   setFieldValue('photo', fileObject);
   
   // ✅ Bon (stocker seulement le nom)
   setFieldValue('photoName', file.name);
   ```

2. **Ne pas stocker de données sensibles** :
   ```javascript
   // ❌ Éviter
   useFormPersist('payment_form', {
       creditCard: '', // Données sensibles !
       cvv: ''
   });
   ```

3. **Ne pas oublier de nettoyer** :
   ```javascript
   // ❌ Les données resteront en mémoire !
   const onSubmit = async () => {
       await api.send(values);
       navigate('/success'); // ❌ Pas de clearForm()
   };
   ```

## 🛠️ Intégration avec react-hook-form

Si vous utilisez déjà `react-hook-form`, vous pouvez combiner les deux :

```javascript
import { useForm } from 'react-hook-form';
import { useFormPersist } from '../hooks/useFormPersist';

const HybridForm = () => {
    const { register, handleSubmit, setValue } = useForm();
    
    // Persister seulement certains champs non-gérés par react-hook-form
    const { values: extraData, setFieldValue, clearForm } = useFormPersist('extra_data', {
        currentStep: 1,
        selectedTemplate: null
    });

    const onSubmit = async (formData) => {
        await api.send({ ...formData, ...extraData });
        clearForm();
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('name')} />
            {/* ... */}
        </form>
    );
};
```

## 🧪 Test de Persistence

Pour tester que la persistence fonctionne :

1. Remplissez le formulaire
2. Appuyez sur **F5** (rechargement)
3. Vérifiez que les données sont toujours là ✅
4. Soumettez le formulaire
5. Revenez sur le formulaire → Il doit être vide ✅

## 📊 Limitations

- **Taille** : localStorage limité à ~5-10MB selon le navigateur
- **Type** : Seulement des données sérialisables en JSON (pas de fonctions, pas de `File` objects)
- **Sécurité** : Accessible en JavaScript → Ne pas stocker de données sensibles
- **Navigation privée** : localStorage effacé à la fermeture du navigateur en mode privé

## 🔍 Debugging

Pour voir ce qui est stocké :

```javascript
// Dans la console du navigateur
localStorage.getItem('my_form_key');

// Pour tout effacer manuellement
localStorage.removeItem('my_form_key');
```

---

**✨ Ce hook est utilisé dans** : `DeclarationForm.jsx` (formulaire de déclaration de cas humanitaire)
