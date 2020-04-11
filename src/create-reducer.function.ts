import { Action, ActionReducer, createReducer as _createReducer, On } from '@ngrx/store';
import { isSourcedAction } from './create-sourced-action.function';

export function createReducer<S, A extends Action = Action>(initialState: S, ...ons: On<S>[]): ActionReducer<S, A>
{
    const reducer = _createReducer(initialState, ...ons);

    return function(state: S = initialState, action: A): S
    {
        const type = isSourcedAction(action) ? action.__typeWithoutSource : action.type;
        const reTypedAction: Action = { ...action, type };
        return reducer(state, reTypedAction);
    };
}
