#  Electron build for Simplycode

[![SimplyEdit][simplyedit-shield]][simplyedit-site]
[![Project stage: Development][project-stage-badge: Development]][project-stage-page]
[![License][license-shield]][license-link]
[![standard-readme compliant][standard-readme-shield]][standard-readme-link]

Electron environment to create **SimplyCode** applications in.

## Install

Currently, there is no pre-compiled binary available, so the project needs to be built from source.

To do so, clone the repository, install the dependencies, and run the build script:

```sh
git clone https://github.com/SimplyEdit/simplycode-electron.git
npm --prefix simplycode-electron install
npm --prefix simplycode-electron run make
```

The build will create an `out` directory with distributable files (in the `make` directory) and an executable Electron application (in a `simply-code-app-*` directory). For instance, on Linux: `simply-code-app-linux-x64`.

Depending on the platform a package is built for, different dependencies are required. For instance for Debian-based distributions require `dpkg` and `fakeroot`. For Red Hat-based distributions `rpm` is required.

Please refer to [the Electron Forge makers documentation](https://www.electronforge.io/config/makers) for specific requirements.

to run the build in a Docker container, the following command can be used:

```sh
docker run \
    --interactive \
    --network=host \
    --rm \
    --tty \
    --volume "${PWD}:/app" \
    --workdir=/app \
    node:lts \
    bash -c 'apt update && apt install -y dpkg fakeroot rpm && npm install && npm run make'
```

## Usage

The compiled electron application can be started by opening it from a graphical file manager or by running the executable from the command line. For instance, on Linux:

```sh
./out/simply-code-app-linux-x64/simply-code-app
```

## Contribute

Feedback and contributions are welcome. Please open an issue or create a pull request.

### Development

To develop in Electron, please defer to the [Electron documentation](https://www.electronjs.org/docs/latest/). 

To run, packaged and build the app [Electron Forge](https://www.electronforge.io/) is used.

For ease of use, NPM script commands have been added to wrap the most common Electron Forge commands.

For instance to start the application in development mode, instead of running `electron-forge start`, use:

```sh
npm run start
```

#### Debugging in Visual Studio Code (VS Code)

To debug the application using VS Code, VS Code needs to attach to the main and the renderer processes. This is done by creating a `launch.json` configuration in the `.vscode` folder in the project. 

<details><summary markdown="span">Contents of <code>launch.json</code></summary>

```json
{
    "version": "0.2.0",
    "compounds": [
      {
        "name": "Main + renderer",
        "configurations": ["Main", "Renderer"],
        "stopAll": true
      }
    ],
    "configurations": [
      {
        "name": "Renderer",
        "port": 9222,
        "request": "attach",
        "type": "chrome",
        "webRoot": "${workspaceFolder}"
      },
      {
        "name": "Main",
        "type": "node",
        "request": "launch",
        "cwd": "${workspaceFolder}",
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
        "windows": {
          "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
        },
        "args": [".", "--remote-debugging-port=9222"],
        "outputCapture": "std",
        "console": "integratedTerminal"
      }
    ]
  }
```

For more details about the `launch.js`, visit [the "Debugging from VS Code" section](https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app#optional-debugging-from-vs-code) in the [Building your First App](https://www.electronjs.org/docs/latest/tutorial/tutorial-first-app) tutorial.

</details>

Next, in VS Code, select the "Run and Debug" option from the sidebar.

A "Main + renderer" option will appear. Amongst other things, it is now possible to set breakpoints and inspect variables.

For more information on debugging in VS Code, visit the ["Debugging in VSCode" tutorial](https://www.electronjs.org/docs/latest/tutorial/debugging-vscode).

## License

Created by [SimplyEdit](https://simplyedit.io) under an MIT License.

[license-link]: ./LICENSE
[license-shield]: https://img.shields.io/github/license/simplyedit/simplycode-electron.svg
[simplyedit-shield]: https://img.shields.io/badge/Simply-Edit-F26522?labelColor=939598
[simplyedit-site]: https://simplyedit.io/
[project-stage-badge: Development]: https://img.shields.io/badge/Project%20Stage-Development-yellowgreen.svg
[project-stage-page]: https://blog.pother.ca/project-stages/
[standard-readme-link]: https://github.com/RichardLitt/standard-readme
[standard-readme-shield]: https://img.shields.io/badge/-Standard%20Readme-brightgreen.svg
