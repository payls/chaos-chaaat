const position = { x: 0, y: 0 };

const nodes = [
  {
    id: '1',
    type: 'source',
    data: {
      title: 'Start',
      description: 'Triggered by Outgoing message',
      stats: {
        started: 0,
      },
    },
    position,
    // style: {
    //   width: 250,
    // },
  },
  {
    id: '2',
    type: 'end',
    data: {
      title: 'End of Automation',
      description:
        'The flow can jump to another node if available, otherwise it will end here',
      flowData: { toJump: null },
    },
    position,
  },
];

const edges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'condition',
  },

  // {
  //     id: "e7-8",
  //     source: "7",
  //     target: "8",
  //     type: "condition",
  // },
];

export const initialElements = [...nodes, ...edges];
