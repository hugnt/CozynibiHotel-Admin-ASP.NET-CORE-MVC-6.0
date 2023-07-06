using Microsoft.AspNetCore.Mvc;

namespace CozynibiHotel.Admin.Components
{
    [ViewComponent]
    public class NotFoundViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View("~/Views/Shared/Components/NotFound/NotFound.cshtml");
        }

    }
}
