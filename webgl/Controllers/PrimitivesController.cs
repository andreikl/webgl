using System;
using System.Linq;
using System.Web.Http;
using System.Collections.Generic;

namespace webgl.Controllers
{
    public class PrimitivesController : ApiController
    {
        // GET api/primitives/sphere
        [ActionName("sphere")]
        public IHttpActionResult Get(int cols = 20, int rows = 15)
        {
            Data.ObjectData r = Handlers.Geometry.GetSphere(cols, rows);
            return Ok(r);
        }
    }
}
