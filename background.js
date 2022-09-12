let waiting_for_login = false;
let login_tab = null;

async function check_login(baseurl) {
	let req = await fetch(baseurl + "/api/webapp/userstatus/");
	let data = await req.json();
	return data.TokenValid;
}

function origin(url) {
	return (new URL(url)).origin;
}

chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
	if (data?.action != "ppp_login" && data?.action != "set_pppurl" && data?.action != "bb_login" && data?.action != "inject_script") return;

	if (data.action == "bb_login") {
		chrome.tabs.create({
			url: data.url
		});
		waiting_for_login = sendResponse;
		login_tab = sender.tab.id;
		setTimeout(() => {
			waiting_for_login = false;
			login_tab = null;
		}, 2 * 60 * 1000); // two minute timeout
		return;
	}

	if (data.action == "set_pppurl") {
		console.log("setting portalplus URL to " + data.url)
		await chrome.cookies.set({
			url: origin(sender.url),
			name: "portalplus_url",
			value: data.url
		});

		return;
	}

	let baseurl = origin(sender.url);

	console.log(baseurl)

	let portalplus_url = await chrome.cookies.get({
    url: sender.url,
    name: "portalplus_url"
  });

	portalplus_url = origin(portalplus_url.value);

  console.log(portalplus_url);

  if (!portalplus_url) return;

  let bb_cookies = await chrome.cookies.getAll({
		url: sender.url
  });


	await (async () => {
		for (let cookie of bb_cookies) {
			let w = await chrome.cookies.set({
				url: portalplus_url,
				name: cookie.name,
				value: cookie.value,
				httpOnly: cookie.httpOnly,
				secure: cookie.secure,
			});
		}
	})(); // idfk

	if (waiting_for_login) {
		await chrome.tabs.remove(sender.tab.id);
		waiting_for_login();
		chrome.tabs.update(login_tab, {
			active: true,
		});
		waiting_for_login = false;
		login_tab = null;
	}

	if (!data.open) return;

	chrome.tabs.create({
		url: portalplus_url + "/login.html"
	});
});
