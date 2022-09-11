if (window.is_portalplus) {
	console.log("we are portalplus!");
	(async () => {
		let user = await get_user();
		user.token = await get_verification_token();
		save_data(user);
	})();

	window.bb_login = (email, baseurl) => {
		document.querySelector("#secret_blackbaud_login_button").innerHTML = baseurl + "/app/student?email=" + encodeURIComponent(email) + "&portalplus_url=" + encodeURIComponent(window.location.origin);
		document.querySelector("#secret_blackbaud_login_button").click();
	}
}
