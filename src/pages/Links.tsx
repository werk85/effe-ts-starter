import { Union } from 'ts-union'
import { state, html } from 'effe-ts'
import React from 'react'

export const Action = Union({})
export type Action = typeof Action.T

export interface Model {}

export interface Env {}

export type State<R extends Env> = state.State<R, Model, Action>

export function init<R extends Env>(): State<R> {
  return state.of({})
}

export function update<R extends Env>(action: Action): (model: Model) => State<R> {
  return state.of
}

export function view(model: Model): html.Html<JSX.Element, Action> {
  return dispatch => <>Links</>
}
