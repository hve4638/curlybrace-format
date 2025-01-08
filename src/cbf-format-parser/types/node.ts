import { AnyExpression, EvaluatableExpression } from '../../expr-parse/types/expressions';
import { Fragment } from '../types/fragment';
import { FragmentType } from './fragment';

export const NodeType = {
    SINGLE : 'single',
    SEQUENCE : 'sequence',
    ACTION : 'action'
} as const;
type NodeType = typeof NodeType[keyof typeof NodeType];

export type Node = SingleNode | Action | SequenceNode;

export type SingleNode = {
    node_type : typeof NodeType.SINGLE;
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
    node_type : typeof NodeType.ACTION;
} & ({
    type : typeof ActionType.JUMP,
    jump_to : number;
} | {
    type : typeof ActionType.CONDITIONAL_JUMP,
    fragment : Fragment;
    expression : EvaluatableExpression;
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
    expression : EvaluatableExpression;
    iterator_variable : string;
} | {
    type : typeof ActionType.ITERATE_NEXT
    iterator_variable : string;
    result_variable : string;
});

export type SequenceNode = {
    node_type : typeof NodeType.SEQUENCE;
    nodes : (Node|Action)[];
}