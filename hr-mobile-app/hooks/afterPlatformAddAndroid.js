// com.android.support:support-v4 버전 지정 러이브러리로 인한 빌드 불가 이슈
// https://stackoverflow.com/questions/49162538/cordova-build-android-unable-to-find-attribute-androidfontvariationsettings-a
const path = require('path')
const fs = require('fs')
const gradleExtras = `
configurations.all {
    resolutionStrategy {
        force 'com.android.support:support-v4:27.1.0'
    }
}
`.trim()

fs.writeFileSync(path.resolve('platforms', 'android', 'build-extras.gradle'), gradleExtras)
