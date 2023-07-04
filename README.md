# audit-tools

## soller 

Show attack surface for solidity project. Prints public & external functions which change contract state, the output can be filtered by a list of modifiers (onlyOwner & etc)

### Installation

- clone repo
- install
```
npm install -g .
```

### Usage

```
soller attack src/**/*.sol
```

Optional parameters
- -m can provide a function modifier(s), functions with this modifier will be removed from the output. 
