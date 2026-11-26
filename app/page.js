import Experience from './experience.js';
import { homeSeo, privateRobots, publicMetadata, quizSeo, siteStructuredData } from '../lib/seo.js';

function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveRoute({test, result}) {
  const quiz = firstValue(test);
  return {
    test: Object.hasOwn(quizSeo, quiz) ? quiz : null,
    result: firstValue(result),
    privatePage: result !== undefined,
  };
}

export async function generateMetadata({searchParams}) {
  const route = resolveRoute(await searchParams);
  if (route.privatePage) {
    return {title: 'Private Quiz Result | MindTest', robots: privateRobots};
  }
  return publicMetadata(route.test ? quizSeo[route.test] : homeSeo);
}

export default async function Page({searchParams}) {
  const {test, result, privatePage} = resolveRoute(await searchParams);
  return <>
    {!test && !privatePage && <script type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(siteStructuredData).replace(/</g, '\\u003c'),
    }}/>}
    <Experience test={test} result={result}/>
  </>;
}
