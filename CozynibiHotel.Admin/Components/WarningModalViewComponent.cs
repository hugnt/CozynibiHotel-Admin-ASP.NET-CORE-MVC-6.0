using Microsoft.AspNetCore.Mvc;

namespace CozynibiHotel.Admin.Components
{
    [ViewComponent]
    public class WarningModalViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View("~/Views/Shared/Components/WarningModal/WarningModal.cshtml");
        }
    }
}
