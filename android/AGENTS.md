<!-- Parent: ../AGENTS.md -->
# Android Subtree

Android native application project, Gradle build configuration, and bundled web terminal assets.

## Architecture
- Runtime: React Native 0.87.1 running Hermes engine (`hermesEnabled=true`) with New Architecture (`newArchEnabled=true`) and edge-to-edge layout.
- Native Host: `com.kanganggi.netkit` hosting ReactActivity in `MainActivity.kt` and application lifecycle in `MainApplication.kt`.
- Asset Bundling: Standalone assets embedded under `android/app/src/main/assets/` (`xterm.js`, `xterm.css`, `MaterialCommunityIcons.ttf`).

## Key Files & Entry Points
- `android/build.gradle`: Root project build configuration:
  - `compileSdkVersion`: 37
  - `targetSdkVersion`: 36
  - `minSdkVersion`: 24
  - `buildToolsVersion`: 37.0.0
  - `ndkVersion`: 27.1.12297006
  - `kotlinVersion`: 2.2.0
- `android/app/build.gradle`: Application module build script. Configures `namespace = "com.kanganggi.netkit"` and `debuggableVariants = []`.
- `android/gradle.properties`: Architecture configuration (`newArchEnabled=true`, `hermesEnabled=true`, `edgeToEdgeEnabled=true`).
- `android/app/src/main/assets/`: Pre-packaged assets for WebView terminal emulator (`xterm.js`, `xterm.css`, `xterm-addon-fit.js`).

## Local Invariants & Rules
- Standalone Debug Bundle: `debuggableVariants = []` forces the JS bundle to be compiled into the debug APK. Tests on real devices run offline without active Metro server.
- JDK Requirement: JDK 17 (Temurin 17) required.
- Build Verification: Clean debug APK build command: `cd android && ./gradlew assembleDebug --no-daemon`.
- Autolinking: Third-party native modules are linked automatically via `@react-native/gradle-plugin`.

## Anti-Patterns & Forbidden Patterns
- NEVER enable debuggable variant bundle skipping; keep `debuggableVariants = []` for offline testing.
- NEVER upgrade Gradle or Kotlin without verifying React Native 0.87 compatibility.
- NEVER commit build artifacts under `android/app/build/` or `android/.gradle/`.

## Dependencies
- Host Tools: Gradle 9.4.1 wrapper, Android SDK 37, NDK 27.1.12297006, JDK 17.

## Cross-References
<!-- Parent: ../AGENTS.md -->
<!-- Siblings: ../src/screens/AGENTS.md, ../src/engine/AGENTS.md -->
