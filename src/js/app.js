import { createElement as vNode } from "../../vendor/react.js";
import ReactRouterDom from "../../vendor/react-router-dom.js";
// const { Route, Switch } = ReactRouterDom;
// const { createHashRouter, RouterProvider } = ReactRouterDom;
import { routerGuard } from "./router/routerGuard.js";
import Home from "./views/home/home.js";
import ErrorPage from "./views/error-page/error-page.js";
import PageNotFound from "./views/404/404.js";
// import RealTimeDemo from "./views/real-time-demo/real-time-demo.js";
import FileReaderDemo from "./views/file-reader-demo/file-reader-demo.js";
import { ThemeContext, themes } from "./utils/theme.js";

const routes = [
  {
    path: "/",
    element: vNode(Home),
    errorElement: vNode(ErrorPage),
    children: [
      // {
      //   path: "real-time-demo",
      //   element: vNode(RealTimeDemo),
      // },
      {
        path: "file-reader-demo",
        element: vNode(FileReaderDemo),
      },
      {
        path: "",
        element: vNode(FileReaderDemo),
      },
      {
        path: "*",
        element: vNode(PageNotFound),
      },
    ]
  },
  // { path: "*", element: vNode(PageNotFound), },
];

export function MyApp() {

  // const logger = function logger ({content, style, duration, details}) {
  //   const style_ = (MessagePlugin[style]!=null) ? style : "info";
  //   MessagePlugin[style_]?.(content??JSON.stringify(details));
  // };

  // useEffect(()=>{
  //   // engine.setLogger(logger);
  //   // engine.init();
  // }, []);

  return vNode(ThemeContext.Provider,
    { value: themes.dark },
    vNode(ReactRouterDom.HashRouter, null, vNode(routerGuard, {routes}))
  );
}
