export const tests = {
  iq: { title: 'IQ Test', time: '3 min', color: 'violet', description: 'Connect the dots, spot the patterns, and put your logic to work.' },
  memory: { title: 'Memory Test', time: '2 min', color: 'mint', description: 'See how much you can hold in mind when the details disappear.' },
  'mental-age': { title: 'Mental Age', time: '2 min', color: 'peach', description: 'Explore how your habits and choices shape your outlook.' }
};

export const iq = [
  ['What comes next? 2, 6, 12, 20, 30, …', ['36','40','42','48'], 2, 'Patterns'],
  ['Which one does not belong?', ['Triangle','Square','Circle','Pentagon'], 2, 'Classification'],
  ['A glove is to a hand as a sock is to a …', ['Shoe','Foot','Knee','Toe'], 1, 'Analogies'],
  ['All Lumas are blue. No blue things are soft. What must be true?', ['Some Lumas are soft','No Lumas are soft','All soft things are Lumas','There are no Lumas'], 1, 'Deduction'],
  ['What comes next? A, C, F, J, O, …', ['S','T','U','V'], 2, 'Patterns'],
  ['Which number differs from the others?', ['16','25','36','48'], 3, 'Classification'],
  ['A seed is to a tree as an egg is to a …', ['Nest','Feather','Bird','Shell'], 2, 'Analogies'],
  ['Mia is older than Eli. Eli is older than Bo. Who is youngest?', ['Mia','Eli','Bo','Cannot be known'], 2, 'Deduction']
];

export const memory = [
  ['Which shape was in the middle?', ['●  ▲  ◆','◇','▲','●','◆'], 1, 'Shapes'],
  ['Which word appeared first?', ['PLUM  MINT  SKY','Sky','Plum','Mint','Pear'], 1, 'Words'],
  ['What was the last digit?', ['4   7   2   9','4','7','2','9'], 3, 'Numbers'],
  ['Which symbol came before the square?', ['✦  ◆  ■  ●','✦','◆','■','●'], 1, 'Shapes'],
  ['Which word followed RIVER?', ['RIVER  MAPLE  CLOUD','Cloud','River','Maple','Ocean'], 2, 'Words'],
  ['What was the second digit?', ['8   3   5   1   6','8','5','3','1'], 2, 'Numbers'],
  ['What was the third shape?', ['▲  ✦  ◇  ■  ●','■','◇','✦','●'], 1, 'Shapes'],
  ['Which word came between LIME and WAVE?', ['LIME  DUSK  WAVE  MOSS','Dusk','Moss','Wave','Lime'], 0, 'Words']
];

export const mental = [
  ['A free Saturday opens up. What sounds best?', ['Try something on impulse','Explore a new place','See a friend','Catch up on projects','Enjoy a quiet routine'], 'Routine'],
  ['Your plans change at the last minute. What do you do?', ['Make up a new adventure','Look for a fun substitute','Ask others what works','Rearrange the day','Reschedule for another time'], 'Planning'],
  ['How do you shop for a bigger purchase?', ['Go with my gut','Ask a friend','Compare a few options','Save and compare carefully','Wait to see whether I still need it'], 'Planning'],
  ['What makes a conversation enjoyable?', ['Jokes and wild ideas','A surprising story','Shared interests','Thoughtful advice','Reflecting on life together'], 'Reflection'],
  ['What draws you to a hobby?', ['It looks fun right now','I can try something new','I can do it with friends','I can build a skill','It brings me a sense of calm'], 'Routine'],
  ['How do you process a disagreement?', ['Say how I feel straight away','Talk it out soon','Hear both perspectives','Take time to consider it','Think about the bigger picture'], 'Reflection']
];
