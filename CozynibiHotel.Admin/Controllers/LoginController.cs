using CozynibiHotel.Admin.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;

namespace CozynibiHotel.Admin.Controllers
{
	[Route("Admin")]
	public class LoginController : Controller
	{
		private const string HOST = "https://localhost:7289";
		private const string GET_TOKEN = HOST + "/api/User/Login";

		[Route("Login")]
		public IActionResult Index()
		{
			return View();
		}

		[Route("SignUp")]
		public IActionResult SignUp()
		{
			return View();
		}


		[Route("SignIn")]
		[HttpPost]
		public async Task<IActionResult> SignIn([FromBody]Account account) 
		{
			using var client = new HttpClient();
			client.BaseAddress = new Uri(HOST);

			var obj = new
			{
				username = account.Username,
				password = account.Password,
				fullName = "NguyenHung",
				email ="hung@yeuml",
				phoneNumber = "0946928815",
				avatar = "okok"
			};

			HttpContent body = new StringContent(
				JsonConvert.SerializeObject(obj),Encoding.UTF8, "application/json");

			try
			{
				var response = client.PostAsync("/api/User/Login", body).Result;

				if (response.IsSuccessStatusCode)
				{
					var content = await response.Content.ReadAsStringAsync();
					if (!string.IsNullOrEmpty(content))
					{
						var responseServer = JsonConvert.DeserializeObject<ResponseModel>(content);

						Console.WriteLine("Data Saved Successfully.");

						if (responseServer != null)
						{
							var accessToken = responseServer.Data.AccessToken;
							var refeshToken = responseServer.Data.RefeshToken;
							HttpContext.Response.Cookies.Append("AccessToken", accessToken);
							HttpContext.Response.Cookies.Append("RefreshToken", refeshToken);
							return Ok("/Admin/Accommodation/RoomCategory");
						}
					}
				}
			}
			catch (Exception e)
			{
				ModelState.AddModelError("", e.ToString());
				return StatusCode(500, ModelState);
			}
			
			ModelState.AddModelError("", "Failed to login");
			return StatusCode(400, ModelState);
			
		}


		[Route("LogOut")]
		[HttpGet]
		public IActionResult SignOut()
		{
			HttpContext.Response.Cookies.Delete("AccessToken");
			HttpContext.Response.Cookies.Delete("RefreshToken");
			return Redirect("/Admin/Login");
		}
	}
}
