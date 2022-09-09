async function check_login() {
	let req = await fetch(window.location.origin + "/api/webapp/userstatus/");
	let data = await req.json();
	return data.TokenValid;
}

async function blackbaud_contentscript() {
	console.log("checking if we are logged in");
	if (await check_login()) {

		if (!document.cookie.includes("portalplus_url=")) return;

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
    action: "ppp_login"
  });
}


if (document.querySelector("#__AjaxAntiForgery")) {
	blackbaud_contentscript();
}
else {
	// stolen from https://stackoverflow.com/a/20513730/15317442
	let file = browser.extension.getURL("injected_script.js");
	let th = document.getElementsByTagName("body")[0];
	let s = document.createElement('script');
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('src', file);
	th.appendChild(s);
}
