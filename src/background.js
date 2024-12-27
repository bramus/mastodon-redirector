const go = () => {
	let MY_MASTO_LOCAL_DOMAIN = null;
	let MY_MASTO_WEB_DOMAIN = null;

	const tryAndGetUserNameFromProfilePage = () => {
		/* Profile with a moved banner (e.g. https://mastodon.social/@bramus): follow that link */
		const userNewProfile = document.querySelector('.moved-account-banner .button')?.getAttribute('href');
		if (userNewProfile) {
			return userNewProfile.substring(2);
		}

		/* Profile page, e.g. https://fediverse.zachleat.com/@zachleat and https://front-end.social/@mia */
		const userFromProfilePage = document.querySelector('.account__header .account__header__tabs__name small')?.innerText.split('\n');
		if (userFromProfilePage) {
			/* For profile pages on Mastodon v4.2.x */
			if (userFromProfilePage.length == 1) {
				return userFromProfilePage[0].substring(1);
			}
			/* For profile pages on Mastodon v4.3.x and v4.4.x */
			else if (userFromProfilePage.length == 3) {
				return userFromProfilePage[0].substring(1) + userFromProfilePage[1];
			}
		}

		// Not a profile page or some markup that is preventing things from happening
		return null;
	};

	const getProfileRedirectUrl = () => {
		let user = tryAndGetUserNameFromProfilePage();

		// Found user ~> Redirect to profile on own host
		if (user) {
			/* Trim off @domain suffix in case it matches with MY_MASTO_LOCAL_DOMAIN. This due to https://github.com/mastodon/mastodon/issues/21469 */
			if (user.endsWith(`@${MY_MASTO_LOCAL_DOMAIN}`)) {
				user = user.substring(0, user.length - `@${MY_MASTO_LOCAL_DOMAIN}`.length);
			}

			return `https://${MY_MASTO_WEB_DOMAIN}/@${user}`;
		}

		return null;
	};

	const getPostRedirectUrl = () => {
		// We resort to URL sniffing here … sorry
		const urlPathParts = window.location.pathname.substr('1').split('/');

		// The path must be something like /@user/12345
		if (urlPathParts.length != 2) return null;
		if (!Number.isInteger(parseInt(urlPathParts[1]))) return null;

		// It is quite safe to assume this was a Mastodon post detail
		return `https://${MY_MASTO_WEB_DOMAIN}/authorize_interaction?uri=${encodeURIComponent(window.location.href)}`;
	};

	chrome.storage.sync.get(
		{
			local_domain: '',
			web_domain: '',
		},
		function (items) {
			MY_MASTO_LOCAL_DOMAIN = items.local_domain;
			MY_MASTO_WEB_DOMAIN = items.web_domain || MY_MASTO_LOCAL_DOMAIN;

			if (!MY_MASTO_LOCAL_DOMAIN) {
				alert('Please go to options and set your MY_MASTO_LOCAL_DOMAIN first');
				return;
			}

			// Don’t do anything if already on the mastodon domain
			if (window.location.host === MY_MASTO_LOCAL_DOMAIN) return null;

			const extractors = [getProfileRedirectUrl, getPostRedirectUrl];

			let redirectUrl = null;
			do {
				redirectUrl = extractors.shift()();
			} while (redirectUrl == null && extractors.length);

			if (redirectUrl) {
				window.location.href = redirectUrl;
			} else {
				alert('No Mastodon profile or Mastodon post detected. If this is incorrect, please file a bug.');
			}
		}
	);
};

chrome.action.onClicked.addListener((tab) => {
	if (!tab.url.includes('chrome://')) {
		chrome.scripting.executeScript({
			target: { tabId: tab.id },
			func: go,
		});
	}
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
	if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
		chrome.runtime.openOptionsPage();
	}
});
