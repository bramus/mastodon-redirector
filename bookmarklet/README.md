# Mastodon Profile Redirect Bookmarklet

If you can’t or won’t run [the Mastodon Profile Redirect browser extension](https://github.com/bramus/mastodon-profile-redirect/), you can use a bookmarklet instead which also does the job

## Installation Instructions

- Create a new bookmark
- Set the Name to “View on Mastodon”
- Set the URL to [the code block shown below](#the-code)
    - Be sure to include the `javascript:` prefix from the code. This is required.
    - Be sure to change the value of `LOCAL_DOMAIN` _(line 2)_ so that it reflects your Mastodon instance.

## The Code

```js
javascript:(function(){
    const LOCAL_DOMAIN = 'example.org'; /* 👈 Change this value to your Mastodon domain, e.g. 'mastodon.social' */
    const WEB_DOMAIN = LOCAL_DOMAIN; /* 👈 Only change this value if your Masto host is hosted an different domain than the LOCAL_DOMAIN */

    /* Show warning in case user has not configured the bookmarklet */
    if (LOCAL_DOMAIN === 'example.org') {
        alert('This bookmarklet is not configured properly. Please follow the installation instructions and change the value for LOCAL_DOMAIN before you use it.');
        return;
    }

    function tryAndGetUserName() {
        /* Profile with a moved banner (e.g. https://mastodon.social/@bramus): follow that link */
        const userNewProfile = document.querySelector('.moved-account-banner .button')?.getAttribute('href');
        if (userNewProfile) {
            return userNewProfile.substring(2);
        }

        /* Profile page, e.g. https://fediverse.zachleat.com/@zachleat and https://front-end.social/@mia */
        const userFromProfilePage = document.querySelector('meta[property="profile:username"]')?.getAttribute('content');
        if (userFromProfilePage) {
            /* Don’t return if already watching on own LOCAL_DOMAIN instance */
            if (window.location.host === LOCAL_DOMAIN) return null;
            return userFromProfilePage;
        };

        /* Message detail, e.g. https://front-end.social/@mia/109348973362020954 and https://bell.bz/@andy/109392510558650993 and https://bell.bz/@andy/109392510558650993 */
        const userFromDetailPage = document.querySelector('.detailed-status .display-name__account')?.innerText;
        if (userFromDetailPage) return userFromDetailPage.substring(1);

        return null;
    };

    let user = tryAndGetUserName();
    if (!user) return;

    /* Trim off @domain suffix in case it matches with LOCAL_DOMAIN. This due to https://github.com/mastodon/mastodon/issues/21469 */
    if (user.endsWith(`@${LOCAL_DOMAIN}`)) {
        user = user.substring(0, user.length - `@${LOCAL_DOMAIN}`.length);
    }

    window.location.href = `https://${WEB_DOMAIN}/@${user}`;
})();
```



