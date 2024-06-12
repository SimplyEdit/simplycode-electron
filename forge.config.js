const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        bin: 'simplycode',
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        bin: 'simplycode',
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        bin: 'simplycode',
        options: {
        },
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        bin: 'simplycode',
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
      name: 'simplycode',
      config: {
        repository: {
          owner: 'Govert Combée',
          name: 'simplycode'
        },
        prerelease: true
      }
    }
  ]
};
