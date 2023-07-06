$(document).ready(function () {
	const LOGIN_URL = "/Admin/SignIn"

	$(".loading").css("display", "none");

	$(".h-screen").on("keydown", async function (event) {
		if (event.which === 13) {
			await $(".btn-signup").click();
		}
	});

	$(".btn-signup").click(async function () {
		var account = {
			Username : $("#username").val(),
			Password : $("#password").val()
		}
		await postAccount(account);
	});

	$(".btn-register").click(function () {
		window.location.href = "/Admin/SignUp";
	});

	async function postAccount(account) {
		try {
			const res = await $.ajax({
				url: LOGIN_URL,
				type: "POST",
				contentType: "application/json",
				data: JSON.stringify(account),
				beforeSend: function () {
					$(".loading").css("display", "block");
					$(".login").css("padding", "0");
					$(".main-content").css("display", "none");
				}
			});
			$(".loading").css("display", "none");
			if (res && res.length > 0) {
				window.location.href = res;
            }
			
		} catch (e) {
			$(".loading").css("display", "none");
			$(".login").css("padding", "0.75rem 2rem");
			$(".main-content").css("display", "block");
			Toastify({
				node: $("#login-failed-modal").clone().removeClass("hidden")[0],
				duration: 3000,
				newWindow: true,
				close: true,
				gravity: "top",
				position: "right",
				stopOnFocus: true
			}).showToast();
		}
	}

});