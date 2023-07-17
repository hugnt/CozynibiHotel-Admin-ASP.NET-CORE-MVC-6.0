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
    [Route("Admin/Article")]
    public class ArticleController : Controller
    {
        [Route("")]
        [Route("Index")]
        public IActionResult Index()
        {
            return View();
        }

        [Route("AddNew")]
        public IActionResult AddNew()
        {
            return View();
        }

        [Route("Edit/{id}")]
        public IActionResult Edit(int id)
        {
            return View();
        }

        [Route("Trash")]
        public IActionResult Trash()
        {
            return View();
        }
    }
}
