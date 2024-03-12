import { useEffect } from "../../../vendor/react.js";
import ReactRouterDom from "../../../vendor/react-router-dom.js";
// import { MessagePlugin } from "../../../vendor/tdesign.min.js";
// import { UserApi } from "../utils/api/api.js";
// import storage from "../utils/store.js";

const BASE_PATH = '';

const { useLocation, useNavigate, useRoutes, matchPath } = ReactRouterDom;

// // 找到当前path的路由配置信息
// function searchRouterDetail(path, routes) {
//   for (const item of routes) {
//     if (matchPath(item.path, path)) return item;
//     if (item.children) {
//       return searchRouterDetail(path, item.children);
//     }
//   }
// }

// 全局路由守卫
function guard(location, navigate, routes) {
  console.log({location, navigate, routes});
  // const { pathname } = location;
  // const routeDetail = searchRouterDetail(pathname, routes);
  // if (!routeDetail) {
  //   return navigate(BASE_PATH+'/404');
  // }

  // // 权限验证
  // if (routeDetail.loginRequired) { // routeDetail.meta.loginRequired
  //   if (storage.getItem("refresh_token_expired")) {
  //     MessagePlugin.warning("登录过期，请重新登录");
  //     UserApi.logout();
  //     return navigate(BASE_PATH+'/login');
  //   };
  //   const access_token = storage.getItem('access_token');
  //   const refresh_token = storage.getItem('refresh_token');
  //   const username = storage.getItem('current_user')?.username;
  //   if (!username || !access_token || !refresh_token) {
  //     MessagePlugin.warning("请登录");
  //     return navigate(BASE_PATH+'/login');
  //   }
  // }
}


export const routerGuard = ({routes}) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    guard(location, navigate, routes);
  }, [location, navigate, routes]);

  const element = useRoutes(routes);

  return element;
};


// 作者：用户6219529726635
// 链接：https://juejin.cn/post/7101925921103282183
// 来源：稀土掘金
// 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。