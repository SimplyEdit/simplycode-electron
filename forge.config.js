const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path')

module.exports = {
  packagerConfig: {
    asar: true,
    icon: '/simplycode/camil_512x512.png',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        bin: 'simply-code',
        icon:path.join(__dirname, '/simplycode/camil_192x192.png'),
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        bin: 'simply-code',
        icon:path.join(__dirname, '/simplycode/camil_192x192.png'),
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        bin: 'simply-code',
        options: {
          icon:path.join(__dirname, '/simplycode/camil_192x192.png'),
        },
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        bin: 'simply-code',
        icon:path.join(__dirname, '/simplycode/camil_192x192.png'),
      }
    }
  ],
  plugins: [
    {
      name: '@SimplyEdit/simplycode-electron/tree/electron-forge-github-actions',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: 'simply-code',
      config: {
        repository: {
          owner: 'Govert Combée',
          name: 'simply-code'
        },
        prerelease: true
      }
    }
  ]
};
