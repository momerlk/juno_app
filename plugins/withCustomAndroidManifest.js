const { withAndroidManifest } = require('@expo/config-plugins');

const withCustomAndroidManifest = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    // Modify the <application> element
    const application = androidManifest.manifest.application[0];
    application.$['android:name'] = '.MainApplication';
    application.$['android:allowBackup'] = 'true';

    // Find or create the <activity> element
    let mainActivity = application.activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (!mainActivity) {
      mainActivity = {
        $: {
          'android:name': '.MainActivity',
          'android:label': '@string/app_name',
          'android:windowSoftInputMode': 'adjustPan',
        },
        'intent-filter': [
          {
            'action': [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            'category': [
              { $: { 'android:name': 'android.intent.category.DEFAULT' } },
              { $: { 'android:name': 'android.intent.category.BROWSABLE' } }
            ],
            'data': [
              { $: { 'android:scheme': 'https', 'android:host': 'thejunoshop.com', 'android:pathPattern': '.*' } }
            ],
            $: { 'android:autoVerify': 'true' }
          }
        ]
      };
      application.activity.push(mainActivity);
    } else {
      mainActivity.$['android:label'] = '@string/app_name';
      mainActivity.$['android:windowSoftInputMode'] = 'adjustPan';

      // Add intent filter if not present
      if (!mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = [];
      }
      mainActivity['intent-filter'].push({
        'action': [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        'category': [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } }
        ],
        'data': [
          { $: { 'android:scheme': 'https', 'android:host': 'thejunoshop.com', 'android:pathPattern': '.*' } }
        ],
        $: { 'android:autoVerify': 'true' }
      });
    }

    return config;
  });
};

module.exports = withCustomAndroidManifest;
