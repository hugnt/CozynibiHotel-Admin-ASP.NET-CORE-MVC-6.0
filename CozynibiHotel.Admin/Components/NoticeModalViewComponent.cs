using CozynibiHotel.Admin.Models;
using Microsoft.AspNetCore.Mvc;

namespace CozynibiHotel.Admin.Components
{
    [ViewComponent]
    public class NoticeModalViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync(BoxModalViewModel boxModel)
        {
            return View("~/Views/Shared/Components/NoticeModal/NoticeModal.cshtml", boxModel);
        }
    }
}
