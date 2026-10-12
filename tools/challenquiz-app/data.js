/* Challenquiz prototype — content and rules.
   Everything here mirrors the Figma draft (section 1499:15729): the economy on
   the header, the ten Nature questions, the room's other nine players. */

window.CQ = {
  entry: 200,
  perCorrect: 36,
  hintCost: 6,              // taken off that question's prize, so only charged when correct
  placement: [36, 24, 12],  // 1st, 2nd, 3rd
  seconds: 20,
  maxWin: 396,
  startBalance: 1252,
  lowBalance: 152,

  /* q: the question, with *the emphasised part* in asterisks (matches the
     card's Regular + SemiBold mix). crowd: % of the room that picked each
     option. hint: index of the wrong option the hint removes. */
  questions: [
    { q: 'What is *the highest peak* in Europe?', a: ['Elbrus', 'Mont Blanc', 'Ushba', 'Shkhara'], c: 0, crowd: [50, 25, 13, 12], hint: 3,
      fact: 'Elbrus (5,642 m) is Europe’s highest. Mont Blanc tops the Alps.' },
    { q: 'Which is *the largest ocean* on Earth?', a: ['Atlantic', 'Pacific', 'Indian', 'Arctic'], c: 1, crowd: [14, 71, 10, 5], hint: 3,
      fact: 'The Pacific covers about a third of Earth’s surface — more than all the land combined.' },
    { q: 'What is *the fastest land animal*?', a: ['Lion', 'Pronghorn', 'Cheetah', 'Greyhound'], c: 2, crowd: [9, 22, 64, 5], hint: 0,
      fact: 'A cheetah can sprint at about 110 km/h — but only for around 30 seconds.' },
    { q: 'What is *the longest river* in Africa?', a: ['Congo', 'Niger', 'Nile', 'Zambezi'], c: 2, crowd: [18, 6, 70, 6], hint: 3,
      fact: 'The Nile runs about 6,650 km through 11 countries.' },
    { q: 'Which tree *produces acorns*?', a: ['Maple', 'Oak', 'Birch', 'Pine'], c: 1, crowd: [8, 83, 5, 4], hint: 3,
      fact: 'Acorns are oak seeds — one tree can drop thousands in a good year.' },
    { q: 'What is *the largest desert* in the world?', a: ['Sahara', 'Antarctica', 'Gobi', 'Arabian'], c: 1, crowd: [41, 38, 12, 9], hint: 2,
      fact: 'Antarctica. A desert is defined by how little rain falls, not by heat.' },
    { q: 'How many *hearts* does an octopus have?', a: ['One', 'Two', 'Three', 'Four'], c: 2, crowd: [12, 27, 52, 9], hint: 3,
      fact: 'Three: two pump blood to the gills, one to the rest of the body.' },
    { q: 'Which gas do plants *absorb from the air*?', a: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], c: 2, crowd: [24, 6, 68, 2], hint: 3,
      fact: 'Plants turn CO₂ and sunlight into sugar — and release oxygen.' },
    { q: 'What is *the tallest waterfall* in the world?', a: ['Niagara Falls', 'Angel Falls', 'Victoria Falls', 'Iguazu Falls'], c: 1, crowd: [21, 47, 25, 7], hint: 0,
      fact: 'Angel Falls in Venezuela drops 979 m — about 15 times Niagara.' },
    { q: 'Which bird can *fly backwards*?', a: ['Hummingbird', 'Kingfisher', 'Swift', 'Sparrow'], c: 0, crowd: [74, 10, 11, 5], hint: 3,
      fact: 'Hummingbirds can hover, fly backwards and even upside down.' },
  ],

  /* The other nine seats. `done` = already finished when you reach the result;
     the rest finish one by one while you watch. time in seconds. */
  players: [
    { name: 'Mike', score: 10, time: 118, av: 'av1', done: true },
    { name: 'Kia', score: 9, time: 125, av: 'av2', done: true },
    { name: 'Sara', score: 6, time: 160, av: 'av3', done: true },
    { name: 'Noah', score: 6, time: 171, av: 'av4', done: true },
    { name: 'Jon', score: 5, time: 140, av: 'av2', done: true },
    { name: 'Ari', score: 3, time: 150, av: 'av1', done: true },
    { name: 'Omid', score: 7, time: 153, av: 'av3', done: false },
    { name: 'Lina', score: 4, time: 166, av: 'av4', done: false },
    { name: 'Tara', score: 2, time: 181, av: 'av1', done: false },
  ],

  worlds: [
    { id: 'nature', name: 'Nature', live: 12, big: true },
    { id: 'sport', name: 'Sport', live: 9 },
    { id: 'law', name: 'Law', live: 3 },
    { id: 'cinema', name: 'Cinema', live: 7 },
    { id: 'blockchain', name: 'Blockchain', live: 5 },
    { id: 'technology', name: 'Technology', live: 4, big: true },
  ],
};
