import { navigation } from 'effe-ts'
import * as ReactDOM from 'react-dom'
import { createHashHistory } from 'history'
import { app } from './App'

declare global {
  interface Window {
    APP_CONFIG: unknown
  }
}

navigation
  .run(
    app,
    dom => {
      ReactDOM.render(dom, document.getElementById('app'))
    },
    {
      history: navigation.history(createHashHistory())
    }
  )
  .subscribe(model => console.log(model))
