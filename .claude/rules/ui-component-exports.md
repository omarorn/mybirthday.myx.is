# UI Component Complete Export Pattern

**Purpose:** Ensure all UI component subcomponents are exported
**Applies to:** Files matching `**/components/ui/*.tsx`
**Priority:** P2 (Prevents build failures when components are refactored)
**Created:** January 9, 2026

---

## Rule: Export All Standard Component Variants

### Core Principle

**When creating compound components (Card, Dialog, Table, etc.), always export all standard subcomponents, even if not immediately needed.**

Missing exports cause build failures when other files try to import the missing subcomponent.

---

## Standard Component Patterns

### Card Component (Complete)

```typescript
// Card.tsx - Complete implementation
import { cn } from '../../lib/utils';

// Base Card
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('rounded-xl bg-white p-6 shadow-sm', className)} {...props}>
      {children}
    </div>
  );
}

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

// Card Title
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  );
}

// Card Description (often forgotten!)
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500', className)} {...props}>
      {children}
    </p>
  );
}

// Card Content
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return <div className={cn('', className)} {...props}>{children}</div>;
}

// Card Footer (optional but common)
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('flex items-center gap-4 mt-4', className)} {...props}>
      {children}
    </div>
  );
}
```

---

## Common Component Families

### Compound Components Checklist

When implementing compound components, ensure all standard subcomponents are exported:

**Card:**
- [ ] Card (base)
- [ ] CardHeader
- [ ] CardTitle
- [ ] CardDescription ← Often forgotten!
- [ ] CardContent
- [ ] CardFooter (optional)

**Dialog/Modal:**
- [ ] Dialog (base)
- [ ] DialogContent
- [ ] DialogHeader
- [ ] DialogTitle
- [ ] DialogDescription
- [ ] DialogFooter (optional)
- [ ] DialogClose (optional)

**Table:**
- [ ] Table (base)
- [ ] TableHeader
- [ ] TableBody
- [ ] TableFooter (optional)
- [ ] TableRow
- [ ] TableHead
- [ ] TableCell
- [ ] TableCaption (optional)

**Accordion:**
- [ ] Accordion (base)
- [ ] AccordionItem
- [ ] AccordionTrigger
- [ ] AccordionContent

---

## Error Symptoms

### Symptom 1: Export Not Found

```
error during build:
"CardDescription" is not exported by "src/components/ui/card.tsx",
imported by "src/pages/SomePage.tsx"
```

**Root Cause**: CardDescription imported but not exported from Card.tsx

**Solution**: Add CardDescription export to Card.tsx

### Symptom 2: Import Fails

```typescript
// This import fails at build time
import { Card, CardContent, CardDescription } from '../components/ui/card';
//                          ^^^^^^^^^^^^^^^^ - Not exported!
```

---

## Prevention Pattern

### Step 1: Define All Subcomponents Upfront

When creating a new compound component, define all standard subcomponents immediately, even if some aren't used yet.

```typescript
// ✅ GOOD: All standard Card subcomponents defined
export function Card() { /* ... */ }
export function CardHeader() { /* ... */ }
export function CardTitle() { /* ... */ }
export function CardDescription() { /* ... */ }  // ← Define even if unused
export function CardContent() { /* ... */ }
export function CardFooter() { /* ... */ }       // ← Define even if unused
```

### Step 2: Use Industry Standard Naming

Follow established component libraries (shadcn/ui, Radix UI, Chakra UI) for naming conventions:

**Standard Naming Patterns:**
- `ComponentBase` (e.g., `Card`, `Dialog`, `Table`)
- `ComponentHeader` - Top section
- `ComponentTitle` - Heading text
- `ComponentDescription` - Subtitle/helper text
- `ComponentContent` - Main content area
- `ComponentFooter` - Bottom section (actions, meta)

### Step 3: Create Component Template

Use a standard template for new compound components:

```typescript
// Template for compound components
import { cn } from '../../lib/utils';

// Base Component
interface [Component]Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function [Component]({ className, children, ...props }: [Component]Props) {
  return <div className={cn('[base-styles]', className)} {...props}>{children}</div>;
}

// Header
interface [Component]HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function [Component]Header({ className, children, ...props }: [Component]HeaderProps) {
  return <div className={cn('[header-styles]', className)} {...props}>{children}</div>;
}

// Title
interface [Component]TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function [Component]Title({ className, children, ...props }: [Component]TitleProps) {
  return <h3 className={cn('[title-styles]', className)} {...props}>{children}</h3>;
}

// Description (don't forget this!)
interface [Component]DescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function [Component]Description({ className, children, ...props }: [Component]DescriptionProps) {
  return <p className={cn('[description-styles]', className)} {...props}>{children}</p>;
}

// Content
interface [Component]ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function [Component]Content({ className, children, ...props }: [Component]ContentProps) {
  return <div className={cn('[content-styles]', className)} {...props}>{children}</div>;
}

// Footer (optional)
interface [Component]FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function [Component]Footer({ className, children, ...props }: [Component]FooterProps) {
  return <div className={cn('[footer-styles]', className)} {...props}>{children}</div>;
}
```

---

## Verification

### Check All Exports Are Present

```bash
# List all exports from a component file
grep "^export function" src/components/ui/Card.tsx

# Expected output:
# export function Card
# export function CardHeader
# export function CardTitle
# export function CardDescription
# export function CardContent
# export function CardFooter
```

---

## References

- **shadcn/ui Card:** https://ui.shadcn.com/docs/components/card
- **Radix UI:** https://www.radix-ui.com/primitives

---

**This rule prevents build failures from incomplete compound component exports.**
