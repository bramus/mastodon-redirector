// @ref https://developer.chrome.com/docs/extensions/mv3/options/
function save_options(e) {

    e.preventDefault();
    e.stopPropagation();

    document.getElementById('settings').classList.remove('ok');

    const MY_MASTO_LOCAL_DOMAIN = document.getElementById('local_domain').value;
    const MY_MASTO_WEB_DOMAIN = document.getElementById('web_domain').value;

    chrome.storage.sync.set({
        local_domain: MY_MASTO_LOCAL_DOMAIN,
        web_domain: MY_MASTO_WEB_DOMAIN
    }, function() {
        document.getElementById('settings').classList.add('ok');
    });
}

function restore_options() {
    chrome.storage.sync.get({
        local_domain: '',
        web_domain: ''
    }, function(items) {
        document.getElementById('local_domain').value = items.local_domain;
        document.getElementById('web_domain').checked = items.web_domain;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('settings').addEventListener('submit', save_options);