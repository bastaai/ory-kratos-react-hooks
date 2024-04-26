<img src="https://gist.githubusercontent.com/viktorbasta/d60b2555b30c415c8da7f4cc91282a7e/raw/84debc03b126793c193f40010388b1855aec1ad4/basta-labs-logo-horizontal.png" height="120" />

# Ory Kratos React Hooks

Collection of convenient hooks for working with Ory Kratos, identity and user
management system.

## Hooks

- `useFlow`: This hook allows you to easily manage authentication flows in your
  React applications.
- `useSession`: Use this hook to access and manage user sessions with Ory
  Kratos.

## Examples

### useFlow

- `flowType`: login | registration | recovery | settings | verification
- `render` keys: input | a | img | text | script. Components are uncontrolled
  and submitted via form.

```typescript
const { html, return_to } = useFlow({
  flowType: 'login',
  options: {
    render: {
      input: ({ meta, props }) => {
        if (props.type === 'submit') {
          return <Button {...props}>{meta.label?.text}</Button>;
        }

        return <input {...props} />;
      },
      a: () => {...},
      img: () => {...},
      text: () => {...},
      script: () => {...},
    },
  },
})
```
