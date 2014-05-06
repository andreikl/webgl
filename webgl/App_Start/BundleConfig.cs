using System.Web;
using System.Web.Optimization;

namespace webgl {
    public class BundleConfig {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles) {
            bundles.Add(new ScriptBundle("~/bundles/webglapi").Include(
                "~/Scripts/jquery.min.js",
                "~/Scripts/glMatrix.js",
                "~/Scripts/app/webglhelpers.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/css/bootstrap.min.css",
                "~/Content/css/app.css"));

            bundles.Add(new ScriptBundle("~/bundles/angular").Include(
                "~/Scripts/jquery.min.js",
                "~/Scripts/bootstrap.min.js",
                "~/Scripts/angular.min.js",
                "~/Scripts/angular-route.min.js",
                "~/Scripts/app/app.js",
                "~/Scripts/app/example1.js",
                "~/Scripts/app/example2.js",
                "~/Scripts/app/example3.js",
                "~/Scripts/app/example4.js"));
        }
    }
}
