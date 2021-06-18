import { Action, ActionCreator } from '@ngrx/store';
import { ofType as _ofType } from '@ngrx/effects';
import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isSourcedAction } from './create-sourced-action.function';

export const ofType = ((...allowedTypes: (string | ActionCreator)[]): OperatorFunction<Action, Action> =>
{
    return filter((action: Action) =>
        allowedTypes.some(typeOrActionCreator =>
        {
            const actionType = isSourcedAction(action) ? action.typeWithoutSource : action.type;
            const checkedType = typeof typeOrActionCreator === 'string' ?
                typeOrActionCreator :
                typeOrActionCreator.type;

            return checkedType === actionType;
        })
    );
}) as typeof _ofType;
