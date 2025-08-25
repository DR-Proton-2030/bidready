# Signup Form Hooks - Modular Architecture

This document explains the modular hook system for the signup form, making it reusable and maintainable.

## 📁 Hook Structure

```
src/hooks/
├── useFormValidation.ts    # Form validation logic
├── useFileUpload.ts        # File upload management
├── useStepper.ts          # Step navigation logic
├── useSignup.ts           # API submission logic
├── useSignupForm.ts       # Form state management
├── useSignupFlow.ts       # Main composite hook
└── index.ts               # Barrel exports
```

## 🎯 Individual Hooks

### 1. `useFormValidation`
Handles all form validation logic with a schema-based approach.

```tsx
import { useFormValidation } from "@/hooks";

const { errors, validateStep, clearError, setFieldError } = useFormValidation();

// Validate a specific step
const isValid = validateStep(1, formData);

// Clear specific field error
clearError('email');

// Set custom error
setFieldError('email', 'Email already exists');
```

### 2. `useFileUpload`
Manages file uploads with preview functionality.

```tsx
import { useFileUpload } from "@/hooks";

const { profileFile, companyFile, handleFileSelect, resetFiles } = useFileUpload();

// Handle file selection
handleFileSelect(file, 'profile'); // or 'company'

// Access file and preview
console.log(profileFile.file, profileFile.preview);
```

### 3. `useStepper`
Controls step navigation in multi-step forms.

```tsx
import { useStepper } from "@/hooks";

const {
  currentStep,
  completedSteps,
  goToNextStep,
  goToPreviousStep,
  isFirstStep,
  isLastStep
} = useStepper(3); // 3 total steps

// Navigate steps
if (!isLastStep) goToNextStep();
if (!isFirstStep) goToPreviousStep();
```

### 4. `useSignupForm`
Manages form state and input handling.

```tsx
import { useSignupForm } from "@/hooks";

const { formData, handleInputChange, updateFormData, resetForm } = useSignupForm();

// Handle input changes
<input name="email" onChange={handleInputChange} value={formData.email} />

// Programmatically update field
updateFormData('email', 'new@email.com');
```

### 5. `useSignup`
Handles API submission and loading states.

```tsx
import { useSignup } from "@/hooks";

const { isLoading, showSuccess, submitSignup, handleSuccessClose } = useSignup({
  onSuccess: () => console.log('Success!'),
  onError: (error) => console.log('Error:', error)
});

// Submit form
const result = await submitSignup(formData, profileFile, companyFile);
```

## 🚀 Main Composite Hook

### `useSignupFlow`
Combines all hooks into a single, easy-to-use interface.

```tsx
import { useSignupFlow } from "@/hooks";

const SignupForm = () => {
  const {
    // Form data
    formData,
    handleInputChange,
    
    // File uploads
    profilePreview,
    logoPreview,
    handleFileSelect,
    
    // Navigation
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    isFirstStep,
    isLastStep,
    
    // Validation
    errors,
    
    // Submission
    isLoading,
    showSuccess,
    handleSubmit,
    handleSuccessClose,
  } = useSignupFlow();

  return (
    <form>
      {/* Your form JSX here */}
    </form>
  );
};
```

## 🔧 Custom Usage Examples

### Example 1: Custom Multi-Step Form
```tsx
import { useSignupForm, useFormValidation, useStepper } from "@/hooks";

const CustomForm = () => {
  const { formData, handleInputChange } = useSignupForm();
  const { errors, validateStep } = useFormValidation();
  const { currentStep, goToNextStep } = useStepper(2);

  const handleNext = () => {
    if (validateStep(currentStep, formData)) {
      goToNextStep();
    }
  };

  return (
    <div>
      <input name="email" onChange={handleInputChange} />
      {errors.email && <span>{errors.email}</span>}
      <button onClick={handleNext}>Next</button>
    </div>
  );
};
```

### Example 2: Simple Single-Step Form
```tsx
import { useSignupForm, useFormValidation, useSignup } from "@/hooks";

const SimpleForm = () => {
  const { formData, handleInputChange } = useSignupForm();
  const { errors, validateStep } = useFormValidation();
  const { submitSignup, isLoading } = useSignup();

  const handleSubmit = async () => {
    if (validateStep(1, formData)) {
      await submitSignup(formData, null, null);
    }
  };

  return (
    <form>
      <input name="email" onChange={handleInputChange} />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};
```

## 🎨 Validation Schema

The validation system uses a schema-based approach with common rules:

```tsx
import { ValidationPatterns, CommonRules } from "@/utils/validation";

const customSchema = {
  email: CommonRules.email,
  password: CommonRules.password,
  website: CommonRules.url,
  custom_field: {
    required: true,
    minLength: 5,
    pattern: ValidationPatterns.alphanumeric,
    custom: (value) => value.includes('test') ? 'Cannot contain test' : null
  }
};
```

## 🔄 Benefits of This Architecture

1. **Reusability**: Each hook can be used independently in different components
2. **Testability**: Each hook can be tested in isolation
3. **Maintainability**: Logic is separated by concern
4. **Flexibility**: Mix and match hooks as needed
5. **Type Safety**: Full TypeScript support with proper typing
6. **Performance**: Optimized with useCallback and proper dependency arrays

## 📝 Usage Guidelines

1. **Use `useSignupFlow`** for complete signup forms with all features
2. **Use individual hooks** when you need specific functionality only
3. **Extend validation** by modifying the validation schema
4. **Add new hooks** following the same pattern for new features
5. **Test hooks** individually for better coverage

This modular approach makes the signup form code more maintainable, reusable, and easier to test while providing both simple and advanced usage patterns.
