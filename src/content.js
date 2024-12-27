const isMostLikelyMastodon = document.querySelector('#mastodon');

let LOCAL_DOMAIN = null;
let WEB_DOMAIN = null;

// This method gets the profile redirect URL from the DOM
// This because the it must be in the form `@username@otherhost`
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
		/* Trim off @domain suffix in case it matches with LOCAL_DOMAIN. This due to https://github.com/mastodon/mastodon/issues/21469 */
		if (user.endsWith(`@${LOCAL_DOMAIN}`)) {
			user = user.substring(0, user.length - `@${LOCAL_DOMAIN}`.length);
		}

		return `https://${WEB_DOMAIN}/@${user}`;
	}

	return null;
};

const getRedirectUrlForUrl = (url) => {
	return `https://${WEB_DOMAIN}/authorize_interaction?uri=${encodeURIComponent(url)}`;
};

let haltMutationObserver = false;
const go = () => {
	const $modalRoot = document.querySelector('.modal-root');

	if ($modalRoot) {
		const observer = new MutationObserver(function (mutations_list) {
			// Don’t double run when already busy
			if (haltMutationObserver) {
				return;
			}
			haltMutationObserver = true;

			mutations_list.forEach(function (mutation) {
				if (!mutation.addedNodes.length) {
					haltMutationObserver = false;
					return;
				}

				const $redirectInput = document.querySelector('.modal-root .copypaste input[type="text"]');
				if (!$redirectInput) {
					haltMutationObserver = false;
					return;
				}

				$choiceBox = $redirectInput.closest('.interaction-modal__choices__choice');
				if (!$choiceBox) {
					haltMutationObserver = false;
					return;
				}

				chrome.storage.sync.get(
					{
						local_domain: '',
						web_domain: '',
					},
					function (items) {
						LOCAL_DOMAIN = items.local_domain;
						WEB_DOMAIN = items.web_domain || LOCAL_DOMAIN;

						// Not configured? Show a notification.
						if (!WEB_DOMAIN) {
							$choiceBox.querySelector('p').innerText = 'Please configure the mastodon-profile-redirect browser extension to more easily follow this account, directly on your Mastodon instance.';
							haltMutationObserver = false;
							return;
						}

						// Change title to reflect user’s Masto instance
						$choiceBox.querySelector('h3 span').innerText = `On ${LOCAL_DOMAIN}`;

						let redirectUrl = $redirectInput.value;
						let label = null;

						// We resort to URL sniffing here … sorry
						const urlPathParts = new URL(redirectUrl).pathname.substr('1').split('/');

						// Only 1 part that starts with an @?
						// ~> Build and use profile URL
						if (urlPathParts.length == 1 && urlPathParts[0].startsWith('@')) {
							redirectUrl = getProfileRedirectUrl();
							label = 'View Profile';
						}
						// Everything else
						// ~> Trust the input value and use that
						else {
							redirectUrl = getRedirectUrlForUrl($redirectInput.value);
							label = 'View Post';
						}

						if (redirectUrl) {
							// Create view button
							const $viewButton = document.createElement('a');
							$viewButton.classList.add('button', 'button--block');
							$viewButton.href = redirectUrl;
							$viewButton.innerText = label;

							// Replace the orig paragraph with the show profile button
							$choiceBox.querySelector('p').insertAdjacentElement('beforebegin', $viewButton);
							$choiceBox.removeChild($choiceBox.querySelector('p'));
						}
					}
				);
			});

			// Unlock MutationObserver after having processed the mutations list
			setTimeout(() => {
				haltMutationObserver = false;
			}, 10);
		});

		observer.observe($modalRoot, { subtree: true, childList: true });
	}
};

if (isMostLikelyMastodon) go();
