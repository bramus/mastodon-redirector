# Mastodon Profile Redirect

One thing that’s a bit of a hassle with Mastodon is that you can’t immediately follow people on other instances: you have to copy the username and search for it on the instance that hosts your account.

To make this easier, this extension exists.

https://user-images.githubusercontent.com/213073/203604974-c42fc3c0-7a6f-4e2b-84fd-c8c70b75970f.mp4

| [![Available on the Chrome Web Store](./assets/chrome-webstore.svg)](https://chrome.google.com/webstore/detail/mastodon-view-profile-on-my-mastodon-instance/limifnkopacddgpihodacjeckfkpbfoe) | [![Available on the Firefox Add-ons Website](./assets/firefox-addons.svg)](https://addons.mozilla.org/en-US/firefox/addon/mastodon-profile-redirect/) | [![Available as a Bookmarklet](./assets/bookmarklet.svg)](#other-browsers) |
|-|-|-|

## Installation

### Chromium-based browsers

_This applies to browsers that are based on Chromium. This includes Google Chrome, Microsoft Edge, …_

The easiest way is to install it from [the Chrome Web Store](https://chrome.google.com/webstore/detail/mastodon-view-profile-on-my-mastodon-instance/limifnkopacddgpihodacjeckfkpbfoe)

Alternatively you can clone this repository and [load the extension unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked). Before you can do this, you will need to [build the project](#development) though.

Don’t forget to [configure the extension](#configuration).

### Firefox

You can install the extension from [the Firefox Add-Ons Website](https://addons.mozilla.org/en-US/firefox/addon/mastodon-profile-redirect/). Because this extension uses Manifest v3, support is limited to Firefox 109 and up.

To run the extension in older versions of Firefox:

- Go to `about:config` and set `extensions.manifestV3.enabled` to `true`
- Hit the “download file” link on the [Add-Ons listing](https://addons.mozilla.org/en-US/firefox/addon/mastodon-profile-redirect/), upon which Firefox will prompt you to install it

Don’t forget to [configure the extension](#configuration).

### Other Browsers

If you can’t or won’t run the extension, you can use [the bookmarklet](./bookmarklet/) which also does the job.

## Configuration

- Chrome:
    - Right click the extension icon and choose “Options”
    - Enter the details and hit “Save Settings”
- Firefox:
    - Right click the extension icon and choose “Manage Extension”
    - Click the three dot menu next to the extension name and click “preferences”
    - Enter the details and hit “Save Settings”

TIP: To get easy access, pin the extension icon

## Usage

When viewing a Mastodon page on a different instance than yours, hit the extension icon to get redirected to the profile shown on your instance.

Supported pages:

- Profile page
- Profile page that is set up to redirect to another account
- Message detail page

Redirecting to status pages from one server to the other is not possible because of the way how Mastodon works: the ids are different per instance.

## Development

### Building

Due to minor differences in support for extensions that use Manifest v3 in Chromium and Firefox, the code of this repository cannot directly be loaded. The code needs to be built.

```bash
make build-all
```

The built, yet still unpacked, extensions can be found in `./build/firefox` and `./build/chromium`.

Building depends on [`jq`](https://stedolan.github.io/jq/) which you must install first.

While actively developing, make use of the `watch` task. It will auto-rebuild whenever you save something in `src/`.

```bash
make watch
```

### Loading

For Chromium based browsers, [load the extension unpacked](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked) from the `./build/chromium` folder. Alternatively you can use the `run-chrome` Make script:

```bash
make run-chrome
```

For Firefox, you’ll need [`web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) to load the extension during development. A `web-ext-config.js` is included in the repository, so you can easily run `web-ext run`. Alternatively you can use the `run-firefox` Make script:

```bash
make run-firefox
```

## Support and bugs

This project is offered as is. However, I am open to receiving bug reports and accepting PRs to improve this extension.

## License

This project is released under the MIT public license. See the enclosed `LICENSE` for details.

## Acknowledgements

Icon by [Flatart](https://www.iconfinder.com/icons/4373112/logo_logos_mastodon_icon)