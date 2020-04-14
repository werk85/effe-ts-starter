import { state, navigation, html } from 'effe-ts'
import { Union, of } from 'ts-union'
import * as React from 'react'
import { Container } from 'react-bootstrap'
import { pipe } from 'fp-ts/lib/pipeable'
import { flow } from 'fp-ts/lib/function'
import { Route, parseRoute, toHref } from './router'
import * as pages from './pages'
import { Navigation } from './components'

export const Action = Union({
  Home: of<pages.Home.Action>(),
  Links: of<pages.Links.Action>(),
  NewPage: of<pages.NewPage.Action>(),
  Navigate: of<Route>()
})
export type Action = typeof Action.T

export const Model = Union({
  Home: of<pages.Home.Model>(),
  Links: of<pages.Links.Model>(),
  NewPage: of<pages.NewPage.Model>(),
  Redirect: of<{}>()
})
export type Model = typeof Model.T

export interface Env extends pages.Home.Env, pages.Links.Env {}

export type State = state.State<Env, Model, Action>
export interface Html extends html.Html<JSX.Element, Action> {}

export interface StateHandler<M = Model> {
  (model: M): State
}

export function ifModel<M>(
  f: (model: Model, match: StateHandler<M>, orElse: () => State) => State,
  g: StateHandler<M>
): StateHandler {
  return model => f(model, g, () => state.of(model))
}

export function changeRoute(route: Route): StateHandler {
  return model =>
    Route.match(route, {
      Home: () => pipe(pages.Home.init<Env>(), state.bimap(Action.Home, Model.Home)),
      Links: () => pipe(pages.Links.init<Env>(), state.bimap(Action.Links, Model.Links)),
      NewPage: () => pipe(pages.NewPage.init<Env>(), state.bimap(Action.NewPage, Model.NewPage)),
      NotFound: () => pipe(pages.Home.init<Env>(), state.bimap(Action.Home, Model.Home))
    })
}

export function init(location: navigation.Location): State {
  return pipe(Model.Redirect({}), pipe(location, parseRoute, changeRoute))
}

export function updateHomePage(action: pages.Home.Action): StateHandler {
  return ifModel(Model.if.Home, flow(pages.Home.update(action), state.bimap(Action.Home, Model.Home)))
}

export function updateLinksPage(action: pages.Links.Action): StateHandler {
  return ifModel(Model.if.Links, flow(pages.Links.update(action), state.bimap(Action.Links, Model.Links)))
}

export function updateNewPage(action: pages.NewPage.Action): StateHandler {
  return ifModel(Model.if.NewPage, flow(pages.NewPage.update(action), state.bimap(Action.NewPage, Model.NewPage)))
}

export function update(action: Action): StateHandler {
  return Action.match(action, {
    Home: updateHomePage,
    Links: updateLinksPage,
    NewPage: updateNewPage,
    Navigate: changeRoute
  })
}

export function withLayout(children: Html): Html {
  return dispatch => (
    <>
      <Navigation home={toHref(Route.Home({}))} links={toHref(Route.Links({}))} newPage={toHref(Route.NewPage({}))} />
      <Container>{children(dispatch)}</Container>
    </>
  )
}

export const homeView = flow(pages.Home.view, html.map(Action.Home), withLayout)
export const linksView = flow(pages.Links.view, html.map(Action.Links), withLayout)
export const newPageView = flow(pages.NewPage.view, html.map(Action.NewPage), withLayout)

export function view(model: Model): Html {
  return Model.match(model, {
    Home: homeView,
    Links: linksView,
    NewPage: newPageView,
    Redirect: () => () => <></>
  })
}

export function locationToAction(location: navigation.Location): Action {
  return Action.Navigate(parseRoute(location))
}

export const app = navigation.program(locationToAction, init, update, view)
