const { withAndroidManifest, withMainActivity } = require('@expo/config-plugins');

const withSMSPermissions = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    // Add SMS permissions
    if (!androidManifest['uses-permission']) {
      androidManifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
    ];

    permissions.forEach((permission) => {
      if (
        !androidManifest['uses-permission'].find(
          (p) => p.$['android:name'] === permission
        )
      ) {
        androidManifest['uses-permission'].push({
          $: { 'android:name': permission },
        });
      }
    });

    return config;
  });
};

module.exports = withSMSPermissions;
