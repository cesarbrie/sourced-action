import { Action, ActionCreator, ActionReducer, createReducer as _createReducer, ReducerTypes } from '@ngrx/store';
import { isSourcedAction } from './create-sourced-action.function';

export function createReducer<S, A extends Action = Action>(initialState: S, ...ons: ReducerTypes<S, ActionCreator[]>[]): ActionReducer<S, A>
{
    const reducer = _createReducer(initialState, ...ons);

    return function(state: S = initialState, action: A): S
    {
        const type = isSourcedAction(action) ? action.typeWithoutSource : action.type;
        const reTypedAction: Action = { ...action, type };
        return reducer(state, reTypedAction);
    };
}
