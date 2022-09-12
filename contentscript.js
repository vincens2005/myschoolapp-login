async function check_login() {
	let req = await fetch(window.location.origin + "/api/webapp/userstatus/");
	let data = await req.json();
	return data.TokenValid;
}

async function blackbaud_contentscript() {
	let url = new URL(window.location);
	if (!document.cookie.includes("portalplus_url=") && !url.searchParams.get("portalplus_url")) return;
	if (url.searchParams.get("portalplus_url")) {

		console.log(url.searchParams.get("portalplus_url"));

		browser.runtime.sendMessage({
			action: "set_pppurl",
			url: decodeURIComponent(url.searchParams.get("portalplus_url"))
		});
	}

	if (url.searchParams.get("email")) {
		console.log("we have an email!");
		let emailfunc = () => {
			console.log("trying to fill email...");
			if (!document.querySelector("#Username")) return setTimeout(emailfunc, 200);
			document.querySelector("#Username").value = decodeURIComponent(url.searchParams.get("email"));
			console.log("filled!");
		}
		emailfunc();
	}

	console.log("checking if we are logged in");
	if (await check_login()) {
		console.log("we are logged in!");

		browser.runtime.sendMessage({action: "ppp_login"});

		let div = document.createElement("DIV");
		div.innerHTML = `
			<button style="
				background: #1b776a;
				user-select: none;
				cursor: pointer;
				border-radius: 3px;
				margin: auto;
				text-align: center;
				text-decoration: none;
				color: #fff;
				width: auto;
				vertical-align: middle;
				display: inline-block;
				padding: 5px 20px 5px 20px;
				transition: 0.3s;
				border: none;
				font-size: 1rem;
				position: fixed;
				bottom: 20px;
				right: 20px;
			">
				portal++
			</button>
		`;

		div.onclick = open_portalplus;

		document.body.appendChild(div);
	}
}


function open_portalplus() {
		browser.runtime.sendMessage({
    action: "ppp_login",
    open: true
  });
}


if (document.querySelector("#__AjaxAntiForgery")) {
	blackbaud_contentscript();
}
else if(document.title.match(/portal\+\+/i) ) {
	let div = document.createElement("DIV");
	div.style.display = "none";
	div.id = "secret_blackbaud_login_button";
	div.onclick = e => {
		browser.runtime.sendMessage({
			action: "bb_login",
			url: e.target.innerText
		}, () => {
			e.target.setAttribute("success", "true");
		});

	};
	document.body.appendChild(div);

	// stolen from https://stackoverflow.com/a/20513730/15317442
	let file = browser.runtime.getURL("injected_script.js");
	let th = document.getElementsByTagName("body")[0];
	let s = document.createElement('script');
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', file);
	th.appendChild(s);
}
