const isMostLikelyMastodon = document.querySelector('#mastodon');

const go = () => {
    chrome.storage.sync.get({
        local_domain: '',
        web_domain: ''
    }, function(items) {
        const LOCAL_DOMAIN = items.local_domain.trim();
        const WEB_DOMAIN = items.web_domain.trim() || LOCAL_DOMAIN;

        // Don’t run if not configured
        if (!WEB_DOMAIN) return;

        // Don’t run on own instance
        if (window.location.host === WEB_DOMAIN) return;

        // Extract username meta tag
        const $usernameMetaTag = document.querySelector('meta[property="profile:username"]');
        const isMostLikelyMastodonProfilePage = $usernameMetaTag !== null;

        if (!isMostLikelyMastodonProfilePage) return;

        // Extract follow button
        const $followButton = document.querySelector('.account-timeline__header .account__header__tabs__buttons .button.logo-button');

        if (!$followButton) return;

            // Extract username from follow button
            let user = $usernameMetaTag.getAttribute('content');

            // Trim off @domain suffix in case it matches with LOCAL_DOMAIN. This due to https://github.com/mastodon/mastodon/issues/21469
            if (user.endsWith(`@${LOCAL_DOMAIN}`)) {
                user = user.substring(0, user.length - `@${LOCAL_DOMAIN}`.length);
            }

            // Create new follow button
            const $newFollowButton = document.createElement('a');
            $newFollowButton.classList.add('button', 'logo-button');
            $newFollowButton.href = `https://${WEB_DOMAIN}/authorize_interaction?uri=${encodeURIComponent(user)}`;
            $newFollowButton.innerText = $followButton.innerText;

            // Replace old with new follow button
            $followButton.style.display = "none";
            $followButton.insertAdjacentElement('afterend', $newFollowButton);
    });
};

if (isMostLikelyMastodon) {
    // Run main code, but wait for loading indicator …
    const $loadingIndicator = document.querySelector('.loading-indicator');
    if ($loadingIndicator) {
        const observer = new MutationObserver(function(mutations_list) {
            mutations_list.forEach(function(mutation) {
                mutation.removedNodes.forEach(function(removed_node) {
                    if (removed_node == $loadingIndicator) {
                        console.log('loadingIndicator has been removed');
                        observer.disconnect();
                        go();
                    }
                });
            });
        });
        
        observer.observe($loadingIndicator.parentElement, { subtree: false, childList: true });
    } else {
        go();
    }
}