# TypeScript TypeScriptToLua Language Service plugin

TypeScript Language Service plugin for [TypeScriptToLua](https://typescripttolua.github.io).

## Installation

The simplest way to use this plugin in Visual Studio Code is to install the
[extension](https://marketplace.visualstudio.com/items?itemName=ark120202.vscode-typescript-to-lua).

For other editors that use TypeScript Language Service you can enable this plugin manually:

```shell
npm install typescript-tstl-plugin
# or
yarn add typescript-tstl-plugin
```

tsconfig.json:

```jsonc
{
  "compilerOptions": {
    "plugins": [{ "name": "typescript-tstl-plugin" }]
  },
  "tstl": {
    // "tstl" key is required
  }
}
```

## Features

Currently the only feature this plugin implements is displaying TypeScriptToLua diagnostics:

![](/docs/diagnostics.png)
