using Microsoft.AspNetCore.Mvc;

using PRN212.AIStudyHub.WebAPI.Extensions;

namespace PRN212.AIStudyHub.WebAPI.Controllers
{
  [ApiController]
  public abstract class BaseApiController : ControllerBase
  {
    protected Guid CurrentUserId => User.GetUserId();
  }
}
