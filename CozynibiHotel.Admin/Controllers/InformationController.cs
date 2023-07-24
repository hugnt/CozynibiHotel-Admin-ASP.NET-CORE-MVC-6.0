using CozynibiHotel.Admin.Models;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using CozynibiHotel.Admin.Entities;
using System.Text.Json;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;
using CozynibiHotel.Admin.Attributes;

namespace CozynibiHotel.Admin.Controllers.Menu
{

    [CustomAuthorize]
    [Route("Admin/Information")]
    public class InformationController : Controller
    {
        [Route("")]
        [Route("Index")]
        public IActionResult Index()
        {
            return View();
        }

        [Route("Edit")]
        public IActionResult Edit(int id)
        {
            return View();
        }

    }
}
