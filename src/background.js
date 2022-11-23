const go = () => {

    chrome.storage.sync.get({
        local_domain: '',
        web_domain: ''
    }, function(items) {
        const MY_MASTO_LOCAL_DOMAIN = items.local_domain;
        const MY_MASTO_WEB_DOMAIN = items.web_domain || MY_MASTO_LOCAL_DOMAIN;

        if (!MY_MASTO_LOCAL_DOMAIN) {
            alert('Please go to options and set your MY_MASTO_LOCAL_DOMAIN first');
            return;
        }

        const tryAndGetUserName = () => {
            /* Profile with a moved banner (e.g. https://mastodon.social/@bramus): follow that link */
            const userNewProfile = document.querySelector('.moved-account-banner .button')?.getAttribute('href');
            if (userNewProfile) {
                return userNewProfile.substring(2);
            }
        
            /* Profile page, e.g. https://fediverse.zachleat.com/@zachleat and https://front-end.social/@mia */
            const userFromProfilePage = document.querySelector('meta[property="profile:username"]')?.getAttribute('content');
            if (userFromProfilePage) {
                /* Don’t return if already watching on own LOCAL_DOMAIN instance */
                if (window.location.host === MY_MASTO_LOCAL_DOMAIN) return null;
                return userFromProfilePage;
            };
        
            /* Message detail, e.g. https://front-end.social/@mia/109348973362020954 and https://bell.bz/@andy/109392510558650993 and https://bell.bz/@andy/109392510558650993 */
            const userFromDetailPage = document.querySelector('.detailed-status .display-name__account')?.innerText;
            if (userFromDetailPage) return userFromDetailPage.substring(1);
        
            return null;
        };

        let user = tryAndGetUserName();
        if (!user) return;

        /* Trim off @domain suffix in case it matches with MY_MASTO_LOCAL_DOMAIN. This due to https://github.com/mastodon/mastodon/issues/21469 */
        if (user.endsWith(`@${MY_MASTO_LOCAL_DOMAIN}`)) {
            user = user.substring(0, user.length - `@${MY_MASTO_LOCAL_DOMAIN}`.length);
        }

        window.location.href = `https://${MY_MASTO_WEB_DOMAIN}/@${user}`;
    });
}

chrome.action.onClicked.addListener((tab) => {
    if(!tab.url.includes("chrome://")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: go
        });
    }
});