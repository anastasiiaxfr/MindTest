export const iqQuestionVersion = 'visual-v1';

const directions = ['up','right','down','left'];
const shapes = ['circle','square','diamond','triangle'];
const shape = (kind, outline = false) => ({kind,outline});
const arrow = angle => ({kind:'arrow',angle:angle%4});
const dots = count => ({kind:'dots',count});
const corner = angle => ({kind:'corner',angle:angle%4});
const pair = (outer, inner) => ({kind:'pair',outer,inner});
const tile = cells => ({kind:'tile',cells});
const rotate = (values, by) => [...values.slice(by),...values.slice(0,by)];

function question(prompt, cells, cols, correct, distractors, group, index) {
  const options = rotate([correct,...distractors],index%4);
  return [prompt,options,options.indexOf(correct),group,{cells:[...cells,null],cols}];
}

function sequence(cells, correct, distractors, index) {
  return question('Which tile comes next?',cells,cells.length+1,correct,distractors,'Patterns',index);
}

function matrix(cells, correct, distractors, group, index) {
  return question('Which tile completes the grid?',cells,3,correct,distractors,group,index);
}

export function describeFigure(figure) {
  switch(figure.kind) {
    case 'arrow': return 'Arrow pointing '+directions[figure.angle];
    case 'corner': return 'Dot in the '+['top left','top right','bottom right','bottom left'][figure.angle]+' corner';
    case 'dots': return figure.count+' '+(figure.count===1?'dot':'dots');
    case 'pair': return figure.inner+' inside '+figure.outer;
    case 'tile': return 'Marked squares: '+figure.cells.map(cell=>['top left','top right','bottom left','bottom right'][cell]).join(', ');
    default: return (figure.outline?'Outlined ':'Filled ')+figure.kind;
  }
}

const basic = [
  sequence([shape('circle'),shape('diamond'),shape('circle')],shape('diamond'),[shape('circle'),shape('square'),shape('triangle')],0),
  sequence([arrow(0),arrow(1),arrow(2)],arrow(3),[arrow(0),arrow(1),arrow(2)],1),
  sequence([dots(1),dots(2),dots(3)],dots(4),[dots(5),dots(2),dots(6)],2),
  sequence([corner(0),corner(1),corner(2)],corner(3),[corner(1),corner(2),corner(0)],3),
  sequence([shape('square'),shape('square',true),shape('circle'),shape('circle',true),shape('diamond')],shape('diamond',true),[shape('diamond'),shape('triangle',true),shape('circle',true)],5)
];

const rotations = [0,1,2,3,0].map((offset,i)=>{
  const row = start => [arrow(start),arrow(start+1),arrow(start+2)];
  const cells=[...row(offset),...row(offset+i%3+1),...row(offset+2+i%2)];
  const correct=cells.pop();
  return matrix(cells,correct,[arrow(correct.angle+1),arrow(correct.angle+2),arrow(correct.angle+3)],'Spatial reasoning',i+2);
});

const fillRules = [0,1,2,3,0].map((offset,i)=>{
  const kinds=rotate(shapes,offset).slice(0,3);
  const rule=i%2===0?[false,true,false]:[true,false,true];
  const figures=kinds.flatMap((kind,row)=>rotate(rule,row).map(outline=>shape(kind,outline)));
  const correct=figures.pop();
  return matrix(figures,correct,[shape(correct.kind,!correct.outline),shape(kinds[0],correct.outline),shape(kinds[1],!correct.outline)],'Patterns',i+3);
});

const combinations = [
  [[0],[1],[1],[3],[0],[2]],
  [[2],[0],[1],[2],[3],[0]],
  [[3],[2],[0],[2],[1],[3]],
  [[1],[3],[2],[1],[0],[3]],
  [[0],[3],[1],[2],[0],[2]]
].map((marks,i)=>{
  const figures=[];
  for(let row=0;row<3;row++){
    const left=marks[row*2], right=marks[row*2+1];
    figures.push(tile(left),tile(right),tile([...left,...right].sort()));
  }
  const correct=figures.pop();
  return matrix(figures,correct,[tile(marks[4]),tile(marks[5]),tile([0,1,2,3].filter(cell=>!correct.cells.includes(cell)))],'Deduction',i+1);
});

const nested = [
  [0,1,2,3],[1,3,0,2],[2,0,3,1],[3,2,1,0],[1,2,3,0]
].map(([a,b,c,d],i)=>{
  const outer=[a,b,c];
  const inner=[b,c,d];
  const figures=outer.flatMap((kind,row)=>rotate(inner,row).map(mark=>pair(shapes[kind],shapes[mark])));
  const correct=figures.pop();
  return matrix(figures,correct,[
    pair(shapes[c],shapes[b]),pair(shapes[a],correct.inner),pair(shapes[b],shapes[d])
  ],'Spatial reasoning',i+2);
});

export const iq = [
  ...basic,
  ...rotations,
  ...fillRules,
  ...combinations,
  ...nested
];
