import { HOST } from '../env.js'

$(document).ready(async function () {
	var POST_RECORD = HOST + "/api/Account";
	const LOGIN_URL = "/Admin/SignIn"
	

	$("#password").change(function () {
		if ($(this).val().length > 8) {
			$("#retypePassword").prop("disabled", false);
		}
		else {
			$("#retypePassword").val("");
			$("#retypePassword").prop("disabled", true);
        }
	});

	$(".btn-register").click(async function () {
		var firstName = $("#firstName").val();
		var lastName = $("#lastName").val();
		var email = $("#email").val();
		var username = $("#username").val();
		var password = $("#password").val();
		var retypePassword = $("#retypePassword").val();

		var fullName = firstName + " " + lastName;
		fullName = fullName.trim();
		fullName = capitalizeString(fullName);
		username = username.trim();

		var infor = { fullName, email, username, password, retypePassword };
		console.log(infor);

		var isValid = validateInfo(infor);

		if (!isValid.status) {
			console.log("Invalid " + isValid.message);
			$(".failed-title").text("Register Failed");
			$(".failed-text").text(isValid.message);
			//Toastify
			Toastify({
				node: $("#failed-notification-content").clone().removeClass("hidden")[0],
				duration: 3000,
				newWindow: true,
				gravity: "top",
				position: "right",
				stopOnFocus: true
			}).showToast();

			return false;
		}

		var newAccount = {
			roleId: 3,
			username: infor.username,
			password: infor.password,
			fullName: fullName,
			email: infor.email,
			phoneNumber: "",
			avatar: "user.png"
        }

		await postNewAccount(newAccount);
		return true;
	});

	async function postNewAccount(newAccount) {
		try {
			const res = await $.ajax({
				url: POST_RECORD,
				type: "POST",
				data: JSON.stringify(newAccount),
				contentType: "application/json",
				beforeSend: function () {
					$(".loading").css("display", "block");
					$(".login").css("padding", "0");
					$(".main-content").css("display", "none");
				}
			});
			if (res) {
				console.log(res);
				$(".login").css("padding", "0.75rem 2rem");
				$(".main-content").css("display", "block");
				$(".loading").css("display", "none");
				await toggleModal();

				var account = {
					Username: newAccount.username,
					Password: newAccount.password
				}
				await postAccount(account);
			}
		} catch (e) {
			$(".loading").css("display", "none");
			$(".login").css("padding", "0.75rem 2rem");
			$(".main-content").css("display", "block");
			const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
			myModal.show();
			console.log(e);

		}
	}

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
			const myModal = tailwind.Modal.getInstance(document.querySelector("#warning-modal-preview"));
			myModal.show();
			console.log(e);;
		}
	}

	function validateInfo(infor) {
		//check username exxist

		//check email exist

		//check not null
		if (infor.fullName == null || infor.fullName == "") {
			return {
				status: false,
				message: `Require: Name is not null `
			};
		}

		if (infor.email == null || infor.email == "" || !infor.email.includes("@gmail.com")) {
			return {
				status: false,
				message: `Require: Email is not valid `
			};
		}

		if (infor.username == null || infor.username == "" || infor.username.includes(" ") || infor.username.length < 6) {
			return {
				status: false,
				message: `Require: Username is not valid `
			};
		}

		if (infor.password == null || infor.password == "" || infor.password.length < 8) {
			return {
				status: false,
				message: `Require: Password is not valid `
			};
		}

		//check password matches
		if (infor.password !== infor.retypePassword) {
			return {
				status: false,
				message: `Password does not match`
			};
		}

		return {
			status: true,
			message: `infor validation`
		};

    }

	function capitalizeString(str) {
		const words = str.split(' ');

		const capitalizedWords = words.map(word => {
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		});

		const capitalizedString = capitalizedWords.join(' ');

		return capitalizedString;
	}

	async function toggleModal() {
		var myModal = tailwind.Modal.getInstance(document.querySelector("#success-modal-preview"));
		myModal.show();
		await new Promise(resolve => setTimeout(resolve, 3000));
		myModal.hide();
		await new Promise(resolve => setTimeout(resolve, 1000));
	}

	$(".btn-signin").click(function () {
		window.location.href = "/Admin/Login";
	});

});