export const legalLinks = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  cookies: 'Cookie Policy'
};

export function Brand() {
  return <a className="brand" href="/" aria-label="MindTest home">
    <img src="/mindtest-mark.svg" alt="" width="100" height="72"/>
  </a>;
}

export default function Footer() {
  return <footer className="site-footer">
    <div className="shell">
      <img className="footer-wordmark" src="/mindtest-wordmark.svg" alt="" width="787" height="144" loading="lazy"/>
      <div className="footer-panel">
        <div><Brand/><p>© {new Date().getUTCFullYear()} MindTest. All rights reserved.</p></div>
        <nav className="footer-tests" aria-label="Tests">
          <h2>Explore</h2>
          <a href="/?test=iq">IQ Test</a>
          <a href="/?test=memory">Memory Test</a>
          <a href="/?test=mental-age">Mental Age</a>
        </nav>
        <nav aria-label="Legal">
          <h2>Legal</h2>
          {Object.entries(legalLinks).map(([key,title])=><a key={key} href={'/legal/'+key}>{title}</a>)}
        </nav>
      </div>
    </div>
  </footer>;
}
