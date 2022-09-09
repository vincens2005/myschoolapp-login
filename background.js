async function check_login(baseurl) {
	let req = await fetch(baseurl + "/api/webapp/userstatus/");
	let data = await req.json();
	return data.TokenValid;
}

function origin(url) {
	return (new URL(url)).origin;
}

browser.runtime.onMessage.addListener(async (data, sender) => {
	if (data?.action != "ppp_login") return;

	let baseurl = origin(sender.url);

	console.log(baseurl)

	let portalplus_url = await browser.cookies.get({
    url: sender.url,
    name: "portalplus_url"
  });

	portalplus_url = portalplus_url.value;

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

	browser.tabs.create({
		url: portalplus_url
	});
});
