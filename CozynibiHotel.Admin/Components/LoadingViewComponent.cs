using Microsoft.AspNetCore.Mvc;

namespace CozynibiHotel.Admin.Components
{
    [ViewComponent]
    public class LoadingViewComponent : ViewComponent
    {
        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View("~/Views/Shared/Components/Loading/Loading.cshtml");
        }

    }
}
