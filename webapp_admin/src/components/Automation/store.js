import { create } from 'zustand';

const useFlowBuilderStore = create((set) => ({
  nodes: 0,
  removeAllNodes: () => set({ nodes: [] }),
  updateNodes: (nodes) => set({ nodes }),

  edges: 0,
  removeAllEdges: () => set({ edges: [] }),
  updateEdges: (edges) => set({ edges }),

  keysSelected: [],
  updateKeySelected: (keysSelected) => set({ keysSelected }),
}));

export default useFlowBuilderStore;
