import { FlowExecutor } from './executor.js';

const executor = new FlowExecutor({
    environment: { 'TOKEN': 'my-secret-token' },
    onLog: log => console.log("FLOW LOG:", log),
    onVariable: (k, v) => console.log("VAR:", k, v)
});

const nodes = [
    { id: 'start', type: 'start' },
    {
        id: 'n1',
        type: 'apiRequest',
        data: {
            url: 'http://example.com',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    },
    {
        id: 'n2',
        type: 'extract',
        data: {
            extractions: [{
                id: 'ext1',
                path: '$.status',
                variableName: '{{status_code}}',
                targetType: 'env'
            }]
        }
    },
    { id: 'end', type: 'end' }
];

const edges = [
    { source: 'start', target: 'n1' },
    { source: 'n1', target: 'n2' },
    { source: 'n2', target: 'end' }
];

console.log("Starting execution...");
executor.execute(nodes, edges).then(res => {
    console.log("EXEC COMPLETE:", res.environment);
}).catch(console.error);
