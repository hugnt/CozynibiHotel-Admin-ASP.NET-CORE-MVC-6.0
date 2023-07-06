using CozynibiHotel.Admin.Models;
using Microsoft.AspNetCore.Mvc;

namespace CozynibiHotel.Admin.Components
{
    [ViewComponent]
    public class SuccessModalViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(BoxModalViewModel boxModel)
        {
            return View("~/Views/Shared/Components/SuccessModal/SuccessModal.cshtml", boxModel);
        }
    }
}
