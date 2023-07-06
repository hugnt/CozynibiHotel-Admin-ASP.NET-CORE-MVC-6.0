using Microsoft.AspNetCore.Mvc.Filters;

namespace CozynibiHotel.Admin.Attributes
{
    public sealed class CustomAuthorize2Attribute : IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            Console.WriteLine("Djt mm1");
            if (context != null)
            {
                Console.WriteLine("Djt mm");
            }
        }
    }
}
