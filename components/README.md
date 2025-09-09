# Atomic Design System

This application uses the Atomic Design methodology to create a scalable, maintainable component architecture.

## 📁 Folder Structure

```
components/
├── atoms/          # Basic UI elements
├── molecules/      # Groups of atoms
├── organisms/      # Complex components
├── templates/      # Page layouts
└── pages/          # Route-specific components
```

## 🧬 Atoms

Basic building blocks that can't be broken down further.

### Button
```tsx
import { Button } from '@/components/atoms';

// Variants: default, destructive, outline, secondary, ghost, link
// Sizes: default, sm, lg, icon
<Button variant="default" size="default">
  Click me
</Button>
```

### Input
```tsx
import { Input } from '@/components/atoms';

<Input
  type="email"
  placeholder="Enter your email"
  className="w-full"
/>
```

### Textarea
```tsx
import { Textarea } from '@/components/atoms';

<Textarea
  placeholder="Enter your message"
  rows={4}
/>
```

### Icon
```tsx
import { Icon } from '@/components/atoms';
import { Heart } from 'lucide-react';

<Icon icon={Heart} size={20} className="text-red-500" />
```

## 🧪 Molecules

Groups of atoms working together as a unit.

### FormField
```tsx
import { FormField, InputField, TextareaField } from '@/components/molecules';

<InputField
  label="Email Address"
  type="email"
  error={errors.email}
  required
/>

<TextareaField
  label="Description"
  error={errors.description}
/>
```

### Card
```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/molecules';

<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## 🦠 Organisms

Complex components made of molecules and atoms.

### ChatMessage
```tsx
import { ChatMessage } from '@/components/organisms';

<ChatMessage
  id="msg-1"
  content="Hello, world!"
  role="user"
  timestamp={new Date()}
  onCopy={(content) => console.log('Copied:', content)}
/>
```

### ErrorBoundary
```tsx
import { ErrorBoundary } from '@/components/organisms';

<ErrorBoundary onError={(error, info) => reportError(error, info)}>
  <YourComponent />
</ErrorBoundary>
```

## 🎨 Design Principles

### 1. Component Composition
Components should be composable and reusable:
```tsx
// ✅ Good - Composable
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardContent>
    <FormField label="Name">
      <Input />
    </FormField>
  </CardContent>
</Card>

// ❌ Bad - Tightly coupled
<CustomCardWithForm />
```

### 2. Single Responsibility
Each component should have one clear purpose:
```tsx
// ✅ Good - Single responsibility
<Button onClick={handleSave}>Save</Button>

// ❌ Bad - Multiple responsibilities
<Button onClick={handleSaveAndNavigate}>Save & Continue</Button>
```

### 3. Props Interface
Use clear, typed prop interfaces:
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}
```

## 🎯 Usage Guidelines

### Importing Components
```tsx
// Import specific components
import { Button, Input } from '@/components/atoms';
import { Card } from '@/components/molecules';
import { ChatMessage } from '@/components/organisms';

// Or import entire layers
import * as Atoms from '@/components/atoms';
import * as Molecules from '@/components/molecules';
```

### Creating New Components

1. **Choose the appropriate level:**
   - Atoms: Basic HTML elements with styling
   - Molecules: Groups of atoms (forms, cards)
   - Organisms: Complex UI sections (headers, sidebars)

2. **Follow the naming convention:**
   ```tsx
   // Atoms: PascalCase (Button, Input, Icon)
   // Molecules: PascalCase (FormField, Card)
   // Organisms: PascalCase (ChatMessage, ErrorBoundary)
   ```

3. **Export from index files:**
   ```tsx
   // components/atoms/index.ts
   export { Button } from './Button';
   export type { ButtonProps } from './Button';
   ```

### Styling Guidelines

1. **Use Tailwind CSS classes**
2. **Leverage CSS custom properties for theming**
3. **Use the `cn` utility for conditional classes**
4. **Follow the existing design tokens**

```tsx
import { cn } from '@/lib/utils';

const Button = ({ className, variant = 'default', ...props }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center',
      variant === 'default' && 'bg-primary text-primary-foreground',
      className
    )}
    {...props}
  />
);
```

## 🔧 Development Workflow

### 1. Start with Atoms
When building new features, start with the smallest components:
1. Create necessary atoms
2. Combine into molecules
3. Build organisms from molecules
4. Create templates and pages

### 2. Component Documentation
Document your components with examples:
```tsx
/**
 * A customizable button component
 * @example
 * <Button variant="primary" size="lg">Click me</Button>
 */
export const Button = () => {/* ... */}
```

### 3. Testing
Test components at each level:
- **Atoms**: Unit tests for styling and basic functionality
- **Molecules**: Integration tests for composed behavior
- **Organisms**: End-to-end tests for complex interactions

## 🚀 Migration Guide

### From Existing Components

1. **Identify component level:**
   ```tsx
   // Before: Large monolithic component
   const ComplexForm = () => {/* 200+ lines */}

   // After: Broken into atomic pieces
   const SimpleForm = () => (
     <FormField label="Name">
       <Input />
     </FormField>
   );
   ```

2. **Extract common patterns:**
   ```tsx
   // Before: Repeated patterns
   <input className="border rounded px-3 py-2" />

   // After: Reusable atom
   <Input />
   ```

3. **Update imports:**
   ```tsx
   // Before
   import Button from '@/components/Button';

   // After
   import { Button } from '@/components/atoms';
   ```

## 📊 Benefits

- **Reusability**: Components can be used across the application
- **Maintainability**: Changes to atoms affect all dependent components
- **Consistency**: Standardized design and behavior
- **Scalability**: Easy to add new components and features
- **Testing**: Easier to test small, focused components

## 🎨 Theming

Components support theming through CSS custom properties:

```css
:root {
  --primary: 220 70% 50%;
  --background: 0 0% 100%;
  /* ... more variables */
}
```

Components automatically use these design tokens for consistent theming.
