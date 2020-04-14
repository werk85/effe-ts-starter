import { Union, of } from 'ts-union'
import * as R from 'fp-ts-routing'
import { pipe } from 'fp-ts/lib/pipeable'
import * as M from 'fp-ts/lib/Monoid'
import { navigation } from 'effe-ts'

// 1. Add a new entry to this list of `Route`
export const Route = Union({
  Home: of<{}>(),
  Links: of<{}>(),
  NewPage: of<{}>(),
  NotFound: of<{}>()
})
export type Route = typeof Route.T

// Url definition
// 2. add a url definition
// With `R.lit` you define a name, with `R.end` you indicate the end of the url
const home = R.end
const links = pipe(R.lit('links'), R.then(R.end))
const newPage = pipe(R.lit('new-page'), R.then(R.end))
const notFound = pipe(R.lit('404'), R.then(R.end))

// 3. Connect the define `Route` with the defined `Url definition` by adding a new entry to the end of the array
const router = M.fold(R.getParserMonoid<Route>())([
  home.parser.map(Route.Home),
  links.parser.map(Route.Links),
  newPage.parser.map(Route.NewPage)
])

const formatRoute = <A extends object>(match: R.Match<A>) => (a: A): string =>
  `#${match.formatter.run(R.Route.empty, a).toString()}`

export function parseRoute(location: navigation.Location): Route {
  return R.parse(router, R.Route.parse(location.pathname + location.search), Route.NotFound({}))
}

// 4. Add a new entry the `match` function
export const toHref = (route: Route): string =>
  Route.match(route, {
    Home: formatRoute(home),
    Links: formatRoute(links),
    NewPage: formatRoute(newPage),
    NotFound: formatRoute(notFound)
  })
