import { useFlowStore } from './store/flowStore';

setTimeout(() => {
    console.log(useFlowStore.getState().nodes);
}, 2000);
