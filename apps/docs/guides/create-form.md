# Creating Forms with ui8kit/core

This guide demonstrates how to build forms using the `Block` and `Box` components from `@ui8kit/core`.

## Overview

ui8kit/core provides polymorphic components that can render as any HTML element:
- **Block** - Semantic container with `component` prop for form elements
- **Box** - Flexible primitive with full variant support for input fields

## Basic Form Structure

Use `Block` with `component="form"` as the form wrapper:

```jsx
import { Block, Box, Button } from '@ui8kit/core';

function SimpleForm() {
  return (
    <Block 
      component="form"
      w="full"
      maxW="md"
      p="lg"
      rounded="lg"
      shadow="md"
      bg="white"
    >
      {/* Form fields go here */}
    </Block>
  );
}
```

## Creating Input Fields

Use `Box` with `component="input"` for text inputs:

```jsx
<Box 
  component="input"
  type="text"
  placeholder="Enter your name"
  w="full"
  p="md"
  rounded="md"
  border="default"
  borderColor="gray-300"
/>
```

### Input Variants

#### Text Input with Focus Styles
```jsx
<Box 
  component="input"
  type="text"
  placeholder="Email address"
  w="full"
  p="md"
  rounded="lg"
  border="default"
  bg="white"
  c="gray-900"
  className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
/>
```

#### Password Input
```jsx
<Box 
  component="input"
  type="password"
  placeholder="Password"
  w="full"
  p="md"
  rounded="md"
  border="default"
  borderColor="gray-300"
/>
```

#### Number Input
```jsx
<Box 
  component="input"
  type="number"
  placeholder="Age"
  w="full"
  p="md"
  rounded="md"
  border="default"
  min={0}
  max={120}
/>
```

## Creating Textarea Fields

Use `Box` with `component="textarea"` for multi-line text:

```jsx
<Box 
  component="textarea"
  rows={4}
  placeholder="Enter your message"
  w="full"
  p="md"
  rounded="md"
  border="default"
  borderColor="gray-300"
  className="resize-none"
/>
```

### Textarea with Min Height
```jsx
<Box 
  component="textarea"
  placeholder="Description"
  w="full"
  p="md"
  rounded="lg"
  border="default"
  minH="32"
  className="resize-y"
/>
```

## Complete Form Example

Here's a full contact form implementation:

```jsx
import { Block, Box, Button } from '@ui8kit/core';

function ContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <Block 
      component="form"
      onSubmit={handleSubmit}
      w="full"
      maxW="lg"
      p="lg"
      rounded="lg"
      shadow="lg"
      bg="white"
      className="space-y-6"
    >
      {/* Name Field */}
      <Block w="full" className="space-y-2">
        <Box component="label" c="gray-700" className="text-sm font-medium">
          Full Name
        </Box>
        <Box 
          component="input"
          type="text"
          name="name"
          required
          w="full"
          p="md"
          rounded="md"
          border="default"
          borderColor="gray-300"
          className="focus:ring-2 focus:ring-blue-500"
        />
      </Block>

      {/* Email Field */}
      <Block w="full" className="space-y-2">
        <Box component="label" c="gray-700" className="text-sm font-medium">
          Email Address
        </Box>
        <Box 
          component="input"
          type="email"
          name="email"
          required
          w="full"
          p="md"
          rounded="md"
          border="default"
          borderColor="gray-300"
          className="focus:ring-2 focus:ring-blue-500"
        />
      </Block>

      {/* Message Field */}
      <Block w="full" className="space-y-2">
        <Box component="label" c="gray-700" className="text-sm font-medium">
          Message
        </Box>
        <Box 
          component="textarea"
          name="message"
          rows={5}
          required
          w="full"
          p="md"
          rounded="md"
          border="default"
          borderColor="gray-300"
          minH="32"
          className="focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </Block>

      {/* Submit Button */}
      <Button 
        type="submit"
        w="full"
        size="lg"
        variant="default"
      >
        Send Message
      </Button>
    </Block>
  );
}
```

## Form with Grid Layout

Use `Box` with flex/grid for multi-column layouts:

```jsx
<Block 
  component="form"
  w="full"
  maxW="2xl"
  p="lg"
  rounded="lg"
  shadow="md"
  bg="white"
>
  <Box 
    display="grid" 
    className="grid-cols-1 md:grid-cols-2 gap-6"
  >
    {/* First Name */}
    <Block className="space-y-2">
      <Box component="label" className="text-sm font-medium">
        First Name
      </Box>
      <Box 
        component="input"
        type="text"
        w="full"
        p="md"
        rounded="md"
        border="default"
      />
    </Block>

    {/* Last Name */}
    <Block className="space-y-2">
      <Box component="label" className="text-sm font-medium">
        Last Name
      </Box>
      <Box 
        component="input"
        type="text"
        w="full"
        p="md"
        rounded="md"
        border="default"
      />
    </Block>
  </Box>
</Block>
```

## Available Variant Props

### Spacing
- `p`, `px`, `py`, `pt`, `pb`, `pl`, `pr` - Padding
- `m`, `mx`, `my`, `mt`, `mb`, `ml`, `mr` - Margin

### Layout
- `w` - Width (`"full"`, `"1/2"`, etc.)
- `h` - Height
- `minH` - Minimum height
- `maxW` - Maximum width (`"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, etc.)
- `display` - Display type

### Borders & Styling
- `border` - Border width (`"default"`, `"2"`, `"4"`, etc.)
- `borderColor` - Border color
- `rounded` - Border radius (`"none"`, `"sm"`, `"md"`, `"lg"`, `"full"`)
- `shadow` - Box shadow

### Colors
- `bg` - Background color
- `c` - Text color

## Best Practices

1. **Always set `w="full"`** on input fields for consistent width
2. **Use `Block` for form structure** (form element, field groups)
3. **Use `Box` for actual inputs** (input, textarea, select)
4. **Combine variant props with Tailwind classes** for focus states
5. **Use `minH` for textarea** instead of fixed height
6. **Apply `className="resize-none"`** to prevent textarea resizing if needed

## Form Validation Example

```jsx
function ValidatedInput({ error, label, ...props }) {
  return (
    <Block w="full" className="space-y-2">
      <Box component="label" c="gray-700" className="text-sm font-medium">
        {label}
      </Box>
      <Box 
        component="input"
        w="full"
        p="md"
        rounded="md"
        border="default"
        borderColor={error ? "red-500" : "gray-300"}
        bg={error ? "red-50" : "white"}
        className={error ? "focus:ring-red-500" : "focus:ring-blue-500"}
        {...props}
      />
      {error && (
        <Box c="red-600" className="text-sm">
          {error}
        </Box>
      )}
    </Block>
  );
}
```

## Conclusion

The `Block` and `Box` components from ui8kit/core provide a powerful foundation for building forms with:
- Type-safe variant props
- Consistent styling system
- Full HTML element flexibility via `component` prop
- Seamless integration with Tailwind CSS\