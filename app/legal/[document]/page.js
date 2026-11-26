import {notFound} from 'next/navigation';
import Footer, {Brand, legalLinks} from '../../footer.js';

const copy = {
  terms: [
    ['Using MindTest', 'MindTest offers three quizzes for personal exploration. Scores describe your answers to our quizzes. The IQ and Mental Age results are informal and have no clinical or standardized assessment status.'],
    ['Purchasing results', 'The result for a single attempt costs $1 USD. WayForPay processes the one-time payment. Your result and downloadable certificate become available after WayForPay confirms payment. Keep the result URL to return to your report.']
  ],
  privacy: [
    ['Quiz results', 'When you proceed to checkout, MindTest calculates your result and stores the score, category breakdown, quiz type, random attempt identifier, and payment status in Neon. The quiz answers are used to calculate that score.'],
    ['Payments', 'WayForPay collects payment details on its checkout page. MindTest verifies the payment notification and records the status and confirmation time. Card details are not stored in the MindTest database.'],
    ['Sharing', 'Anyone with your private result URL can view the report, so treat it as confidential. The sharing buttons on the results page use the public quiz link. Selecting a social platform opens its website.']
  ],
  cookies: [
    ['MindTest', 'The quiz, result and certificate features do not set cookies directly. The hosting provider may use cookies to maintain access and sign-in.'],
    ['Payment and sharing', 'WayForPay and social platforms may use their own cookies when you open their pages. You can manage cookies in your browser settings.']
  ]
};

export function generateStaticParams() {
  return Object.keys(legalLinks).map(document=>({document}));
}

export async function generateMetadata({params}, parent) {
  const {document}=await params;
  if (!Object.hasOwn(legalLinks,document)) return {title:'MindTest'};
  const title=legalLinks[document]+' | MindTest';
  const {openGraph, metadataBase}=await parent;
  const path='/legal/'+document;
  const url=metadataBase ? new URL(path,metadataBase) : path;
  return {title,openGraph:{...openGraph,title,url}};
}

export default async function LegalPage({params}) {
  const {document}=await params;
  if(!Object.hasOwn(copy,document)) notFound();
  return <>
    <header><div className="shell nav"><Brand/><a className="nav-link" href="/#tests">Tests</a><a className="button nav-button" href="/#tests">Choose a test</a></div></header>
    <main className="shell">
      <article className="panel legal-document">
        <h1>{legalLinks[document]}</h1>
        {copy[document].map(([heading,body])=><section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}
      </article>
    </main>
    <Footer/>
  </>;
}
