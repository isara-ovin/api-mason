import StartNode from './StartNode';
import EndNode from './EndNode';
import ApiRequestNode from './ApiRequestNode';
import IfConditionNode from './IfConditionNode';
import DelayNode from './DelayNode';
import TransformNode from './TransformNode';
import PollingNode from './PollingNode';
import ExtractNode from './ExtractNode';

export const nodeTypes = {
    start: StartNode,
    end: EndNode,
    apiRequest: ApiRequestNode,
    ifCondition: IfConditionNode,
    delay: DelayNode,
    transform: TransformNode,
    polling: PollingNode,
    extract: ExtractNode,
};
