import { createAction } from '@ngrx/store';
import { Action, ActionCreator, Creator, FunctionWithParametersType, TypedAction } from '@ngrx/store/src/models';

// Action creators taken from ts-action library and modified a bit to better
// fit current NgRx usage. Thank you Nicholas Jamieson (@cartant).

export function createSourcedAction<T extends string>(type: T): SourcedActionCreator<T>;
export function createSourcedAction<T extends string, P extends object>(type: T, config: Props<P>):
SourcedActionCreator<T, P>;
export function createSourcedAction<T extends string, P extends any[], R extends object>
(type: T, creator: Creator<P, R>): FunctionWithParametersType<P, R & TypedAction<T>> & TypedAction<T>;

export function createSourcedAction<T extends string, C extends Creator, P extends object>(
    type: T,
    config?: Props<P> | C
): SourcedActionCreator<T, P>
{
    const actionCreator: ActionCreator<T> = createAction(type, config as any);

    const sourcedActionCreator: SourcedActionCreator<T, P> = Object.defineProperty(
        <S extends string, P extends object>(sourceOrProps?: S | P, props?: P):
        SourcedActionCreatorReturnType<T, P, S> | SourcedActionCreatorReturnType<T, P> =>
        {
            if (typeof sourceOrProps === 'string')
            {
                const action = actionCreator(props);
                const source = sourceOrProps;

                Object.defineProperty(action, 'typeWithoutSource', {
                    value: type,
                    writable: false,
                });

                Object.defineProperty(action, 'type', {
                    value: `[${source}] ${type}`,
                    writable: false,
                });

                return action as SourcedActionCreatorReturnType<T, P, S>;
            }
            else
            {
                const props = sourceOrProps;
                return actionCreator(props) as SourcedActionCreatorReturnType<T, P>;
            }
        },
        'type', { value: type, writable: false }
    );

    return sourcedActionCreator;
}

interface Props<P>
{
    _as: 'props';
    _p: P;
}

export type SourcedActionCreator<T extends string, P extends object = object, S extends string = string> =
    { type: T } & ((sourceOrProps?: S | P, props?: P) =>
        SourcedActionCreatorReturnType<T, P, S> | SourcedActionCreatorReturnType<T, P>);

export type SourcedActionCreatorReturnType<T extends string, P extends object, S extends (string | null) = null> =
    S extends null ?
        P & TypedAction<T> :
        P & SourcedAction<T>;


// Settled

export type SourcedAction<T extends string = string, S extends string = string> =
    TypedAction<T> & { readonly typeWithoutSource: S };

export const isSourcedAction = (action: Action): action is SourcedAction =>
    'type' in action && 'typeWithoutSource' in action;
