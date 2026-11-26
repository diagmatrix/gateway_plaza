# gateway_plaza
MTG Commander games logger and analyser

## Development

Every common task runs through [`just`](https://github.com/casey/just), a command runner.
The same recipes run locally, in CI and for coding agents. Install it once:

| OS | Command |
|---|---|
| Windows | `winget install --id Casey.Just --exact` (or `scoop install just`, `choco install just`) |
| macOS | `brew install just` |
| Linux | your package manager (e.g. `apt install just`, `pacman -S just`), or `cargo install just` |

Prebuilt binaries for every platform are on the
[releases page](https://github.com/casey/just/releases). Then, in the repo:

```sh
just setup   # install dependencies and agent skills
just         # list every recipe with a one-line description
```

On Windows, recipes run in Windows PowerShell, so you don't need Git Bash or WSL.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the full setup.
