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
    [Route("Admin/Menu/FoodCategory")]
    public class FoodCategoryController : Controller
    {
        [Route("")]
        [Route("Index")]
        public IActionResult Index()
        {
            return View("~/Views/Menu/FoodCategory/Index.cshtml");
        }

        [Route("AddNew")]
        public IActionResult AddNew()
        {
            return View("~/Views/Menu/FoodCategory/AddNew.cshtml");
        }

        [Route("Edit/{id}")]
        public IActionResult Edit(int id)
        {
            return View("~/Views/Menu/FoodCategory/Edit.cshtml");
        }

        [Route("Trash")]
        public IActionResult Trash()
        {
            return View("~/Views/Menu/FoodCategory/Trash.cshtml");
        }
    }
}
