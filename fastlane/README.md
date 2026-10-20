fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### build_dev

```sh
[bundle exec] fastlane build_dev
```

Build extension in development mode

### build

```sh
[bundle exec] fastlane build
```

Build extension for production

### build_and_package

```sh
[bundle exec] fastlane build_and_package
```

Build extension and create package

### format_check

```sh
[bundle exec] fastlane format_check
```

Check format with prettier

### format_fix

```sh
[bundle exec] fastlane format_fix
```

Fix format with prettier

### eslint_check

```sh
[bundle exec] fastlane eslint_check
```

Check eslint

### eslint_fix

```sh
[bundle exec] fastlane eslint_fix
```

Fix eslint

### security_check

```sh
[bundle exec] fastlane security_check
```

Check security

### type_check

```sh
[bundle exec] fastlane type_check
```

Run type check

### bump_version

```sh
[bundle exec] fastlane bump_version
```

Bump version number

Options: bump (never|patch|minor|major) skips the version prompt

### create_package

```sh
[bundle exec] fastlane create_package
```

Create extension package

### merge_to_main

```sh
[bundle exec] fastlane merge_to_main
```

Merge develop branch to main

Options: yes:true skips the confirmation

### release

```sh
[bundle exec] fastlane release
```

Create release

Options: bump (never|patch|minor|major) skips the version prompt, yes:true skips all confirmations

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
