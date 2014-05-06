using System;
using System.Web;
using System.Web.Mvc;

using Newtonsoft.Json;

namespace webgl.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetSphere(int cols = 20, int rows = 15)
        {
            Data.ObjectData r = Handlers.Geometry.GetSphere(cols, rows);
            return Json(JsonConvert.SerializeObject(r), JsonRequestBehavior.AllowGet);
        }
    }
}
