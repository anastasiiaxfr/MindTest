import './style.css';

export const metadata = {
  title: 'MindTest — A little space for your mind',
  description: 'Explore how you think with three playful quizzes in logic, memory and mental age.'
};

export default function Layout({children}) {
  return <html lang="en"><body>{children}</body></html>;
}
