if (window.is_portalplus) {
	console.log("we are portalplus!");
	(async () => {
		let user = await get_user();
		user.token = await get_verification_token();
		save_data(user);
	})();
}
