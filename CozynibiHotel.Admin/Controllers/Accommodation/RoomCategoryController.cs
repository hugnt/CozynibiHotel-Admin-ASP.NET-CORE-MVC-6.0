using CozynibiHotel.Admin.Models;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using CozynibiHotel.Admin.Entities;
using System.Text.Json;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;
using CozynibiHotel.Admin.Attributes;

namespace CozynibiHotel.Admin.Controllers.Accommodation
{

    [CustomAuthorize]
    [Route("Admin/Accommodation/RoomCategory")]
    public class FoodCategoryController : Controller
    {
        [Route("")]
        [Route("Index")]
        public IActionResult Index()
        {
            return View("~/Views/Accommodation/RoomCategory/Index.cshtml");
        }

        [Route("AddNew")]
        public IActionResult AddNew()
        {
            return View("~/Views/Accommodation/RoomCategory/AddNew.cshtml");
        }

        [Route("Edit/{id}")]
        public IActionResult Edit(int id)
        {
            return View("~/Views/Accommodation/RoomCategory/Edit.cshtml");
        }

        [Route("Trash")]
        public IActionResult Trash()
        {
            return View("~/Views/Accommodation/RoomCategory/Trash.cshtml");
        }
    }
}
