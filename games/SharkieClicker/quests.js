const quests = [
    {
      id: "clickstorm_champion",
      name: "ClickStarter",
      description: "Catch 10,000 times",
      unlockAt: 0,
      type: "clicks",
      goal: 10000,
      reward: 25,
      completed: false
    },
    {
      id: "millionaire_fin",
      name: "Millionaire Sharkie",
      description: "Catch 1,000,000 Sharkies",
      unlockAt: 0,
      type: "clicks",
      goal: 1000000,
      reward: 150,
      completed: false
    },
    {
      id: "ultimate_finisher",
      name: "World of Sharkies",
      description: "Catch 10,000,000 Sharkies",
      unlockAt: 0,
      type: "clicks",
      goal: 10000000,
      reward: 500,
      completed: false
    },
    {
      id: "helper_hoarder",
      name: "Sharkies Help :3",
      description: "Unlock 10 Helpers",
      unlockAt: 1000,
      type: "helpers",
      goal: 3,
      reward: 15,
      completed: false
    },
    {
      id: "lottie_love",
      name: "Lottie Love",
      description: "Collect 100 Hearts while Lottie is helping",
      unlockAt: 1000000,
      type: "lottie_hearts",
      goal: 100,
      reward: 10,
      progress: 0,
      completed: false
    }    
  ];
  
  export default quests;
  