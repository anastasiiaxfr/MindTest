import Experience from './experience.js';
import {tests} from '../lib/tests.js';

export async function generateMetadata({searchParams}, parent) {
  const {test, result} = await searchParams;
  const path = result === undefined && typeof test === 'string' && Object.hasOwn(tests,test)
    ? '/?test=' + encodeURIComponent(test)
    : '/';

  const {openGraph, metadataBase} = await parent;
  const url = metadataBase ? new URL(path,metadataBase) : path;
  return {openGraph:{...openGraph,url}};
}

export default function Page() {
  return <Experience/>;
}
