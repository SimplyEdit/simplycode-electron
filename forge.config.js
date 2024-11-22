const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['windows'],
      config: {
        bin: 'simplycode',
      }
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        bin: 'simplycode',
      },
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        bin: 'simplycode',
        options: {
        },
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {
        bin: 'simplycode',
      }
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'SimplyEdit',
          name: 'simplycode-electron'
        },
        prerelease: true
      }
    }
  ]
}