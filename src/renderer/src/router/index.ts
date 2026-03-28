import { createMemoryHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/home"
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../views/Home.vue"),
    children: [
      // {
      //   path: "annotation",
      //   name: "floatMenuDraw",
      //   component: () => import("../components/menu/floatMenu/floatMenuDraw.vue")
      // }
    ]
  }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export default router