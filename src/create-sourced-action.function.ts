import { createAction } from '@ngrx/store';
import { Action, ActionCreatorProps, Creator, FunctionWithParametersType, TypedAction } from '@ngrx/store/src/models';

export function createSourcedAction<T extends string>(type: T): SourcedActionCreator<T>;
export function createSourcedAction<T extends string, P extends object>(type: T, config: ActionCreatorProps<P> & NotAllowedCheck<P>): SourcedActionCreator<T, P>;
export function createSourcedAction<T extends string, P extends any[], R extends object>
(type: T, creator: Creator<P, R & NotAllowedCheck<R>>): FunctionWithParametersType<P, R & SourcedAction<T>> & SourcedAction<T>;

export function createSourcedAction<T extends string, C extends Creator>(
    type: T,
    config?: { _as: 'props' } | C
): SourcedActionCreator<T, object>
{
    const actionCreator = config
        ? createAction(type, config as ActionCreatorProps<any>)
        : createAction(type);

    const sourcedActionCreator: SourcedActionCreator<T> = Object.defineProperty(
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
    ) as SourcedActionCreator<T, object>;

    return sourcedActionCreator;
}

export type SourcedActionCreator<
    T extends string,
    P extends object = {}
> =
    { type: T }
    &
    ((sourceOrProps?: string | P, props?: P) =>
        SourcedActionCreatorReturnType<T, P, string>
        |
        SourcedActionCreatorReturnType<T, P>);

export type SourcedActionCreatorReturnType<T extends string, P extends object = {}, S extends (string | null) = null> =
    S extends null ?
        P & TypedAction<T> :
        P & SourcedAction<T>;


// Settled

export type SourcedAction<T extends string = string, S extends string = string> =
    TypedAction<T> & { readonly typeWithoutSource: S };

export const isSourcedAction = (action: Action): action is SourcedAction =>
    'type' in action && 'typeWithoutSource' in action;




// models.ts

export const arraysAreNotAllowedMsg =
  'arrays are not allowed in action creators';
type ArraysAreNotAllowed = typeof arraysAreNotAllowedMsg;

export const typePropertyIsNotAllowedMsg =
  'type property is not allowed in action creators';
type TypePropertyIsNotAllowed = typeof typePropertyIsNotAllowedMsg;

export const emptyObjectsAreNotAllowedMsg =
  'empty objects are not allowed in action creators';
type EmptyObjectsAreNotAllowed = typeof emptyObjectsAreNotAllowedMsg;

export type NotAllowedCheck<T extends object> = T extends any[]
    ? ArraysAreNotAllowed
    : T extends { type: any }
    ? TypePropertyIsNotAllowed
    : keyof T extends never
    ? EmptyObjectsAreNotAllowed
    : unknown;