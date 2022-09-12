if (window.is_portalplus) {
	console.log("we are portalplus!");
	(async () => {
		let user = await get_user();
		user.token = await get_verification_token();
		save_data(user);
	})();

	window.bb_login = (email, baseurl) => {
		let secretbutton = document.querySelector("#secret_blackbaud_login_button");
		secretbutton.innerHTML = baseurl + "/app/student?email=" + encodeURIComponent(email) + "&portalplus_url=" + encodeURIComponent(window.location.origin);
		secretbutton.click();

		return new Promise((resolve, reject) => {
			const observer = new MutationObserver((mutationList, observer) => {
				for (const mutation of mutationList) {
					if (mutation.attributeName == "success") {
						observer.disconnect();
						secretbutton.innerHTML = "";
						secretbutton.removeAttribute("success");
						console.log("we did it! resolving promise");
						resolve(true);
						return true;
					}
				}

				observer.disconnect();
				secretbutton.innerHTML = "";
				secretbutton.removeAttribute("success");
				reject();
			});

			observer.observe(secretbutton, {attributes: true});
		});
	}
}
