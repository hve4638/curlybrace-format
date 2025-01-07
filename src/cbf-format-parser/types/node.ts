import { AnyExpression } from '../../expr-parse/types/expressions';
import { Fragment } from '../template-splitter';
import { FragmentType } from './fragment';

export type Node = {
    node_type : 'single';
    fragment : Fragment;
} & ({
    type : typeof FragmentType.TEXT;
    text : string;
} | {
    type : typeof FragmentType.DIRECTIVE;
    keyword : string;
    field : string;
} | {
    type : typeof FragmentType.EXPRESSION;
    expression : AnyExpression;
});

export const ActionType = {
    JUMP : 'JUMP',
    CONDITIONAL_JUMP : 'CONDITIONAL_JUMP',
    BREAK : 'BREAK',
    SCOPE : 'SCOPE',
    ENTER_SCOPE : 'ENTER_SCOPE',
    EXIT_SCOPE : 'EXIT_SCOPE',
    ITERATE_INIT : 'ITERATE_INIT',
    ITERATE_NEXT : 'ITERATE_NEXT',

} as const;
export type ActionType = typeof ActionType[keyof typeof ActionType];
export type Action = {
    node_type : 'action';
    type : typeof ActionType.JUMP,
    jump_to : number;
} | {
    type : typeof ActionType.CONDITIONAL_JUMP,
    fragment : Fragment;
    expression : string;
    not : boolean;
    jump_to : number;
} | {
    type : typeof ActionType.BREAK,
} | {
    type : typeof ActionType.ENTER_SCOPE
} | {
    type : typeof ActionType.EXIT_SCOPE
} | {
    type : typeof ActionType.ITERATE_INIT,
    fragment : Fragment;
    expression : string;
    iterator_variable : string;
} | {
    type : typeof ActionType.ITERATE_NEXT
    iterator_variable : string;
    result_variable : string;
}

export type SequenceNode = {
    node_type : 'sequence';
    fragments : (Node|Action)[];
}