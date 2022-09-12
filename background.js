let waiting_for_login = false;

async function check_login(baseurl) {
	let req = await fetch(baseurl + "/api/webapp/userstatus/");
	let data = await req.json();
	return data.TokenValid;
}

function origin(url) {
	return (new URL(url)).origin;
}

browser.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
	if (data?.action != "ppp_login" && data?.action != "set_pppurl" && data?.action != "bb_login") return;

	if (data.action == "bb_login") {
		browser.tabs.create({
			url: data.url
		});
		waiting_for_login = sendResponse;
		setTimeout(() => {
			waiting_for_login = false;
		}, 2 * 60 * 1000); // two minute timeout
		return;
	}

	if (data.action == "set_pppurl") {
		console.log("setting portalplus URL to " + data.url)
		await browser.cookies.set({
			url: origin(sender.url),
			name: "portalplus_url",
			value: data.url
		});

		return;
	}

	let baseurl = origin(sender.url);

	console.log(baseurl)

	let portalplus_url = await browser.cookies.get({
    url: sender.url,
    name: "portalplus_url"
  });

	portalplus_url = origin(portalplus_url.value);

  console.log(portalplus_url);

  if (!portalplus_url) return;

  let bb_cookies = await browser.cookies.getAll({
		url: sender.url
  });


	await (async () => {
		for (let cookie of bb_cookies) {
			let w = await browser.cookies.set({
				url: portalplus_url,
				name: cookie.name,
				value: cookie.value,
				httpOnly: cookie.httpOnly,
				secure: cookie.secure,
			});
		}
	})(); // idfk

	if (waiting_for_login) {
		await browser.tabs.remove(sender.tab.id);
		waiting_for_login();
		waiting_for_login = false;
	}

	if (!data.open) return;

	browser.tabs.create({
		url: portalplus_url + "login.html"
	});
});
