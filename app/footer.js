export const legalLinks = {
  terms: 'Terms & Conditions',
  privacy: 'Privacy Policy',
  cookies: 'Cookie Policy'
};

export function Brand() {
  return <a className="brand" href="/" aria-label="MindTest home">
    <img src="/mindtest-mark.svg" alt="" width="34" height="34"/>
    MindTest<span className="brand-dot">.</span>
  </a>;
}

export default function Footer() {
  return <footer className="shell site-footer">
    <img className="footer-wordmark" src="/mindtest-wordmark.svg" alt="" width="925" height="142" loading="lazy"/>
    <div className="footer-panel">
      <div><Brand/><p>© {new Date().getUTCFullYear()} MindTest</p></div>
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
  </footer>;
}
