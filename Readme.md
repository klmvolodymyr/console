# ManageTeam Console Commands

Console command runner used

## Installation

Create `.npmrc` file near the `package.json` file with `registry=http://0.0.0.0:4873/` content. Then install with:

```
npm install vklymniuk-console --save
```

Add the following to `package.json` depending on your configuration:

```javascript
{
  "scripts": {
    "console": "vklymniuk-console", // CommonJS
    "console": "node -r esm node_modules/.bin/vklymniuk-console" // For ES modules support within ESM
  }
}
```

## Usage

See the available list of commands:

```bash
npm run console
```

Run the command:

```bash
npm run console -- command:name --param=1
```

Commands are automatically registered from src/commands directory of your project or
from packages with prefix dt- with lib/commands directory.

Example of `src/commands/test-command.js` file:

```javascript
export const metadata = {
    name: "testing-test",
    description: "Sample command",
    args: {
        id: {
            default: "1"
        },
        job: {
            default: "none"
        }
    }
};

export async function run (args) {
    const { info } = await import("vklymniuk-logger");
    info("This is test!", args);
}
```

Runs with `npm run console -- testing-test`