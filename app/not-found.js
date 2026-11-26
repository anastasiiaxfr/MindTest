import Footer from './footer.js';
import { privateRobots } from '../lib/seo.js';

export const metadata = {
  title: 'Page Not Found | MindTest',
  robots: privateRobots,
};

export default function NotFoundPage() {
  return <>
    <main className="shell">
      <section className="panel">
        <h1>Page not found</h1>
        <p>Choose a test to continue on MindTest.</p>
        <a className="button primary" href="/#tests">Explore the tests</a>
      </section>
    </main>
    <Footer/>
  </>;
}
