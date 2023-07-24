using CozynibiHotel.Admin.Models;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc;
using CozynibiHotel.Admin.Entities;
using System.Text.Json;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authorization;
using CozynibiHotel.Admin.Attributes;

namespace CozynibiHotel.Admin.Controllers.ContactAndBooking
{

    [CustomAuthorize]
    [Route("Admin/ContactAndBooking/Booking")]
    public class BookingController : Controller
    {
        [Route("")]
        [Route("Index")]
        public IActionResult Index()
        {
            return View("~/Views/ContactAndBooking/Booking/Index.cshtml");
        }

        [Route("AddNew")]
        public IActionResult AddNew()
        {
            return View("~/Views/ContactAndBooking/Booking/AddNew.cshtml");
        }

        [Route("Edit/{id}")]
        public IActionResult Edit(int id)
        {
            return View("~/Views/ContactAndBooking/Booking/Edit.cshtml");
        }

        [Route("Trash")]
        public IActionResult Trash()
        {
            return View("~/Views/ContactAndBooking/Booking/Trash.cshtml");
        }
    }
}
